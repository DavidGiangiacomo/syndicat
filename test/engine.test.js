import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/engine.js';
import * as C from '../src/constants.js';
import { fR, rapport, band } from '../src/memory.js';
import { CLAIMS } from '../src/content.js';
import { fmtInt, fmtPieces, fmtPop } from '../src/format.js';

function run(state, seconds, opts) {
  for (let i = 0; i < seconds * 10; i++) E.tick(state, 0.1, opts);
}

test('I2 — f(R) est monotone croissante et plafonnée à 1', () => {
  let prev = -1;
  for (let r = 0; r <= 100; r += 0.5) {
    const f = fR(r);
    assert.ok(f <= 1, `f(${r}) = ${f} > 1`);
    assert.ok(f >= prev - 1e-12, `f non monotone en ${r}`);
    prev = f;
  }
  assert.equal(fR(100), 1);
  assert.equal(fR(80), 1);
  assert.ok(fR(50) < 1);
});

test('Mémoire de l\'atelier — R se dérive de l\'historique, avec oubli asymétrique', () => {
  const t0 = 1000;
  const refus = [{ type: 'refus', amount: C.REFUS_AMOUNT, t: t0 }];
  assert.ok(Math.abs(rapport(refus, t0) - (C.R_BASE + C.REFUS_AMOUNT)) < 1e-9, 'un refus pèse 1,0 à l\'instant');
  const afterHour = rapport(refus, t0 + 3600);
  assert.ok(afterHour < C.R_BASE, 'un refus ne s\'oublie jamais tout à fait');
  assert.ok(afterHour > C.R_BASE + C.REFUS_AMOUNT * 0.5, 'mais il décroît vers 0,4');

  const conc = [{ type: 'concession', amount: 8, t: t0 }];
  assert.ok(rapport(conc, t0) - C.R_BASE < 0.5, 'une concession ne se fait pas sentir d\'un coup');
  const peak = Math.max(...Array.from({ length: 60 }, (_, i) => rapport(conc, t0 + i * 5)));
  assert.ok(peak > C.R_BASE + 6, 'elle atteint presque +8 sur quelques minutes');
  assert.ok(rapport(conc, t0 + 1200) < C.R_BASE + 2, 'et s\'estompe en vingt minutes');

  const cad = [{ type: 'cadence', amount: C.CADENCE_R, t: t0 }];
  assert.equal(rapport(cad, t0 + 1e6), C.R_BASE + C.CADENCE_R, 'une cadence est permanente');
});

test('I1 — acte I : aucun élément social avant les 500', () => {
  const s = E.createState(1);
  s.pieces = 1e6;
  E.buy(s, 'formation');
  assert.equal(E.isUnlocked(s, 'cadence'), false);
  assert.equal(E.isUnlocked(s, 'atelier'), false);
  assert.equal(E.buy(s, 'cadence'), false);
  run(s, 60);
  assert.equal(s.journal.length, 0);
  assert.equal(s.act, 1);
  assert.equal(E.rendementDetail(s).f, 1);
});

test('Le passage des 500 : un nom, puis les noms, puis le libellé, puis la revendication', () => {
  const s = E.createState(2);
  s.n = 499.99;
  s.bought.formation = 1;
  run(s, 2); // la formation franchit 500
  assert.ok(s.n >= 500);
  assert.equal(s.threshold.stage, 1);
  assert.equal(s.journal[0].text, 'Marthe a demandé une pause. Elle a repris après.');
  assert.equal(s.act, 1, 'le libellé ne change pas encore');
  const at = s.threshold.at;
  run(s, at + 24 - s.t);
  assert.equal(s.threshold.stage, 1);
  run(s, 2);
  assert.equal(s.threshold.stage, 2);
  assert.equal(s.act, 1);
  run(s, at + 51 - s.t);
  assert.equal(s.threshold.stage, 3);
  assert.equal(s.act, 2, 'le libellé change et la Cadence est disponible');
  assert.equal(E.isUnlocked(s, 'cadence'), true);
  assert.ok(Math.abs(s.metrics.cadenceUnlockedAt - (s.threshold.at + 50)) < 0.2);
  assert.equal(s.claims.current, null);
  run(s, 35);
  assert.equal(s.threshold.stage, 4);
  assert.equal(s.claims.current?.id, 'pause', 'la première revendication est celle de Marthe');
});

