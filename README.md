# Syndicat — prototype (MVP)

Un incrémental classique demande : *comment optimiser tes producteurs ?*
Celui-ci demande : *à partir de quel moment optimiser quelqu'un devient un problème ?* — et il refuse de répondre.

Ce dépôt contient le **MVP falsifiable** décrit au §14 du [design doc](docs/design-doc.md) :

- actes I et II uniquement, 5 générateurs (Établi, Ouvrier, Formation, Cadence, Atelier) ;
- la jauge de Rapport, dérivée de la Mémoire de l'atelier ; la Tension ;
- 6 revendications écrites, signées, argumentées, avec pour chacune trois réponses (céder, négocier, refuser) ;
- **le passage des 500** : le premier nom, le changement de libellé (`Ouvrier ×512` → `512 personnes`), la première revendication, et la Cadence disponible à ce moment précis ;
- le hors-ligne à deux taux (production 60 % plafonnée à 8 h, social 100 % sans plafond) et le compte rendu de retour ;
- pas de grève, pas de Caisse, pas d'Automate, pas d'acte III.

## Lancer

Aucune dépendance. Node ≥ 18.

```
npm run dev      # http://localhost:8080/  — ajouter ?debug pour le panneau de mesure
npm test         # tests du moteur (node --test)
npm run sim      # un joueur-robot joue en accéléré et imprime le rythme
```

Les modules ES ne se chargent pas en `file://` : il faut le petit serveur (`tools/serve.mjs`) ou n'importe quel serveur statique.

## Le test

> Est-ce que le joueur hésite avant d'acheter la première Cadence ? Pas s'il refuse — s'il **hésite**.

Le prototype mesure ce temps. Le panneau `?debug` (déplaçable par sa barre, repliable, position mémorisée) affiche :

| ligne | sens |
|---|---|
| abordable → 1er survol | le joueur est allé lire la ligne de la Cadence |
| survols avant achat | combien de fois, avant de se décider |
| abordable → 1er achat | **temps d'hésitation** |
| témoin Atelier | le même délai pour l'Atelier, débloqué au même instant sans coût de Rapport. Si la Cadence attend 30 s et l'Atelier 3 s, l'hésitation est réelle ; si les deux attendent, c'était la lecture du nouveau panneau |
| Décisions | pour chaque revendication, la réponse et le temps mis à répondre |

Les mêmes valeurs sont dans la sauvegarde (`localStorage`, clé `syndicat.save.v1`, champs `metrics` et `decisions`). Les boutons du panneau permettent d'amener un testeur au seuil des 500 en une minute.

Premier playtest (auteur, qui connaît le twist) : acte I en 44 min ; Cadence abordable dès son apparition, première lecture à +17 s, premier achat à +34 s ; ensuite dix Cadences et toutes les revendications accordées ; R ≈ 49 à 1 h 17. Ce résultat a motivé le témoin Atelier, la revendication de Sabine déclenchée par la deuxième Cadence, et des intervalles raccourcis d'un tiers.

## Structure

```
index.html, style.css     écran unique : gauche production (55 %), droite social (30 %), bas Population
src/constants.js          toutes les valeurs chiffrées (première passe retunée sur simulateur)
src/memory.js             la Mémoire de l'atelier : R = somme pondérée de l'historique, f(R) ≤ 1
src/content.js            tout ce qui est écrit : revendications, réactions, journal, rumeurs
src/engine.js             moteur pur : tick, achats, revendications, passage des 500, hors-ligne
src/save.js               sauvegarde JSON horodatée
src/ui.js, src/main.js    rendu DOM et boucle à 10 Hz
test/engine.test.js       les invariants du doc (I1–I4, règles n°1 à 3) en tests
tools/sim.mjs             joueur-robot pour régler les courbes
docs/design-doc.md        le design doc
```

## Écarts avec le design doc

Valeurs de première passe retunées sur simulateur (le doc les annonce « à retuner sur prototype ») :

| paramètre | doc | prototype | pourquoi |
|---|---|---|---|
| Cadence, croissance du coût | 1,22 | 2,0 | à 1,22 le ×1,3 est rentable à l'infini : le robot en achète 3 500 |
| Formation, croissance du coût | 1,18 | 1,4 | sinon l'acte I dure quinze minutes |
| Formation, taux par ouvrier | 0,02/s | 0,0002/s | idem ; l'acte I dure ~35 min pour un robot optimal |
| Atelier, croissance du coût | 1,16 | 1,3 | pour que l'acte II tienne au moins une heure |
| capacité de l'atelier d'origine | — | 500 places, +250 par Atelier | donne un sens à « +capacité N » et fait coïncider le plafond avec le passage des 500 |

Autres choix d'implémentation :

- **Céder** : la pénalité de rendement est permanente ; le gain de Rapport pèse 0,7 puis s'estompe (0,1 à vingt minutes), et il met une minute à se faire sentir. **Refuser** : −6 de Rapport qui décroît vers 0,4, +8 de Tension. **Négocier** : il faut ouvrir le dossier (ce que la personne accepterait), puis tenir une réunion de 45 s pendant laquelle la production est à zéro ; résultat intermédiaire.
- La revendication de Sabine sur la cadence arrive en réaction à la deuxième Cadence, dans les deux minutes (ou dès que la table est libre) ; les autres sont tirées au sort selon l'état.
- Une revendication sans réponse charge la Tension (+0,5/min). Refuser est toujours possible, jamais gratuit (I4) ; ignorer non plus.
- La Tension est affichée et évolue selon la règle n°3, mais **rien ne se passe à 100** : la grève n'est pas dans le MVP. Le journal le dit en une ligne.
- Le bandeau du bas affiche la Population en clair, toujours (I3) ; les Pièces passent en notation scientifique au-delà de 10⁹ (garde-fou, l'acte III n'existe pas).
- À 4 000 personnes, une ligne de journal signale la fin du prototype ; le jeu continue de tourner.
