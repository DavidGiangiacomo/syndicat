// Moteur pur : aucune dépendance au DOM. Tout l'état est plat et sérialisable.

import * as C from './constants.js';
import { rapport, band, fR } from './memory.js';
import {
  CLAIMS, CLAIM_BY_ID, THRESHOLD_LINES,
  CADENCE_LINES, CADENCE_LINES_MORE, ATELIER_LINES, ATELIER_LINES_MORE,
  MILESTONE_LINES, BAND_LINES, TENSION_MAX_LINE, RUMORS, objetDe,
} from './content.js';
import { fmtInt, fmtDuration } from './format.js';

// ---------- RNG déterministe (mulberry32), graine stockée dans l'état ----------
export function rand(state) {
  let a = (state.seed = (state.seed + 0x6d2b79f5) | 0);
  a = Math.imul(a ^ (a >>> 15), a | 1);
  a ^= a + Math.imul(a ^ (a >>> 7), a | 61);
  return ((a ^ (a >>> 14)) >>> 0) / 4294967296;
}
function pick(state, arr) {
  return arr[Math.floor(rand(state) * arr.length)];
}

// ---------- État ----------
export function createState(seed = (Date.now() & 0x7fffffff)) {
  return {
    version: C.SAVE_VERSION,
    seed,
    t: 0,                   // temps social, en secondes (avance à 100 % hors ligne)
    playedT: 0,             // temps de jeu effectif
    savedAt: null,          // horodatage mural de la dernière sauvegarde (ms)
    pieces: 0,
    totalPieces: 0,
    clicks: 0,
    n: 1,                   // Population — jamais scientifique
    bought: { ouvrier: 0, formation: 0, cadence: 0, atelier: 0 },
    act: 1,
    threshold: { stage: 0, at: null },
    memory: [],             // { type, amount, t, ref }
    decisions: [],          // le procès-verbal : { t, claimId, choice, demanded, granted }
    tension: 0,
    claims: { done: [], current: null, clock: 0 },
    meeting: null,          // { claimId, until }
    journal: [],            // { t, text, kind }
    rumor: null,            // { text, until }
    lastBand: 'calme',
    milestones: [],
    tensionMaxSaid: false,
    metrics: {
      cadenceUnlockedAt: null, cadenceAffordableAt: null,
      cadenceFirstHoverAt: null, cadenceFirstBuyAt: null,
      cadenceHoverCount: 0,
    },
    history: [],            // [t, prodPerSec] toutes les 5 s
    historyAt: 0,
  };
}

// ---------- Dérivés ----------
export function R(state) {
  return rapport(state.memory, state.t);
}

export function capacity(state) {
  return C.BASE_CAPACITY + C.ATELIER_CAPACITY * state.bought.atelier;
}

export function cadenceMult(state) {
  return C.CADENCE_MULT ** state.bought.cadence;
}

// Somme des concessions accordées : plafond de rendement, définitif.
export function concessionPenalty(state) {
  let p = 0;
  for (const d of state.decisions) p += d.granted?.rendement ?? 0;
  return Math.min(0.9, p);
}

export function rendementDetail(state) {
  const r = R(state);
  const f = state.act >= 2 ? fR(r) : 1;
  const conc = concessionPenalty(state);
  return { r, f, conc, total: f * (1 - conc) };
}

export function rendement(state) {
  return rendementDetail(state).total;
}

export function baseProduction(state) {
  return state.n * C.WORKER_PROD + state.bought.atelier * C.ATELIER_PROD;
}

export function productionPerSec(state) {
  if (state.meeting) return 0;
  return baseProduction(state) * cadenceMult(state) * rendement(state);
}

export function clickValue(state) {
  return C.CLICK_PROD * cadenceMult(state) * rendement(state);
}

export function cost(state, id) {
  const g = C.GEN_BY_ID[id];
  if (!g || g.cost == null) return null;
  return Math.ceil(g.cost * g.growth ** state.bought[id]);
}

export function isUnlocked(state, id) {
  return C.GEN_BY_ID[id].act <= state.act;
}

export function canBuy(state, id) {
  const c = cost(state, id);
  if (c == null || !isUnlocked(state, id)) return false;
  if (state.meeting) return false;
  if (id === 'ouvrier' && state.n >= capacity(state)) return false;
  return state.pieces >= c;
}

export function log(state, text, kind = 'journal') {
  state.journal.push({ t: state.t, text, kind });
  if (state.journal.length > 400) state.journal.splice(0, state.journal.length - 400);
}