test('La Cadence : ×1,3 contre −4 de Rapport, et la mesure d\'hésitation', () => {
  const s = E.createState(3);
  s.n = 500; s.threshold = { stage: 4, at: 0 }; s.act = 2; s.metrics.cadenceUnlockedAt = 0;
  s.pieces = 100000;
  run(s, 1);
  assert.equal(s.metrics.cadenceAffordableAt, 0.1);
  const before = E.productionPerSec(s);
  run(s, 20);
  E.markCadenceHover(s);
  assert.ok(E.buy(s, 'cadence'));
  assert.ok(Math.abs(E.productionPerSec(s) / before - 1.3) < 1e-9);
  assert.ok(Math.abs(E.R(s) - (C.R_BASE - 4)) < 1e-9);
  const h = E.hesitation(s);
  assert.ok(Math.abs(h.cadence.seconds - 21) < 0.2, `hésitation mesurée : ${h.cadence.seconds}`);
  assert.equal(h.cadence.hoverCount, 1);
  E.markCadenceHover(s);
  assert.equal(E.hesitation(s).cadence.hoverCount, 1, 'les survols après le premier achat ne comptent pas');
  // Le témoin : l'Atelier, abordable au même moment, sans coût moral
  assert.ok(Math.abs(h.atelier.affordableAt - 0.1) < 1e-9);
  assert.equal(h.atelier.seconds, null);
  run(s, 5);
  E.buy(s, 'atelier');
  assert.ok(Math.abs(E.hesitation(s).atelier.seconds - 26) < 0.2);
});

test('La revendication de Sabine arrive en réaction à la deuxième Cadence, dans les deux minutes', () => {
  const s = E.createState(13);
  s.n = 600; s.threshold = { stage: 4, at: 0 }; s.act = 2; s.pieces = 1e6;
  E.buy(s, 'cadence');
  assert.equal(s.claims.forced, null);
  E.buy(s, 'cadence');
  assert.equal(s.claims.forced?.id, 'cadence');
  assert.ok(s.claims.forced.at >= s.t + C.CADENCE_CLAIM_DELAY[0] && s.claims.forced.at <= s.t + C.CADENCE_CLAIM_DELAY[1]);
  // une autre revendication occupe la table : Sabine attend qu'elle soit libre
  s.claims.current = { id: 'pause', arrivedAt: s.t, dossierRead: false };
  run(s, 130);
  assert.equal(s.claims.current.id, 'pause');
  E.answerClaim(s, 'ceder');
  run(s, 1);
  assert.equal(s.claims.current?.id, 'cadence');
  assert.equal(s.claims.forced, null);
  // jamais deux fois : une troisième Cadence ne la reprogramme pas
  E.answerClaim(s, 'refuser');
  E.buy(s, 'cadence');
  assert.equal(s.claims.forced, null);
});

test('Revendications : céder coûte du rendement pour toujours ; refuser se paie en Tension', () => {
  const s = E.createState(4);
  s.n = 600; s.threshold = { stage: 4, at: 0 }; s.act = 2;
  s.claims.current = { id: 'pause', arrivedAt: 0, dossierRead: false };
  assert.equal(E.answerClaim(s, 'negocier'), false, 'négocier demande de lire le dossier');
  E.answerClaim(s, 'ceder');
  assert.equal(s.claims.current, null);
  assert.deepEqual(s.claims.done, ['pause']);
  assert.ok(Math.abs(E.concessionPenalty(s) - 0.03) < 1e-9);
  run(s, 600);
  assert.ok(Math.abs(E.concessionPenalty(s) - 0.03) < 1e-9, 'la pénalité ne s\'oublie pas');
  assert.ok(E.R(s) < C.R_BASE + 8 && E.R(s) > C.R_BASE, 'le Rapport a monté puis s\'estompe');

  s.claims.current = { id: 'eclairage', arrivedAt: s.t, dossierRead: false };
  const t0 = s.tension;
  E.answerClaim(s, 'refuser');
  assert.equal(s.tension, t0 + C.T_REFUS);
  assert.ok(E.R(s) < C.R_BASE);
  assert.equal(s.decisions.length, 2);
  assert.equal(s.decisions[1].choice, 'refuser');
});

