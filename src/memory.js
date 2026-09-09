// La Mémoire de l'atelier (§6, §15).
// R n'est jamais stocké : il se recalcule comme somme pondérée de l'historique,
// avec une décroissance exponentielle par type d'événement.

import {
  R_BASE, R_CALME, R_CONFLIT,
  REFUS_TAU, REFUS_FLOOR,
  CONCESSION_TAU, CONCESSION_FLOOR, CONCESSION_PEAK, CONCESSION_RAMP, CONCESSION_DELAY,
} from './constants.js';

export const WEIGHTS = {
  // Une cadence n'est pas un souvenir : c'est une condition de travail. Elle ne s'oublie pas.
  cadence: () => 1,
  // Un refus pèse 1,0 et décroît vers 0,4 : on ne l'oublie jamais tout à fait.
  refus: (age) => REFUS_FLOOR + (1 - REFUS_FLOOR) * Math.exp(-age / REFUS_TAU),
  // Une concession pèse 0,7 et décroît vers 0,1 en vingt minutes. Elle met une minute à se faire sentir.
  concession: (age) => {
    const forgotten = Math.max(0, age - CONCESSION_DELAY);
    const memory = (CONCESSION_FLOOR + (CONCESSION_PEAK - CONCESSION_FLOOR) * Math.exp(-forgotten / CONCESSION_TAU)) / CONCESSION_PEAK;
    return memory * (1 - Math.exp(-age / CONCESSION_RAMP));
  },
};

export function contribution(ev, t) {
  const age = Math.max(0, t - ev.t);
  const w = WEIGHTS[ev.type];
  if (!w) return 0;
  return ev.amount * w(age);
}

export function rapport(memory, t) {
  let r = R_BASE;
  for (const ev of memory) r += contribution(ev, t);
  return Math.max(0, Math.min(100, r));
}

export function band(r) {
  if (r > R_CALME) return 'calme';
  if (r > R_CONFLIT) return 'frictions';
  return 'conflit';
}

export const BAND_LABEL = {
  calme: "L'atelier tourne",
  frictions: 'Frictions',
  conflit: 'Conflit ouvert',
};

// Règle structurante n°2 : f(R) monotone croissante, plafonnée à 1.
// Un bon Rapport ne donne jamais de bonus ; il évite une pénalité.
export function fR(r) {
  if (r > R_CALME) return 1;
  if (r > R_CONFLIT) {
    // absentéisme : −5 % à R = 65, −12 % à R = 35
    const x = (R_CALME - r) / (R_CALME - R_CONFLIT);
    return 1 - (0.05 + 0.07 * x);
  }
  // conflit ouvert : −12 % à R = 35, −25 % à R = 0
  const x = (R_CONFLIT - r) / R_CONFLIT;
  return 0.88 - 0.13 * x;
}
