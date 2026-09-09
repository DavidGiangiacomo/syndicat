# Syndicat — design doc

*Concept n°4 du document « Douze concepts de jeux incrémentaux ».*
*Format visé : partie unique, 4 h à 5 h, en 2 ou 3 sessions, pas de prestige, hors-ligne oui. Références de cadrage : Universal Paperclips (la production auto-répliquante, l'arc en actes), Papers Please (l'arbitrage moral quotidien), Frostpunk (le fait que la bonne décision existe rarement).*

---

## 0. Format et contraintes — pourquoi elles diffèrent

| Paramètre | Choix | Raison |
|---|---|---|
| Durée | 4 h – 5 h | Le concept exige que le joueur ait **eu le temps d'aimer** l'optimisation avant qu'elle devienne un problème moral. Une partie de 2 h ne laisse pas assez d'heures d'automatisation heureuse : le retournement arriverait avant l'habitude, et perdrait tout. |
| Sessions | 2 ou 3 | Conséquence de la durée. Le jeu est conçu pour être quitté et repris, ce qui a un effet secondaire précieux (voir hors-ligne). |
| Prestige | Aucun | Le jeu est une trajectoire sociale : la recommencer effacerait la mémoire des ouvriers, qui est la ressource centrale de la seconde moitié. |
| Hors ligne | **Oui, et c'est une mécanique** | La production continue à 60 %, mais **le Rapport, lui, tourne à 100 %** : les ouvriers se parlent quand le joueur n'est pas là. Revenir après huit heures d'absence, c'est trouver une situation qui a mûri sans soi. C'est le seul incrémental de la liste où l'absence du joueur produit du contenu. |
| Plateforme | Web/desktop, lecture confortable | Beaucoup de texte court à lire (revendications, tracts, comptes rendus). |

---

## 1. Thèse

Un incrémental classique demande : *comment optimiser tes producteurs ?*
Celui-ci demande : *à partir de quel moment optimiser quelqu'un devient un problème ?* — et il refuse de répondre.

Le pari est de faire un **vrai bon incrémental classique pendant une heure**, sans ironie, avec de vraies courbes exponentielles satisfaisantes. Puis d'ajouter un second système qui ne remplace pas le premier mais l'arbitre.

Deux logiques coexistent et ne se convertissent jamais l'une dans l'autre :

- **La Production** suit une exponentielle de genre : 1 → ~10¹⁴.
- **Le Rapport** (l'état social de l'atelier) est un **état, pas un stock**. Il ne s'accumule pas, ne s'achète pas, ne se multiplie pas. Il a de l'inertie et de la mémoire.

Toute action qui augmente le rendement dégrade le Rapport. Toute concession qui restaure le Rapport plafonne le rendement — **définitivement**, pas temporairement. Le jeu ne dit jamais s'il faut traiter les ouvriers comme des chiffres ou comme des gens, et il ne récompense ni l'un ni l'autre.

---

## 2. Fiction

Un atelier. On ne sait pas quel siècle, on ne sait pas quel produit — le jeu parle de « pièces », toujours. Les premiers ouvriers sont des *unités* : le panneau les affiche comme des générateurs, avec un compteur et un coût, exactement comme des curseurs de Cookie Clicker.

Au seuil de 500 unités, un événement : deux d'entre eux ont un nom. Puis trois. Puis le panneau de production cesse d'afficher « Ouvrier ×1 274 » et affiche « 1 274 personnes ». Rien d'autre ne change dans les chiffres.

Ce que la partie finit par établir : il n'existe pas d'équilibre stable entre les deux logiques, seulement des régimes qui tiennent un temps. Les trois fins (§11) sont trois manières de cesser d'arbitrer — aucune n'est une victoire.

Note de ton : ni misérabilisme ni satire du patronat. Le registre est celui du compte rendu de réunion. Personne n'est un monstre, personne n'est héroïque, tout le monde a des raisons. Les tracts sont bien écrits parce que les gens qui les écrivent sont intelligents. **Le joueur n'est pas non plus le méchant** : il est celui qui doit tenir l'atelier.

Écriture : ~3 500 mots (revendications, comptes rendus, tracts, épilogue). Second budget d'écriture de la série après *La langue morte*.

---

## 3. Boucle de jeu

**Boucle courte (5–30 s)** — Acte I, indistinguable d'un incrémental classique.

```
Produire (clic/auto) → Pièces
      ↓ achat
Ouvriers (auto-réplication : chaque ouvrier en forme un autre)
      ↓
   Machines, cadences, ateliers
      ↓
Plus de production
```