// ---------- Actions ----------
export function click(state) {
  if (state.meeting) return 0;
  const v = clickValue(state);
  state.pieces += v;
  state.totalPieces += v;
  state.clicks++;
  return v;
}

export function buy(state, id) {
  if (!canBuy(state, id)) return false;
  state.pieces -= cost(state, id);
  state.bought[id]++;
  switch (id) {
    case 'ouvrier':
      state.n += 1;
      break;
    case 'cadence': {
      state.memory.push({ type: 'cadence', amount: C.CADENCE_R, t: state.t, ref: state.bought.cadence });
      if (state.metrics.cadenceFirstBuyAt == null) state.metrics.cadenceFirstBuyAt = state.t;
      const k = state.bought.cadence - 1;
      log(state, k < CADENCE_LINES.length ? CADENCE_LINES[k] : pick(state, CADENCE_LINES_MORE));
      break;
    }
    case 'atelier': {
      const k = state.bought.atelier - 1;
      log(state, k < ATELIER_LINES.length ? ATELIER_LINES[k] : pick(state, ATELIER_LINES_MORE));
      break;
    }
    default:
      break;
  }
  return true;
}

export function markCadenceHover(state) {
  if (state.act < 2) return;
  state.metrics.cadenceHoverCount++;
  if (state.metrics.cadenceFirstHoverAt == null) state.metrics.cadenceFirstHoverAt = state.t;
}

// ---------- Revendications ----------
export function eligibleClaims(state) {
  return CLAIMS.filter((c) => {
    if (state.claims.done.includes(c.id)) return false;
    if (state.claims.current && state.claims.current.id === c.id) return false;
    for (const [k, v] of Object.entries(c.conditions)) {
      if (k === 'n') { if (state.n < v) return false; }
      else if ((state.bought[k] ?? 0) < v) return false;
    }
    return true;
  });
}

function presentClaim(state, id) {
  const claim = CLAIM_BY_ID[id];
  state.claims.current = { id, arrivedAt: state.t, dossierRead: false };
  state.claims.clock = 0;
  log(state, `${claim.auteur} demande à vous parler, à propos ${objetDe(claim.objet)}.`, 'claim');
}

export function openDossier(state) {
  if (state.claims.current) state.claims.current.dossierRead = true;
}

// choice : 'ceder' | 'refuser' | 'negocier'
export function answerClaim(state, choice) {
  const cur = state.claims.current;
  if (!cur || state.meeting) return false;
  const claim = CLAIM_BY_ID[cur.id];
  if (choice === 'negocier') {
    if (!cur.dossierRead) return false; // négocier demande de lire le dossier
    state.meeting = { claimId: cur.id, until: state.t + C.MEETING_DURATION };
    log(state, `Réunion avec ${claim.auteur}, à propos ${objetDe(claim.objet)}. La production est arrêtée.`, 'meeting');
    return true;
  }
  resolveClaim(state, choice);
  return true;
}

function resolveClaim(state, choice) {
  const cur = state.claims.current;
  const claim = CLAIM_BY_ID[cur.id];
  const demanded = { ...claim.effets };
  let granted = null;
  if (choice === 'ceder') {
    granted = { ...claim.effets };
    state.memory.push({ type: 'concession', amount: claim.effets.rapport, t: state.t, ref: claim.id });
    state.tension = clamp(state.tension + C.T_CEDE);
  } else if (choice === 'negocier') {
    granted = { ...claim.compromis.effets };
    state.memory.push({ type: 'concession', amount: claim.compromis.effets.rapport, t: state.t, ref: claim.id });
    state.tension = clamp(state.tension + C.T_NEGOCIE);
  } else {
    granted = { rendement: 0, rapport: 0 };
    state.memory.push({ type: 'refus', amount: C.REFUS_AMOUNT, t: state.t, ref: claim.id });
    state.tension = clamp(state.tension + C.T_REFUS);
  }
  state.decisions.push({ t: state.t, claimId: claim.id, choice, demanded, granted, waited: state.t - cur.arrivedAt });
  state.claims.done.push(claim.id);
  state.claims.current = null;
  state.claims.clock = 0;
  log(state, claim.reactions[choice], 'reaction');
}

function clamp(x, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, x));
}

