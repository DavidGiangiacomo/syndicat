// Rendu DOM. Aucune logique de jeu ici : tout vient de engine.js.
import { GENERATORS } from './constants.js';
import * as E from './engine.js';
import { band, BAND_LABEL } from './memory.js';
import { CLAIM_BY_ID, claimText, objetDe } from './content.js';
import { fmtPieces, fmtRate, fmtPop, fmtPct, fmtMult, fmtClock } from './format.js';

const $ = (id) => document.getElementById(id);

export function initUI(handlers) {
  const gens = $('generators');
  for (const g of GENERATORS) {
    if (g.cost == null) continue;
    const row = document.createElement('div');
    row.className = 'gen';
    row.dataset.id = g.id;
    row.innerHTML = `
      <div class="gen-main"><span class="gen-name"></span></div>
      <div class="gen-effect"></div>
      <button class="gen-buy" type="button"><span class="gen-cost"></span><span class="gen-sub"></span></button>`;
    row.querySelector('.gen-buy').addEventListener('click', () => handlers.onBuy(g.id));
    if (g.id === 'cadence') {
      row.addEventListener('mouseenter', () => handlers.onHoverCadence());
      row.querySelector('.gen-buy').addEventListener('focus', () => handlers.onHoverCadence());
    }
    gens.appendChild(row);
  }
  $('etabli').addEventListener('click', () => handlers.onClick());
  $('reset').addEventListener('click', () => handlers.onReset());
  $('claim').addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-choice]');
    if (!b) return;
    handlers.onAnswer(b.dataset.choice);
  });
}

let lastJournalLen = -1;
let lastClaimKey = null;
let lastAct = 0;

export function render(state) {
  const app = $('app');
  if (state.act !== lastAct) {
    lastAct = state.act;
    app.className = `act-${state.act}`;
    $('social').hidden = state.act < 2;
    $('rendement-info').hidden = state.act < 2;
  }

  // Compteurs
  $('pieces').textContent = fmtPieces(state.pieces);
  $('rate').textContent = fmtRate(E.productionPerSec(state));
  $('etabli-effect').textContent = `+${fmtRate(E.clickValue(state))} pièce par clic`;

  if (state.act >= 2) {
    const d = E.rendementDetail(state);
    const info = $('rendement-info');
    info.textContent = `rendement ${fmtMult(d.total)}`;
    info.title =
      `Rendement = base × f(Rapport) × (1 − concessions)\n`
      + `f(R) = ${d.f.toFixed(2)} — plafond 1,00 : un bon Rapport n'améliore rien, il évite une pénalité.\n`
      + `Concessions accordées : −${fmtPct(d.conc, 1)}, pour toujours.`;
  }

  // Générateurs
  const cap = E.capacity(state);
  for (const row of document.querySelectorAll('.gen')) {
    const id = row.dataset.id;
    const g = GENERATORS.find((x) => x.id === id);
    const unlocked = E.isUnlocked(state, id);
    row.hidden = !unlocked;
    if (!unlocked) continue;
    const name = row.querySelector('.gen-name');
    const n = Math.floor(state.n);
    if (id === 'ouvrier') {
      // Le seul effet visuel du jeu.
      name.innerHTML = state.act >= 2
        ? `<b>${fmtPop(n)}</b> ${n > 1 ? 'personnes' : 'personne'}`
        : `Ouvrier <b>×${fmtPop(n)}</b>`;
    } else {
      name.innerHTML = `${g.name} <b>×${state.bought[id]}</b>`;
    }
    let effect = g.effect;
    if (id === 'ouvrier') effect = `${g.effect} · places : ${fmtPop(cap)}`;
    row.querySelector('.gen-effect').textContent = effect;
    const btn = row.querySelector('.gen-buy');
    const c = E.cost(state, id);
    btn.querySelector('.gen-cost').textContent = `${fmtPieces(c)} pièces`;
    const sub = btn.querySelector('.gen-sub');
    sub.textContent = id === 'ouvrier' && state.n >= cap ? 'plus de place' : '';
    btn.disabled = !E.canBuy(state, id);
  }

  // Réunion
  const meeting = $('meeting');
  if (state.meeting) {
    const claim = CLAIM_BY_ID[state.meeting.claimId];
    meeting.hidden = false;
    $('left').classList.add('dimmed');
    $('meeting-text').textContent = `avec ${claim.auteur}, à propos ${objetDe(claim.objet)} — ${Math.ceil(state.meeting.until - state.t)} s. La production est arrêtée.`;
  } else {
    meeting.hidden = true;
    $('left').classList.remove('dimmed');
  }

  // Bandeau : la Population, en clair, toujours
  const n = Math.floor(state.n);
  $('pop').textContent = fmtPop(n);
  $('pop-label').textContent = state.act >= 2 ? (n > 1 ? 'personnes' : 'personne') : (n > 1 ? 'ouvriers' : 'ouvrier');

  drawChart(state);

  if (state.act < 2) return;

  // Jauges
  const r = E.R(state);
  $('r-num').textContent = String(Math.round(r));
  $('r-bar').style.width = `${r}%`;
  $('r-band').textContent = BAND_LABEL[band(r)];
  $('t-num').textContent = String(Math.round(state.tension));
  $('t-bar').style.width = `${state.tension}%`;

  // Rumeur
  const rumor = $('rumor');
  rumor.hidden = !state.rumor;
  if (state.rumor) rumor.textContent = state.rumor.text;

  // Revendication
  renderClaim(state);

  // Journal (le plus récent en haut)
  if (state.journal.length !== lastJournalLen) {
    lastJournalLen = state.journal.length;
    const ol = $('journal');
    ol.innerHTML = '';
    for (let i = state.journal.length - 1; i >= 0; i--) {
      const e = state.journal[i];
      const li = document.createElement('li');
      li.className = `kind-${e.kind}`;
      li.innerHTML = `<span class="when">${fmtClock(e.t)}</span><span class="text"></span>`;
      li.querySelector('.text').textContent = e.text;
      ol.appendChild(li);
    }
  }
}