**Boucle moyenne (5–20 min), à partir de l'acte II** — Une revendication arrive. Trois réponses possibles : **céder**, **négocier**, **refuser**. Céder coûte du rendement pour toujours. Refuser gagne du rendement et charge la Tension. Négocier coûte du temps réel (le joueur ne produit pas pendant la réunion) et donne un résultat intermédiaire — c'est la seule option qui demande de **lire** le dossier.

**Boucle longue (40–60 min)** — Un acte. Chaque acte fait monter d'un cran l'organisation en face : d'abord des individus qui se plaignent, puis des délégués, puis une caisse de grève, puis une coordination inter-ateliers, puis une négociation où le joueur n'est plus le plus fort.

---

## 4. Ressources

| Ressource | Rôle | Ordre de grandeur | Notation |
|---|---|---|---|
| **Pièces** (P) | monnaie de production | ~10¹⁴ | scientifique dès l'acte III |
| **Population** (N) | ouvriers, auto-réplicants | 1 → ~40 000 | **jamais scientifique** |
| **Rapport** (R) | état social, 0 à 100 | jamais un cumul | **jauge, en clair** |
| **Tension** (T) | pression accumulée, déclencheur de grève | 0 à 100 | jauge |
| **Caisse** (C) | argent de grève des ouvriers, hors du contrôle du joueur | 0 → ~10⁹ | visible seulement à partir de l'acte III |

**Règle structurante n°1** — **La Population n'est jamais scientifique.** À 40 000 ouvriers, le compteur affiche `40 000`, jamais `4,0·10⁴`. Les Pièces, elles, passent en notation scientifique à l'acte III. L'écart typographique entre les deux compteurs *est* le propos du jeu, et il est gratuit à produire.

**Règle structurante n°2** — `Rendement = base × f(R)` avec `f(R)` monotone croissante et **plafonnée à 1**. Un bon Rapport ne donne jamais de bonus : il évite une pénalité. Le meilleur atelier social possible produit exactement ce que produit un atelier neutre. Il n'y a aucun gain à être juste, seulement un coût à ne pas l'être — et c'est le pari le plus dur du design.

**Règle structurante n°3** — La Tension **ne redescend jamais toute seule**. Elle baisse par concession, par temps long (−0,3/min sous R > 60), ou par grève. Une grève évacue la Tension intégralement : c'est le seul moyen rapide, et il coûte tout.

---

## 5. Les générateurs

| # | Générateur | Effet par niveau | Coût de base | Croissance | Effet sur R | Acte |
|---|---|---|---|---|---|---|
| 1 | **Établi** | +1 P / clic | — | — | — | I |
| 2 | **Ouvrier** | +0,6 P/s, +N | 15 P | 1,15 | — | I |
| 3 | **Formation** | chaque ouvrier en forme 0,02/s | 300 P | 1,18 | — | I |
| 4 | **Cadence** | ×1,3 production | 2 000 P | 1,22 | **−4 R** par niveau | II |
| 5 | **Atelier** | +12 P/s, +capacité N | 25 000 P | 1,16 | — | II |
| 6 | **Prime au rendement** | ×1,5 production | 4·10⁵ P | 1,25 | −6 R, **+8 T** | II |
| 7 | **Contremaître** | ×1,4, réduit T de 30 % | 6·10⁶ P | 1,24 | −10 R | III |
| 8 | **Chaîne** | ×2,2 production | 2·10⁸ P | 1,28 | −14 R, **rend la grève totale** | III |
| 9 | **Automate** | +production sans N | 5·10¹⁰ P | 1,30 | −2 R, **−N par niveau** | IV |
| 10 | **Bureau des méthodes** | ×1,6, chronomètre les gestes | 8·10¹¹ P | 1,35 | −18 R | IV |

*(Valeurs de première passe, à retuner sur prototype — voir invariants §9.)*

Trois générateurs méritent un mot :

**La Chaîne** (acte III) est le point de non-retour mécanique : elle relie tous les postes, donc **une grève partielle devient impossible**. Avant elle, un arrêt coûte 20 à 40 % de production ; après elle, un arrêt coûte 100 %. Le joueur l'achète pour le ×2,2, et il achète en même temps son propre risque maximal. Le jeu ne le prévient pas ; l'information est dans la description, en une ligne, factuelle.

