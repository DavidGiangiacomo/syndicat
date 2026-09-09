import { TICK_HZ } from './constants.js';
import * as E from './engine.js';
import { load, save, reset } from './save.js';
import { initUI, render, showReport, initDebug, renderDebug } from './ui.js';

let { state, elapsed } = load();
const debug = new URLSearchParams(location.search).has('debug');

initUI({
  onClick: () => { E.click(state); render(state); },
  onBuy: (id) => { E.buy(state, id); render(state); },
  onAnswer: (choice) => {
    if (choice === 'dossier') E.openDossier(state);
    else E.answerClaim(state, choice);
    render(state);
  },
  onHoverCadence: () => E.markCadenceHover(state),
  onReset: () => {
    if (!confirm('Recommencer une partie ? La mémoire de l\'atelier sera effacée.')) return;
    state = reset();
    render(state);
    save(state);
  },
});

if (debug) {
  initDebug({
    onDebug: (what) => {
      if (what === 'pieces') state.pieces += 10000;
      if (what === 'n490') { state.n = 490; if (state.bought.formation === 0) state.bought.formation = 1; }
      if (what === 'skip') for (let i = 0; i < 300; i++) E.tick(state, 1);
      if (what === 'offline') { const r = E.applyOffline(state, 8 * 3600); if (r) showReport(r); }
      render(state);
    },
  });
}

// Retour après une absence : deux taux, un compte rendu.
if (elapsed > 0) {
  const report = E.applyOffline(state, elapsed);
  if (report) showReport(report);
}

render(state);

let last = performance.now();
let sinceSave = 0;
setInterval(() => {
  const now = performance.now();
  let dt = (now - last) / 1000;
  last = now;
  if (dt > 60) {
    // L'onglet est resté en arrière-plan : on traite l'absence comme une absence.
    const report = E.applyOffline(state, dt);
    if (report) showReport(report);
  } else {
    E.tick(state, Math.min(dt, 2));
  }
  render(state);
  if (debug) renderDebug(state);
  sinceSave += dt;
  if (sinceSave >= 5) { sinceSave = 0; save(state); }
}, 1000 / TICK_HZ);

document.addEventListener('visibilitychange', () => { if (document.hidden) save(state); });
window.addEventListener('beforeunload', () => save(state));