function renderClaim(state) {
  const box = $('claim');
  const cur = state.claims.current;
  const key = cur ? `${cur.id}:${cur.dossierRead}:${!!state.meeting}` : null;
  if (key === lastClaimKey) {
    if (cur) {
      const w = box.querySelector('.claim-wait');
      if (w) w.textContent = waitText(state, cur);
    }
    return;
  }
  lastClaimKey = key;
  box.hidden = !cur;
  if (!cur) { box.innerHTML = ''; return; }
  const claim = CLAIM_BY_ID[cur.id];
  const eff = claim.effets;
  const comp = claim.compromis;
  box.innerHTML = `
    <h3></h3>
    <div class="claim-meta"></div>
    <p class="claim-text"></p>
    <div class="claim-effects">Si accordé : −${fmtPct(eff.rendement, 1)} de rendement, pour toujours · +${eff.rapport} de Rapport, qui s'estompe.</div>
    <div class="claim-actions">
      <button type="button" data-choice="ceder">Céder</button>
      <button type="button" data-choice="dossier" ${cur.dossierRead ? 'disabled' : ''}>Négocier…</button>
      <button type="button" data-choice="refuser">Refuser<small>+8 de Tension</small></button>
    </div>
    ${cur.dossierRead ? `
    <div class="dossier">
      <div class="dossier-head">Ce que ${claim.auteur} accepterait</div>
      <p class="claim-text"></p>
      <div class="claim-effects">−${fmtPct(comp.effets.rendement, 1)} de rendement, pour toujours · +${comp.effets.rapport} de Rapport · +2 de Tension.</div>
      <div class="claim-actions">
        <button type="button" data-choice="negocier" ${state.meeting ? 'disabled' : ''}>Tenir la réunion<small>45 s, production arrêtée</small></button>
      </div>
    </div>` : ''}
    <div class="claim-wait"></div>`;
  box.querySelector('h3').textContent = claim.titre;
  box.querySelector('.claim-meta').textContent = `${claim.auteur}, poste ${claim.poste} — à propos ${objetDe(claim.objet)}`;
  box.querySelector('.claim-text').textContent = claimText(claim, state);
  if (cur.dossierRead) box.querySelectorAll('.claim-text')[1].textContent = comp.texte;
  box.querySelector('.claim-wait').textContent = waitText(state, cur);
}

function waitText(state, cur) {
  const w = state.t - cur.arrivedAt;
  if (w < 120) return '';
  return `Sans réponse depuis ${fmtClock(w)}.`;
}

function drawChart(state) {
  const canvas = $('chart');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const pts = state.history.slice(-240);
  if (pts.length < 2) return;
  const vals = pts.map((p) => Math.max(0.1, p[1]));
  const lo = Math.log10(Math.min(...vals));
  const hi = Math.log10(Math.max(...vals) * 1.05);
  const span = Math.max(0.3, hi - lo);
  ctx.strokeStyle = '#1c1b18';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  pts.forEach((p, i) => {
    const x = (i / (240 - 1)) * W;
    const y = H - ((Math.log10(Math.max(0.1, p[1])) - lo) / span) * (H - 6) - 3;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();
}

export function showReport(report) {
  const dlg = $('report');
  const ol = $('report-lines');
  ol.innerHTML = '';
  for (const line of report.lines) {
    const li = document.createElement('li');
    li.textContent = line;
    ol.appendChild(li);
  }
  if (typeof dlg.showModal === 'function') dlg.showModal();
}

export function renderDebug(state) {
  const box = $('debug');
  if (box.hidden) return;
  const d = E.rendementDetail(state);
  const h = E.hesitation(state);
  box.querySelector('.debug-text').textContent =
    `t=${fmtClock(state.t)} act=${state.act} stage=${state.threshold.stage}\n`
    + `R=${d.r.toFixed(2)} f=${d.f.toFixed(3)} conc=${d.conc.toFixed(3)} T=${state.tension.toFixed(1)}\n`
    + `N=${state.n.toFixed(1)} cap=${E.capacity(state)} mem=${state.memory.length} clock=${state.claims.clock.toFixed(2)}\n`
    + `pool=${E.eligibleClaims(state).map((c) => c.id).join(',')} done=${state.claims.done.join(',')}\n`
    + `hésitation: ${h ? JSON.stringify(h) : '—'}`;
}

export function initDebug(handlers) {
  const box = $('debug');
  box.hidden = false;
  box.innerHTML = `<div class="debug-text"></div>
    <button type="button" data-d="pieces">+10 000 pièces</button>
    <button type="button" data-d="n490">N → 490</button>
    <button type="button" data-d="skip">+5 min</button>
    <button type="button" data-d="offline">Absence 8 h</button>`;
  box.addEventListener('click', (ev) => {
    const b = ev.target.closest('button[data-d]');
    if (b) handlers.onDebug(b.dataset.d);
  });
}
