import { fmtInt } from './format.js';

// Tout ce qui est écrit. Règle absolue (§7, §13) : aucune revendication ne doit
// pouvoir être refusée sans hésiter ; chaque camp a des raisons ; le jeu ne conclut pas.

// Les six revendications du MVP — palier individuel (N > 500).
// { id, palier, conditions, auteur, poste, objet, texte, effets, compromis, reactions }
// effets.rendement : pénalité permanente sur le rendement (§3 : céder coûte du rendement pour toujours)
// effets.rapport   : gain de Rapport, qui s'estompe (Mémoire de l'atelier)
export const CLAIMS = [
  {
    id: 'pause',
    palier: 'individuel',
    conditions: {},
    auteur: 'Marthe', pronom: 'elle', poste: 4,
    objet: 'la pause',
    titre: 'Dix minutes',
    texte:
      "Je demande dix minutes au milieu de l'après-midi, pour tout le monde, à la même heure. Pas pour se reposer : pour poser la pièce. Passé la neuvième heure, j'en rate une sur vingt, et ce sont celles-là qui reviennent du contrôle. Je ne prétends pas que la pause ne coûte rien. Elle coûte. Elle coûte moins que ce qu'on ne compte pas ; je l'ai relevé sur trois semaines, le cahier est à votre disposition. Je sais que tout le monde n'a pas la même main. C'est bien pour ça que je demande la pause pour tout le monde : sinon, ceux qui la prendront seront ceux qui ratent, et ça se saura.",
    effets: { rendement: 0.03, rapport: 8 },
    compromis: {
      texte: "Cinq minutes, poste par poste, en décalé — jamais l'atelier entier à l'arrêt en même temps.",
      effets: { rendement: 0.015, rapport: 4 },
    },
    reactions: {
      ceder: 'Marthe a dit merci, une fois, et n\'en a plus parlé.',
      negocier: 'Marthe a accepté cinq minutes. Elle a demandé que ce soit écrit quelque part.',
      refuser: 'Marthe a repris son poste. Elle n\'a pas demandé pourquoi.',
    },
  },
  {
    id: 'eclairage',
    palier: 'individuel',
    conditions: {},
    auteur: 'Idriss', pronom: 'il', poste: 17,
    objet: "l'éclairage du fond",
    titre: 'La lampe du fond',
    texte:
      "Les quatre postes du fond travaillent sous une seule lampe depuis que la deuxième a grillé, en février. On m'a dit qu'elle serait remplacée. Je ne demande pas seulement la lampe : je demande que, quand une lampe grille, le poste s'arrête jusqu'à ce qu'elle soit remplacée. Sinon elle ne le sera jamais, parce que le poste continue de produire, et que ce qui continue de produire n'est jamais une urgence. Je sais ce que ça veut dire : des arrêts, et personne pour les prévoir. Mais Paule a fait trois pièces à l'envers la semaine dernière, et ce n'est pas Paule, le problème.",
    effets: { rendement: 0.02, rapport: 8 },
    compromis: {
      texte: "La lampe remplacée sous huit jours, sans arrêt du poste ; et un registre des lampes, au mur, que n'importe qui peut lire.",
      effets: { rendement: 0.01, rapport: 4 },
    },
    reactions: {
      ceder: 'Idriss a remplacé la lampe lui-même, le soir même. Le registre est sur le mur.',
      negocier: 'Idriss a signé le registre. Il vérifie la date tous les matins.',
      refuser: 'Idriss a apporté une lampe de chez lui. Elle est à son nom.',
    },
  },
  {
    id: 'outil',
    palier: 'individuel',
    conditions: {},
    auteur: 'Bastien', pronom: 'il', poste: 9,
    objet: 'les calibres',
    titre: 'Un calibre par poste',
    texte:
      "Il y a onze calibres pour dix-neuf postes. On se les passe. Un calibre passé de main en main est réglé par personne : chacun le retouche à sa main, et le suivant le retouche dans l'autre sens. Je demande un calibre par poste, au nom du poste, et qu'on ne le déplace pas — même quand le poste est vide, même quand ça arrangerait. Un outil qui reste à un poste vide, c'est un outil qui ne produit pas ; je le sais, et je sais ce que ça vous coûte. C'est aussi un outil qui, au retour, produit juste.",
    effets: { rendement: 0.03, rapport: 8 },
    compromis: {
      texte: "Un calibre par poste, mais prêtable sur décision du poste voisin — pas de la direction.",
      effets: { rendement: 0.015, rapport: 4 },
    },
    reactions: {
      ceder: 'Bastien a gravé les numéros de poste sur les calibres. Ça a pris sa pause.',
      negocier: 'Bastien a dit que ça tiendrait tant que les voisins se parlent.',
      refuser: 'Bastien garde le sien dans sa poche. Les autres ont commencé à faire pareil.',
    },
  },
  {
    id: 'cadence',
    palier: 'individuel',
    conditions: { cadence: 2 },
    auteur: 'Sabine', pronom: 'elle', poste: 22,
    objet: 'le réglage de la cadence',
    titre: 'Le temps du milieu',
    texte:
      "La cadence a été réglée sur le temps d'Idriss. Idriss a vingt-trois ans et des mains qui ne tremblent pas. Nous sommes {N} ; la plupart d'entre nous ne sont pas Idriss, et ne le seront plus. Je ne demande pas de baisser la cadence — je sais ce qu'elle vous rapporte, je vois les chiffres comme vous. Je demande qu'elle soit réglée sur le temps du milieu, pas sur le meilleur : la moitié des postes au-dessus, la moitié en dessous. C'est la même cadence pour tout le monde. Seulement mesurée sur des gens qui existent.",
    effets: { rendement: 0.05, rapport: 8 },
    compromis: {
      texte: "La cadence reste réglée sur le meilleur, mais un poste sur cinq est mis « en tolérance » et n'est pas compté contre.",
      effets: { rendement: 0.025, rapport: 4 },
    },
    reactions: {
      ceder: "Sabine a affiché le temps du milieu au-dessus de la pendule. Idriss l'a lu et n'a rien dit.",
      negocier: "Sabine a demandé qui déciderait des postes en tolérance. Vous n'avez pas répondu.",
      refuser: "Sabine a tenu la cadence. Elle ne l'a plus jamais commentée.",
    },
  },
  {
    id: 'cloche',
    palier: 'individuel',
    conditions: { atelier: 1 },
    auteur: 'Léon', pronom: 'il', poste: 1,
    objet: 'la fin de journée',
    titre: 'La cloche',
    texte:
      "Depuis le deuxième atelier, la journée se finit quand le lot est fini, pas quand la cloche sonne. Ça fait vingt minutes certains soirs, une heure d'autres, et personne ne sait lesquels à l'avance. J'ai soixante et un ans, j'ai deux enfants qui m'attendent pour manger, et j'ai été le premier ouvrier de cette maison. Je demande que la cloche soit la fin. Le lot qui n'est pas fini le sera demain matin ; il ne se sauve pas. Si vous avez besoin qu'un lot finisse le soir, dites-le le matin, et ceux qui restent le sauront en arrivant.",
    effets: { rendement: 0.04, rapport: 8 },
    compromis: {
      texte: "La cloche est la fin, sauf annonce le matin même — au plus deux soirs par semaine.",
      effets: { rendement: 0.02, rapport: 4 },
    },
    reactions: {
      ceder: "Léon rentre à l'heure. Il est revenu un samedi, sans qu'on le lui demande, finir un lot.",
      negocier: 'Léon a dit que deux soirs, ça allait. Il les compte.',
      refuser: 'Léon reste. Ses enfants sont venus l\'attendre à la grille, une fois.',
    },
  },
  {
    id: 'nouveaux',
    palier: 'individuel',
    conditions: { formation: 4 },
    auteur: 'Nour', pronom: 'elle', poste: 31,
    objet: 'le temps de formation',
    titre: 'Les trois semaines',
    texte:
      "Vous nous demandez de former. Nous formons : chaque personne ici a montré le geste à une autre. Mais former, c'est deux paires de mains sur une pièce pendant trois semaines, et la pièce est comptée une fois — pour le formateur, qui passe pour lent. Ensuite le nouveau est seul, il compte pour un, et le formateur n'a rien. Je demande que les trois semaines soient comptées comme du travail. Pas comme de la production : comme du travail. Ceux qui forment le mieux sont ceux qui vont le moins vite. En ce moment, ce sont ceux que vous pressez le plus.",
    effets: { rendement: 0.03, rapport: 8 },
    compromis: {
      texte: 'Une semaine comptée sur trois, et le formateur choisit qui il forme.',
      effets: { rendement: 0.015, rapport: 4 },
    },
    reactions: {
      ceder: 'Nour a formé trois personnes ce mois-ci. Elles restent.',
      negocier: 'Nour a pris la semaine. Elle a dit que le reste se verrait.',
      refuser: "Nour ne forme plus. Elle n'a pas dit non ; elle a dit qu'elle allait moins vite.",
    },
  },
];