// ---------- Tick ----------
// opts.prodFactor : 1 en jeu, 0,6 hors ligne (plafonné à 8 h), 0 au-delà.
export function tick(state, dt, opts = {}) {
  const prodFactor = opts.prodFactor ?? 1;
  const before = state.t;
  state.t += dt;
  if (prodFactor >= 1) state.playedT += dt;

  // Réunion en cours ?
  if (state.meeting && state.t >= state.meeting.until) {
    state.meeting = null;
    resolveClaim(state, 'negocier');
  }

  // Production
  const prod = productionPerSec(state) * prodFactor;
  state.pieces += prod * dt;
  state.totalPieces += prod * dt;

  // Auto-réplication : chaque ouvrier en forme un autre, jusqu'à la capacité.
  if (state.bought.formation > 0 && !state.meeting) {
    const rate = C.TUNING.formationRate * state.bought.formation * prodFactor;
    const cap = capacity(state);
    if (state.n < cap) state.n = Math.min(cap, state.n * Math.exp(rate * dt));
  }

  // Le passage des 500
  advanceThreshold(state);

  if (state.act >= 2) social(state, dt, before);

  // Courbe
  if (state.t - state.historyAt >= 5) {
    state.historyAt = state.t;
    state.history.push([Math.round(state.t), productionPerSec(state)]);
    if (state.history.length > 360) state.history.splice(0, state.history.length - 360);
  }
}

function advanceThreshold(state) {
  const th = state.threshold;
  if (th.stage === 0) {
    if (state.n >= C.THRESHOLD_N) {
      th.stage = 1; th.at = state.t;
      log(state, THRESHOLD_LINES[0], 'name');
    }
    return;
  }
  if (th.stage >= C.THRESHOLD_STAGES.length) return;
  const next = th.stage; // index de la prochaine étape
  if (state.t - th.at < C.THRESHOLD_STAGES[next]) return;
  th.stage = next + 1;
  if (next === 1) log(state, THRESHOLD_LINES[1], 'name');
  if (next === 2) {
    state.act = 2; // le libellé change ; la Cadence et l'Atelier sont disponibles
    state.metrics.cadenceUnlockedAt = state.t;
  }
  if (next === 3) presentClaim(state, 'pause');
}

function social(state, dt, before) {
  const r = R(state);
  const b = band(r);

  // Tension : ne redescend jamais toute seule (sauf temps long sous R > 60)
  let dT = 0;
  if (r > 60) dT -= C.T_DECAY_PER_MIN;
  else if (b === 'frictions') dT += C.T_FRICTIONS_PER_MIN;
  else dT += C.T_CONFLIT_PER_MIN;
  if (state.claims.current) dT += C.T_PENDING_PER_MIN;
  state.tension = clamp(state.tension + (dT / 60) * dt);
  if (state.tension >= 100 && !state.tensionMaxSaid) {
    state.tensionMaxSaid = true;
    log(state, TENSION_MAX_LINE, 'system');
  }
  if (state.tension < 90) state.tensionMaxSaid = false;

  // Changement de régime
  if (b !== state.lastBand) {
    state.lastBand = b;
    log(state, BAND_LINES[b], 'band');
    state.rumor = null;
  }

  // Rumeurs (bandeau) en frictions et conflit
  if (b !== 'calme') {
    if (!state.rumor || state.t >= state.rumor.until) {
      state.rumor = { text: pick(state, RUMORS[b]), until: state.t + 60 + rand(state) * 60 };
    }
  } else {
    state.rumor = null;
  }

  // Tirage des revendications, une fois la première (scénarisée) passée
  if (state.threshold.stage >= C.THRESHOLD_STAGES.length && !state.claims.current && !state.meeting) {
    const pool = eligibleClaims(state);
    if (pool.length > 0) {
      const rate = (1 / C.CLAIM_INTERVAL[b]) * (1 + state.tension / 100);
      state.claims.clock += rate * dt;
      if (state.claims.clock >= 1) presentClaim(state, pick(state, pool).id);
    }
  }

  // Mesure du prototype : quand la Cadence devient abordable
  if (state.metrics.cadenceAffordableAt == null && state.pieces >= cost(state, 'cadence')) {
    state.metrics.cadenceAffordableAt = state.t;
  }

  // Jalons de population
  for (const m of Object.keys(MILESTONE_LINES).map(Number)) {
    if (state.n >= m && !state.milestones.includes(m)) {
      state.milestones.push(m);
      log(state, MILESTONE_LINES[m], m >= C.ACT3_N ? 'system' : 'journal');
    }
  }
  void before;
}