test('Négocier coûte du temps réel : la production s\'arrête pendant la réunion', () => {
  const s = E.createState(5);
  s.n = 600; s.threshold = { stage: 4, at: 0 }; s.act = 2;
  s.claims.current = { id: 'outil', arrivedAt: 0, dossierRead: false };
  E.openDossier(s);
  assert.ok(E.answerClaim(s, 'negocier'));
  assert.ok(s.meeting);
  assert.equal(E.productionPerSec(s), 0);
  const p = s.pieces;
  run(s, 10);
  assert.equal(s.pieces, p);
  run(s, C.MEETING_DURATION);
  assert.equal(s.meeting, null);
  assert.equal(s.claims.done[0], 'outil');
  assert.ok(Math.abs(E.concessionPenalty(s) - 0.015) < 1e-9, 'résultat intermédiaire');
  assert.ok(E.productionPerSec(s) > 0);
});

test('Jamais deux fois la même revendication ; les conditions filtrent le pool', () => {
  const s = E.createState(6);
  s.n = 600; s.threshold = { stage: 4, at: 0 }; s.act = 2;
  const pool0 = E.eligibleClaims(s).map((c) => c.id);
  assert.ok(!pool0.includes('cadence'), 'la revendication sur la cadence exige deux niveaux de Cadence');
  assert.ok(!pool0.includes('nouveaux'));
  s.bought.cadence = 2; s.bought.formation = 4; s.bought.atelier = 1;
  assert.equal(E.eligibleClaims(s).length, CLAIMS.length);
  const seen = [];
  for (let i = 0; i < 20 && seen.length < CLAIMS.length; i++) {
    s.claims.clock = 1;
    run(s, 1);
    if (s.claims.current) {
      assert.ok(!seen.includes(s.claims.current.id));
      seen.push(s.claims.current.id);
      E.answerClaim(s, 'ceder');
    }
  }
  assert.equal(seen.length, CLAIMS.length);
  s.claims.clock = 5;
  run(s, 5);
  assert.equal(s.claims.current, null, 'le pool épuisé ne produit plus rien');
});

test('Règle n°3 — la Tension ne redescend que sous R > 60, et monte avec une demande sans réponse', () => {
  const s = E.createState(7);
  s.n = 600; s.threshold = { stage: 4, at: 0 }; s.act = 2;
  s.tension = 50;
  run(s, 60);
  assert.ok(Math.abs(s.tension - (50 - C.T_DECAY_PER_MIN)) < 0.01);
  for (let i = 0; i < 6; i++) s.memory.push({ type: 'cadence', amount: C.CADENCE_R, t: 0 }); // R = 56
  const t1 = s.tension;
  run(s, 60);
  assert.ok(s.tension > t1, 'en frictions, la tension monte');
  s.claims.current = { id: 'pause', arrivedAt: s.t, dossierRead: false };
  const t2 = s.tension;
  run(s, 60);
  assert.ok(Math.abs((s.tension - t2) - (C.T_FRICTIONS_PER_MIN + C.T_PENDING_PER_MIN)) < 0.01);
});

test('Hors-ligne : production à 60 % plafonnée à 8 h, social à 100 %, compte rendu de 2 à 5 lignes', () => {
  const s = E.createState(8);
  s.n = 600; s.threshold = { stage: 4, at: 0 }; s.act = 2; s.bought.cadence = 3;
  s.memory.push({ type: 'cadence', amount: C.CADENCE_R, t: 0 }, { type: 'cadence', amount: C.CADENCE_R, t: 0 }, { type: 'cadence', amount: C.CADENCE_R, t: 0 });
  s.claims.current = { id: 'pause', arrivedAt: 0, dossierRead: false };
  const online = structuredClone(s);
  run(online, 3600);
  const offline = structuredClone(s);
  const report = E.applyOffline(offline, 3600);
  assert.ok(offline.pieces < online.pieces * 0.65 && offline.pieces > online.pieces * 0.55, 'production à 60 %');
  assert.ok(Math.abs(offline.t - online.t) < 1e-6, 'le temps social avance à 100 %');
  assert.ok(Math.abs(offline.tension - online.tension) < 0.5, 'la Tension évolue à 100 %');
  assert.ok(report.lines.length >= 2 && report.lines.length <= 5, `${report.lines.length} lignes`);
  assert.match(report.lines[0], /absent 1\u202Fh/);
  assert.ok(report.lines.some((l) => l.startsWith('Marthe attend toujours')));

  const long = structuredClone(s);
  const r2 = E.applyOffline(long, 24 * 3600);
  const eight = structuredClone(s);
  E.applyOffline(eight, 8 * 3600);
  assert.ok(Math.abs(long.pieces - eight.pieces) / eight.pieces < 0.02, 'la production plafonne à 8 h');
  assert.ok(long.t > eight.t, 'le social, lui, ne plafonne pas');
  assert.match(r2.lines[0], /absent 24\u202Fh/);
});

