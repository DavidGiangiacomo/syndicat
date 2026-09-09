// Valeurs de première passe (design doc §5, §6, §9), retunées sur simulateur (tools/sim.mjs) :
// Formation 1,18 → 1,4 et 0,02 → 0,0002/s ; Cadence 1,22 → 2,0 (sinon rentable à l'infini) ; Atelier 1,16 → 1,3.
// Tout ce qui est chiffré dans le jeu vit ici.

export const SAVE_VERSION = 1;
export const TICK_HZ = 10;

// Production
export const WORKER_PROD = 0.6;        // P/s par personne
export const ATELIER_PROD = 12;        // P/s par atelier
export const CLICK_PROD = 1;           // P par clic (Établi)
export const CADENCE_MULT = 1.3;
export const BASE_CAPACITY = 500;      // places à l'atelier d'origine
export const ATELIER_CAPACITY = 250;   // places par atelier supplémentaire
// Réglable depuis le simulateur (tools/sim.mjs) : valeurs mutables.
export const TUNING = { formationRate: 0.0002 }; // personnes formées / s / personne / niveau de Formation

// Rapport (jauge 0–100, jamais un stock : dérivée de la Mémoire de l'atelier)
export const R_BASE = 80;
export const R_CALME = 65;             // R > 65 : l'atelier tourne
export const R_CONFLIT = 35;           // R <= 35 : conflit ouvert
export const CADENCE_R = -4;           // par niveau, permanent

// Mémoire de l'atelier (§6) : facteur d'oubli asymétrique, en secondes.
export const REFUS_AMOUNT = -6;        // un refus pèse 1,0 et décroît vers 0,4 (~ 1 h)
export const REFUS_TAU = 1300;
export const REFUS_FLOOR = 0.4;
export const CONCESSION_TAU = 300;     // une concession pèse 0,7 et décroît vers 0,1 (~ 20 min)
export const CONCESSION_FLOOR = 0.1;
export const CONCESSION_PEAK = 0.7;
export const CONCESSION_RAMP = 30;     // la jauge remonte sur des minutes, jamais d'un coup
export const CONCESSION_DELAY = 90;    // l'oubli ne commence qu'une fois la concession sentie

// Tension (§4, règle n°3 : ne redescend jamais toute seule, sauf temps long sous R > 60)
export const T_DECAY_PER_MIN = 0.3;    // sous R > 60
export const T_FRICTIONS_PER_MIN = 0.1;
export const T_CONFLIT_PER_MIN = 0.3;  // « trois fois plus vite »
export const T_PENDING_PER_MIN = 0.5;  // une revendication sans réponse : ignorer n'est jamais gratuit
export const T_REFUS = 8;
export const T_NEGOCIE = 2;
export const T_CEDE = -5;

// Revendications
export const CLAIM_INTERVAL = { calme: 480, frictions: 240, conflit: 120 }; // secondes
export const MEETING_DURATION = 45;    // négocier coûte du temps réel : la production s'arrête

// Actes
export const THRESHOLD_N = 500;        // le passage des 500
export const THRESHOLD_STAGES = [0, 25, 50, 80]; // secondes après le passage : nom, noms, libellé, revendication
export const ACT3_N = 4000;            // fin du prototype

// Hors-ligne (§9) : deux taux séparés
export const OFFLINE_PROD_FACTOR = 0.6;
export const OFFLINE_PROD_CAP = 8 * 3600;
export const OFFLINE_SOCIAL_CAP = 30 * 24 * 3600;
export const OFFLINE_MIN = 60;         // en dessous, pas de compte rendu

export const GENERATORS = [
  {
    id: 'etabli', name: 'Établi', act: 1,
    effect: '+1 pièce par clic', cost: null, growth: 1,
  },
  {
    id: 'ouvrier', name: 'Ouvrier', act: 1,
    effect: `+${WORKER_PROD} pièce/s`, cost: 15, growth: 1.15,
  },
  {
    id: 'formation', name: 'Formation', act: 1,
    effect: 'chaque ouvrier en forme un autre, un peu plus vite', cost: 300, growth: 1.4,
  },
  {
    id: 'cadence', name: 'Cadence', act: 2,
    effect: `×${CADENCE_MULT} production. ${CADENCE_R} de Rapport par niveau.`, cost: 2000, growth: 2.0,
  },
  {
    id: 'atelier', name: 'Atelier', act: 2,
    effect: `+${ATELIER_PROD} pièces/s, +${ATELIER_CAPACITY} places`, cost: 25000, growth: 1.3,
  },
];

export const GEN_BY_ID = Object.fromEntries(GENERATORS.map((g) => [g.id, g]));