**L'Automate** (acte IV) est le seul générateur qui **retire** de la population : il rend des ouvriers inutiles, et le jeu ne dit pas où ils vont. Il baisse peu le Rapport, ce qui est contre-intuitif et volontaire — remplacer quelqu'un fâche moins que le presser. C'est la découverte la plus dérangeante du jeu, et elle est purement mécanique.

**Le Bureau des méthodes** (acte IV) déclenche une seconde couche : les ouvriers commencent à ralentir volontairement quand ils sont chronométrés (`−0,15 %` de rendement par point de R perdu). Le joueur mesure, la mesure dégrade ce qu'elle mesure. Écho volontaire au concept n°5, sans en dépendre.

---

## 6. Le Rapport — la mécanique centrale

Une jauge de 0 à 100, avec **inertie asymétrique** : elle baisse en une seconde et remonte sur des minutes. Trois seuils :

- **R > 65 — L'atelier tourne.** Aucun événement, aucun bonus. C'est l'état neutre, et il est ennuyeux exprès.
- **35 < R ≤ 65 — Frictions.** Revendications régulières, absentéisme (−5 à −12 % de rendement), rumeurs affichées dans un bandeau. Le joueur peut vivre là très longtemps, et la plupart des joueurs y vivront.
- **R ≤ 35 — Conflit ouvert.** La Tension monte trois fois plus vite, la Caisse se remplit, un délégué apparaît nommément.

**La Mémoire de l'atelier** est ce qui rend le système différent d'une jauge ordinaire : chaque décision est enregistrée avec sa date, et **les concessions récentes comptent moins que les refus anciens**. Le jeu applique un facteur d'oubli asymétrique : un refus pèse 1,0 et décroît à 0,4 en une heure de jeu ; une concession pèse 0,7 et décroît à 0,1 en vingt minutes. On ne rachète pas sa réputation aussi vite qu'on la perd, et ce déséquilibre est chiffré, pas rhétorique.

---

## 7. Les revendications (l'arbre d'upgrades, en face)

Le joueur a un arbre d'upgrades. **Les ouvriers en ont un aussi**, et il se remplit tout seul, en fonction de N, de R et du temps.

| Palier | Débloqué à | Revendications types | Effet si accordé |
|---|---|---|---|
| **Individuel** | N > 500 | pause, éclairage, un outil | −2 à −5 % rendement, +8 R |
| **Collectif** | N > 4 000 | délégué, horaires, salaire | −10 à −15 % rendement, +15 R, **permanent** |
| **Institutionnel** | N > 15 000 ou R < 40 | caisse, droit d'inspection, veto sur les cadences | −20 % rendement, +25 R, **retire des upgrades du joueur** |
| **Politique** | acte V | co-décision, propriété | fin alternative (§11) |

Il y a **26 revendications écrites**, tirées selon l'état. Chacune est un texte de 60 à 120 mots, signé d'un nom, et **argumentée sérieusement**. La règle d'écriture est absolue : aucune revendication ne doit être ridicule ou manifestement excessive. Si le joueur peut refuser sans hésiter, la revendication est mal écrite et doit être réécrite.

**Le veto** (palier institutionnel) est la mécanique la plus dure : accorder un droit d'inspection **grise réellement** des cases dans l'arbre du joueur. Il perd l'accès à des upgrades, pas seulement à leur effet. C'est irréversible.

---

## 8. La grève

Déclencheur : `T ≥ 100`, ou événement scénarisé à l'acte IV.

