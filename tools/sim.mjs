// Simulateur : un joueur-robot joue la partie en accéléré et imprime le rythme.
// Sert à régler les courbes (§9). Usage : npm run sim [-- --strategy=cheap|greedy] [--hours=3] [--refuse|--cede|--negocie]
import { createState, tick, click, buy, canBuy, cost, answerClaim, openDossier, productionPerSec, R, capacity, hesitation, cadenceMult, baseProduction } from '../src/engine.js';
import { GENERATORS, GEN_BY_ID, TUNING } from '../src/constants.js';
import { fmtInt, fmtRate, fmtClock } from '../src/format.js';

const args = Object.fromEntries(process.argv.slice(2).map((a) => {
  const m = a.match(/^--([^=]+)(?:=(.*))?$/);
  return m ? [m[1], m[2] ?? true] : [a, true];
}));
const strategy = args.strategy ?? 'greedy';
const hours = Number(args.hours ?? 3);
const answer = args.refuse ? 'refuser' : args.cede ? 'ceder' : args.negocie ? 'negocier' : 'mixed';
const seed = Number(args.seed ?? 42);
const quiet = !!args.quiet;
if (args.rate) TUNING.formationRate = Number(args.rate);
if (args.fgrowth) GEN_BY_ID.formation.growth = Number(args.fgrowth);
if (args.cgrowth) GEN_BY_ID.cadence.growth = Number(args.cgrowth);
if (args.agrowth) GEN_BY_ID.atelier.growth = Number(args.agrowth);

const state = createState(seed);
const dt = 0.1;
const marks = [100, 250, 500, 1000, 2000, 4000];
const seen = new Set();
let lastReport = -600;
let claimsAnswered = 0;

function report(label) {
  if (quiet && !label) return;
  const r = state.act >= 2 ? R(state).toFixed(0) : '—';
  console.log(
    `${fmtClock(state.t).padStart(8)}  ${label.padEnd(12)}  N=${fmtInt(state.n).padStart(6)}  P/s=${fmtRate(productionPerSec(state)).padStart(9)}  P=${fmtInt(state.pieces).padStart(10)}  R=${r}  T=${state.tension.toFixed(0)}  cad=${state.bought.cadence} atl=${state.bought.atelier} form=${state.bought.formation} ouv=${state.bought.ouvrier}`,
  );
}

function decide() {
  const buyable = GENERATORS.filter((g) => g.cost != null && canBuy(state, g.id));
  if (buyable.length === 0) return null;
  if (strategy === 'cheap') {
    return buyable.sort((a, b) => cost(state, a.id) - cost(state, b.id))[0].id;
  }
  if (strategy === 'expensive') {
    return buyable.sort((a, b) => cost(state, b.id) - cost(state, a.id))[0].id;
  }
  // greedy : achète ce qui rapporte le plus par pièce dépensée (valeur estimée), sinon le moins cher
  const value = (g) => {
    const c = cost(state, g.id);
    if (g.id === 'ouvrier') return 0.6 * cadenceMult(state) / c;
    if (g.id === 'formation') return (state.n < capacity(state) ? TUNING.formationRate * state.n * 0.6 * 20 * cadenceMult(state) : 0) / c;
    if (g.id === 'cadence') return (0.3 * baseProduction(state) * cadenceMult(state)) / c;
    if (g.id === 'atelier') return (12 * cadenceMult(state) + (state.n >= capacity(state) - 5 ? state.n * 0.6 * 0.5 : 0)) / c;
    return 0;
  };
  return buyable.sort((a, b) => value(b) - value(a))[0].id;
}

const answersCycle = ['ceder', 'negocier', 'refuser'];
while (state.t < hours * 3600) {
  // clics : 3 par seconde tant qu'on n'a pas dix ouvriers
  if (state.bought.ouvrier < 10 && Math.round(state.t * 10) % 3 === 0) click(state);
  if (Math.round(state.t * 10) % 10 === 0) {
    const id = decide();
    if (id) buy(state, id);
    if (state.claims.current && !state.meeting && state.t - state.claims.current.arrivedAt > 30) {
      openDossier(state);
      const choice = answer === 'mixed' ? answersCycle[claimsAnswered % 3] : answer;
      answerClaim(state, choice);
      claimsAnswered++;
      report(`→ ${choice}`);
    }
  }
  tick(state, dt);
  for (const m of marks) {
    if (!seen.has(m) && state.n >= m) { seen.add(m); report(`N ≥ ${m}`); }
  }
  if (state.t - lastReport >= 600) { lastReport = state.t; report(''); }
  if (state.n >= 4000 && args.stop) break;
}
report('fin');
if (!quiet) {
  console.log('\nJournal :');
  for (const e of state.journal) console.log(`  ${fmtClock(e.t).padStart(8)}  [${e.kind}] ${e.text}`);
}
console.log('\nHésitation devant la première Cadence :', hesitation(state));
console.log('Capacité :', capacity(state));