export const CLAIM_BY_ID = Object.fromEntries(CLAIMS.map((c) => [c.id, c]));

// Le passage des 500 (§10, acte II) : un prénom, un fait banal.
export const THRESHOLD_LINES = [
  'Marthe a demandé une pause. Elle a repris après.',
  'Idriss, puis Bastien, ont demandé la même chose.',
  null, // le libellé change ; rien d'autre ne change dans les chiffres
  null, // la première revendication arrive
];

export const CADENCE_LINES = [
  "La cadence a monté. Personne n'a rien dit.",
  'La cadence a monté encore. Marthe a regardé la pendule.',
  'On a repeint les repères au sol, plus serrés.',
  'Idriss tient la cadence. Les autres regardent Idriss.',
];
export const CADENCE_LINES_MORE = [
  'La cadence a monté.',
  'Nouveau réglage de la cadence. Le bruit a changé.',
  'Quelqu\'un a décroché la pendule. Elle a été remise le lendemain.',
  'La cadence a monté. Sabine a fait le tour des postes, sans rien dire.',
];

export const ATELIER_LINES = [
  "Un second atelier, à côté. Des visages qu'on ne connaît pas.",
  'Un atelier de plus. Les nouveaux ne connaissent pas les prénoms.',
  'Un atelier de plus. On y parle moins, ou on ne l\'entend pas.',
];
export const ATELIER_LINES_MORE = [
  'Un atelier de plus.',
  'Un atelier de plus. Léon dit qu\'il n\'en a jamais vu l\'intérieur.',
];