- La production tombe à **0** (ou à 20–40 % avant l'achat de la Chaîne).
- La Caisse se vide côté ouvriers : la grève dure `durée = f(Caisse, R)`, de 4 à 25 minutes de temps réel. **Le joueur ne peut pas la raccourcir en payant** — il peut seulement négocier, ce qui accorde d'un coup 2 à 4 revendications.
- Pendant la grève, l'écran ne propose presque rien à faire. C'est intentionnel et c'est le seul temps mort du jeu. Le panneau des tracts, lui, se remplit.
- Après : T = 0, R remonte de 20, et le rendement plafond a baissé de 10 à 30 %.

**Une grève n'est jamais un échec.** Le jeu ne l'affiche pas comme un game over, ne fait pas de son d'échec, ne perd aucune progression. Elle est chère et elle nettoie. Certains joueurs la provoqueront délibérément pour évacuer la Tension — et c'est une stratégie **valide**, dont le jeu ne dit rien. C'est le pendant du bouton Croissance de *Décroissance* : l'option honteuse qui fonctionne vraiment.

---

## 9. Courbes, invariants, rythme

### Rythme cible

| Acte | Temps cumulé | N | Production/s | R typique |
|---|---|---|---|---|
| I — Les unités | 0–50 min | 1 → 500 | 1 → 300 | *non affiché* |
| II — Les noms | 50–115 min | 500 → 4 000 | 10³ → 10⁵ | 80 → 60 |
| III — Les délégués | 115–190 min | 4 000 → 15 000 | 10⁶ → 10⁹ | 60 → 45 |
| IV — La caisse | 190–255 min | 15 000 → 35 000 | 10¹⁰ → 10¹² | 45 → 30 |
| V — La table | 255–290 min | ~40 000 | ~10¹⁴ | variable |

### Invariants d'équilibrage

- **I1** — **L'acte I ne contient aucun élément social.** Pas de nom, pas de jauge de Rapport, pas d'indice. Cinquante minutes d'incrémental honnête. Si le joueur devine le twist avant l'acte II, l'acte I est raté.
- **I2** — Un bon Rapport ne donne jamais de bonus net. `f(R) ≤ 1`, toujours.
- **I3** — La Population reste affichée en clair jusqu'au bout.
- **I4** — Aucune revendication ne peut être écartée sans coût : refuser est toujours possible et toujours facturé en Tension.
- **I5** — **Le joueur passe la seconde moitié du jeu avec R entre 30 et 60.** Ni révolte permanente ni paix sociale : le régime cible est l'inconfort gérable. Si les tests montrent des parties stabilisées à R > 70, les coûts en Rapport des générateurs sont trop faibles.

### Hors-ligne

Production à 60 %, plafonné à 8 h. **Mais le Rapport et la Tension évoluent à 100 %, sans plafond.** Revenir le lendemain, c'est trouver un tract qu'on n'a pas lu, une Tension qui a monté, parfois une grève déjà commencée. Le jeu affiche au retour un **compte rendu de ce qui s'est dit pendant l'absence** — deux à cinq lignes générées à partir de l'état. C'est le meilleur rapport valeur/coût du document.

---

## 10. Arc narratif — 5 actes

**Acte I — Les unités.** Un incrémental. Bon, propre, satisfaisant, sans second degré. Le joueur achète des ouvriers comme il achèterait des fermes. Le jeu ne fait *aucun* clin d'œil.

**Acte II — Les noms.** Au passage des 500, une ligne s'ajoute au journal : un prénom, un fait banal (il a demandé une pause). Puis le panneau change de libellé. Le joueur peut continuer exactement comme avant, et la plupart continuent. Première revendication. Première Cadence achetée par-dessus.

**Acte III — Les délégués.** L'atelier se structure. Les revendications cessent d'être individuelles ; on les reçoit désormais **en réunion**, avec un ordre du jour. Le joueur découvre la Caisse : ses ouvriers ont maintenant une réserve qu'il ne contrôle pas et ne peut pas voir précisément. C'est l'acte où la Chaîne devient irrésistible.

**Acte IV — La caisse.** Première grève quasi certaine. Puis l'Automate. Le joueur a désormais un moyen de se passer du problème, et le jeu observe s'il le prend. Le compteur de Population **baisse** pour la première fois. Personne ne commente.

**Acte V — La table.** Une négociation finale, longue, écrite, où le rapport de force est calculé à partir de toute la partie : Mémoire de l'atelier, Caisse accumulée, N restant, nombre de grèves, ratio Automates/humains. Le joueur ne dicte plus rien. Il répond.

---

## 11. Fins

Trois issues, déterminées par l'état à l'acte V, jamais par un choix isolé de fin :

- **La convention.** Un accord signé. Rendement plafonné à ~55 % du théorique, atelier stable, R haut. L'épilogue est court, presque plat : l'atelier tourne, dix ans passent en trois lignes. Le jeu n'a pas l'air content.
- **L'automatisation.** N tombe sous 200. Production maximale, R sans objet. L'épilogue liste les noms apparus dans le journal et ce qu'ils sont devenus, en une ligne chacun. Le joueur les a tous lus au moins une fois.
- **La reprise.** Caisse et organisation dépassent le rapport de force du joueur. Les ouvriers prennent l'atelier. Le jeu **continue trois minutes de plus**, avec le même écran, les mêmes courbes, la même exponentielle — et le joueur n'a plus de boutons. Il regarde son atelier fonctionner sans lui, très bien.

Aucune n'est étiquetée. Pas de score, pas de pourcentage de complétion.

**Épilogue commun** — « Le procès-verbal » : la liste chronologique de toutes les décisions, avec en regard **ce qui avait été demandé** et la date. Douze minutes de lecture. Coût de production nul.

---

## 12. Interface et production d'assets

**Écran unique**, trois zones :

- **Gauche (55 %)** — production, générateurs, courbes. Volontairement identique à un incrémental de facture classique. Aucune concession esthétique au propos.
- **Droite (30 %)** — d'abord vide (acte I), puis le panneau social : Rapport, Tension, journal, revendications, tracts.
- **Bas (bandeau)** — la Population, en gros, en clair, toujours.

**La typographie est le dispositif principal.** Une seule police, deux graisses. Le seul effet visuel du jeu est le remplacement progressif des libellés : `Ouvrier ×1 274` → `1 274 personnes` → au dernier acte, dans le panneau de négociation, sept noms.

**Coût de production réel** : ~3 500 mots écrits avec sérieux, 26 revendications argumentées, un système d'événements conditionnés. **Le budget du jeu est l'écriture, et la qualité d'argumentation des revendications est le point de rupture** : mal écrites, le jeu devient un tract ; bien écrites, il devient inconfortable pour tout le monde, ce qui est le but.

---

## 13. Risques

| | Risque | Réponse |
|---|---|---|
| R1 | Le jeu passe pour un tract politique | Règle absolue d'écriture : chaque camp a des arguments valides et le jeu ne conclut jamais. Test de recette : un lecteur doit être incapable de dire ce que pense l'auteur |
| R2 | L'acte I ennuie ceux qui savent déjà (le pitch est public) | Il doit être un **bon** incrémental pour lui-même, jouable et satisfaisant sans le twist. Si l'acte I n'est pas bon isolément, le jeu ne marche pas |
| R3 | I2 (aucun bonus au bon Rapport) frustre les optimisateurs | C'est le propos. Mais le jeu doit le rendre lisible tôt : un tooltip à l'acte II affiche explicitement le plafond de `f(R)` |
| R4 | La grève est vécue comme un game over | Aucun son d'échec, aucune perte, durée bornée, et un contenu à lire pendant. À tester en priorité |
| R5 | 3 500 mots de texte argumenté de qualité constante | À écrire avant le code, comme pour *La langue morte*. Les 26 revendications d'abord ; si elles ne tiennent pas, le projet s'arrête là |

---

## 14. MVP falsifiable

Un week-end, un seul écran :

- Actes I et II uniquement, 5 générateurs, la jauge de Rapport, 6 revendications écrites.
- Pas de grève, pas de Caisse, pas d'Automate.
- **Obligatoire : le passage des 500.** Le changement de libellé, le premier nom, la première revendication — et la Cadence, disponible à ce moment précis, qui donne ×1,3 contre −4 R.

**Le test** : est-ce que le joueur hésite avant d'acheter la première Cadence ? Pas s'il refuse — s'il **hésite**. Si l'achat est automatique et sans friction, le système social ne pèse rien et les quatre actes suivants ne le sauveront pas.

---

## 15. Notes d'implémentation

- Tick à 10 Hz. État plat, sauvegarde JSON `localStorage`, horodatée pour le calcul hors-ligne (deux taux séparés : production 60 %, social 100 %).
- La Mémoire de l'atelier est un tableau d'événements `{ type, poids, t }` ; R se recalcule à chaque tick comme somme pondérée avec décroissance exponentielle par type. Ne jamais stocker R comme valeur autonome : il doit toujours être dérivable de l'historique, sinon les épilogues sont impossibles.
- Les revendications sont des objets `{ id, palier, conditions, texte, effets, auteur }` tirés dans un pool filtré par l'état ; jamais deux fois la même.
- Le veto retire des entrées de l'arbre en les marquant `interdit: true` — jamais en les supprimant, pour que le joueur voie ce qu'il a perdu.
- Le compte rendu de retour hors ligne est généré par gabarit à trous à partir des événements passés, pas par IA : trois à cinq lignes, six gabarits suffisent.

---

## À trancher ensuite

1. **L'invariant I2** (aucun bonus au bon Rapport) est le pari le plus risqué du document. Alternative à tester : un bonus minuscule (×1,03) qui suffirait au confort du joueur sans détruire le propos. À décider sur playtest, pas sur principe.
2. Écrire les 26 revendications, ou au moins les 6 du MVP.
3. La fin « reprise » avec trois minutes sans boutons : durée exacte à tester (3 min peut être trop long).
4. Prototyper : le MVP §14, et en particulier mesurer le temps d'hésitation devant la première Cadence.