test('Hors-ligne court : pas de compte rendu, mais le temps passe', () => {
  const s = E.createState(9);
  s.n = 10;
  assert.equal(E.applyOffline(s, 30), null);
  assert.ok(Math.abs(s.t - 30) < 1e-9);
});

test('Acte I hors-ligne : le compte rendu ne contient rien de social', () => {
  const s = E.createState(10);
  s.n = 40; s.bought.formation = 2;
  const r = E.applyOffline(s, 2 * 3600);
  assert.ok(r.lines.length <= 2);
  for (const l of r.lines) assert.doesNotMatch(l, /Rapport|Marthe|tension|nom/i);
});

test('Le passage des 500 hors-ligne est raconté au retour', () => {
  const s = E.createState(11);
  s.n = 450; s.bought.formation = 8;
  const r = E.applyOffline(s, 3 * 3600);
  assert.equal(s.act, 2);
  assert.ok(r.lines.some((l) => /ont eu un nom/.test(l)));
  assert.ok(s.claims.current, 'une revendication attend sur la table');
});

test('I3 — la Population n\'est jamais scientifique ; les Pièces le deviennent au-delà de 10⁹', () => {
  assert.equal(fmtPop(40000), '40\u202F000');
  assert.equal(fmtPop(1274), '1\u202F274');
  assert.equal(fmtInt(999), '999');
  assert.equal(fmtPieces(123456), '123\u202F456');
  assert.equal(fmtPieces(3.2e12), '3,2·10¹²');
});

test('Capacité : la Formation plafonne, l\'Atelier ajoute des places', () => {
  const s = E.createState(12);
  s.n = 499.9; s.bought.formation = 10;
  run(s, 600);
  assert.equal(s.n, C.BASE_CAPACITY);
  s.act = 2; s.pieces = 1e6;
  assert.equal(E.canBuy(s, 'ouvrier'), false, 'plus de place');
  E.buy(s, 'atelier');
  assert.equal(E.capacity(s), C.BASE_CAPACITY + C.ATELIER_CAPACITY);
  assert.equal(E.canBuy(s, 'ouvrier'), true);
});

test('Les six revendications sont écrites, signées, argumentées (60 à 120 mots)', () => {
  assert.equal(CLAIMS.length, 6);
  for (const c of CLAIMS) {
    const words = c.texte.split(/\s+/).length;
    assert.ok(words >= 60 && words <= 130, `${c.id} : ${words} mots`);
    assert.ok(c.auteur && c.compromis?.texte && c.reactions.ceder && c.reactions.negocier && c.reactions.refuser);
    assert.ok(c.effets.rendement > 0 && c.effets.rapport > 0);
    assert.ok(c.compromis.effets.rendement < c.effets.rendement, 'négocier est intermédiaire');
  }
});

test('Le régime cible : une partie robot passe les 500 entre 20 et 60 min et finit l\'acte II avec 30 ≤ R ≤ 65', () => {
  // Reproduit la stratégie du simulateur (tools/sim.mjs), en version courte.
  const s = E.createState(42);
  let at500 = null; let at4000 = null; let k = 0;
  while (s.t < 3 * 3600 && at4000 == null) {
    if (s.bought.ouvrier < 10 && k % 3 === 0) E.click(s);
    if (k % 10 === 0) {
      for (const id of ['atelier', 'cadence', 'formation', 'ouvrier']) if (E.canBuy(s, id)) { E.buy(s, id); break; }
      if (s.claims.current && !s.meeting && s.t - s.claims.current.arrivedAt > 30) {
        E.openDossier(s);
        E.answerClaim(s, ['ceder', 'negocier', 'refuser'][s.claims.done.length % 3]);
      }
    }
    E.tick(s, 0.1); k++;
    if (at500 == null && s.n >= 500) at500 = s.t;
    if (at4000 == null && s.n >= 4000) at4000 = s.t;
  }
  assert.ok(at500 > 20 * 60 && at500 < 60 * 60, `500 atteint à ${Math.round(at500 / 60)} min`);
  assert.ok(at4000 != null && at4000 < 2 * 3600, '4 000 atteint en moins de deux heures');
  const r = E.R(s);
  assert.ok(r >= 30 && r <= 65, `R = ${r.toFixed(0)} à la fin de l'acte II`);
});