export const MILESTONE_LINES = {
  1000: 'Mille personnes. Vous connaissez trois prénoms.',
  2000: "Deux mille. Paule est partie ; personne ne vous l'a dit, vous l'avez lu sur le registre.",
  3000: 'Trois mille. Les nouveaux appellent l\'atelier « la boîte ».',
  4000: "Quatre mille. — Fin du prototype : les actes III à V ne sont pas écrits. L'atelier continue de tourner.",
};

export const BAND_LINES = {
  frictions: "Les conversations s'arrêtent quand vous passez.",
  conflit: 'Bastien parle pour les autres, maintenant.',
  calme: "L'atelier tourne.",
};

export const TENSION_MAX_LINE = 'Ça ne tiendra pas. (La grève n\'est pas dans ce prototype.)';

export const RUMORS = {
  frictions: [
    'On dit que la cadence va encore monter.',
    'Marthe ne prend plus sa pause avec les autres.',
    'Quelqu\'un a compté les pièces refusées. Le chiffre circule.',
    'Les nouveaux ne restent pas.',
    'On dit que vous ne lisez pas les demandes.',
    'Idriss a dit qu\'il partirait. Il est encore là.',
  ],
  conflit: [
    'On ne parle plus quand vous passez.',
    'Il y a une liste. Personne ne sait qui la tient.',
    'Bastien a réuni les postes du fond, hier soir.',
    'On dit que le prochain réglage sera le dernier.',
  ],
};

export function claimText(claim, state) {
  return claim.texte.replace('{N}', fmtInt(state.n));
}

// « à propos de » + objet : la pause → de la pause ; le réglage → du réglage ; les calibres → des calibres.
export function objetDe(objet) {
  if (objet.startsWith('le ')) return `du ${objet.slice(3)}`;
  if (objet.startsWith('les ')) return `des ${objet.slice(4)}`;
  return `de ${objet}`;
}