// ---------- Hors-ligne (§9) ----------
// Production à 60 %, plafonnée à 8 h. Rapport et Tension à 100 %, sans plafond (30 jours de garde-fou).
// Retourne un compte rendu de deux à cinq lignes, généré par gabarit.
export function applyOffline(state, elapsed) {
  elapsed = Math.min(Math.max(0, elapsed), C.OFFLINE_SOCIAL_CAP);
  if (elapsed < C.OFFLINE_MIN) {
    if (elapsed > 0) simulate(state, elapsed);
    return null;
  }
  const snap = {
    pieces: state.pieces, n: state.n, r: R(state), tension: state.tension,
    act: state.act, claimId: state.claims.current?.id ?? null,
    claimsDone: state.claims.done.length, journalLen: state.journal.length,
    band: band(R(state)),
  };
  simulate(state, elapsed);
  return offlineReport(state, snap, elapsed);
}

function simulate(state, elapsed) {
  let done = 0;
  while (done < elapsed) {
    const inProd = done < C.OFFLINE_PROD_CAP;
    const step = Math.min(inProd ? 10 : 300, elapsed - done);
    tick(state, step, { prodFactor: inProd ? C.OFFLINE_PROD_FACTOR : 0, offline: true });
    done += step;
  }
}

export function offlineReport(state, snap, elapsed) {
  const lines = [];
  const pieces = state.pieces - snap.pieces;
  const grew = Math.floor(state.n) - Math.floor(snap.n);
  const r0 = Math.round(snap.r);
  const r1 = Math.round(R(state));
  const dur = fmtDuration(elapsed);

  // G1 — toujours
  lines.push(`Vous êtes resté absent ${dur}. L'atelier a tourné à 60 % : ${fmtInt(pieces)} pièces.`);

  if (state.act < 2) {
    if (grew > 0) lines.push(`${fmtInt(grew)} ouvriers de plus, formés par les autres.`);
    return { elapsed, lines };
  }

  // G2 — le passage des 500 a eu lieu sans vous
  if (snap.act < 2) {
    lines.push("Pendant ce temps, deux d'entre eux ont eu un nom. Puis trois.");
  }

  // G3 — une revendication arrivée pendant l'absence / G4 — une revendication laissée en attente
  const cur = state.claims.current ? CLAIM_BY_ID[state.claims.current.id] : null;
  if (cur && snap.claimId !== cur.id) {
    lines.push(`${cur.auteur} a laissé un mot sur votre table, à propos ${objetDe(cur.objet)}. Il y est encore.`);
  } else if (cur && snap.claimId === cur.id) {
    const il = cur.pronom === 'elle' ? 'Elle' : 'Il';
    lines.push(`${cur.auteur} attend toujours une réponse. ${il} en a parlé aux autres.`);
  }

  // G5 — le Rapport a bougé
  if (r1 <= r0 - 3) lines.push(`Le Rapport a glissé de ${r0} à ${r1}. Personne ne vous en a parlé.`);
  else if (r1 >= r0 + 3) lines.push(`Les choses se sont un peu tassées. Le Rapport est remonté de ${r0} à ${r1}.`);

  // G6 — la tension
  if (state.tension >= 100) lines.push('La tension est à son comble. On a parlé de vous dans les vestiaires.');
  else if (state.tension - snap.tension >= 10) lines.push(`La tension a monté pendant votre absence (${Math.round(snap.tension)} → ${Math.round(state.tension)}).`);

  // G7 — les nouveaux
  if (grew >= 20) lines.push(`${fmtInt(grew)} personnes de plus, formées par les autres. Vous n'en connaissez aucune.`);

  // Rien de social à dire : ce n'est pas nécessairement bon signe
  if (lines.length === 1 && snap.band !== 'calme') lines.push("Rien à signaler. Ce n'est pas nécessairement bon signe.");

  return { elapsed, lines: lines.slice(0, 5) };
}

// ---------- Débogage / mesures du prototype ----------
export function hesitation(state) {
  const m = state.metrics;
  const from = m.cadenceAffordableAt ?? m.cadenceUnlockedAt;
  if (from == null) return null;
  return {
    unlockedAt: m.cadenceUnlockedAt,
    affordableAt: m.cadenceAffordableAt,
    firstHoverAt: m.cadenceFirstHoverAt,
    firstBuyAt: m.cadenceFirstBuyAt,
    hoverCount: m.cadenceHoverCount,
    // temps d'hésitation : entre le moment où la Cadence est abordable et le premier achat
    seconds: m.cadenceFirstBuyAt == null ? null : m.cadenceFirstBuyAt - from,
  };
}
