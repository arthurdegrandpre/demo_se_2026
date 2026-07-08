# RIVE — Planification

**Référentiel Interactif des services écosystémiques et de la Valeur Écologique de la région de Trois-Rivières**

Version 0.1 — document de planification · Juillet 2026

---

## 1. Objectif et vision

RIVE est une plateforme d'aide à la décision qui rend visibles, mesurables et partageables les **services écosystémiques** du territoire de Trois-Rivières et de sa région. Elle relie une base de données géospatiale (observations de terrain, télédétection, cartes thématiques) à des algorithmes de traitement afin de produire des indicateurs clairs pour l'aménagement, les politiques publiques et la concertation citoyenne.

La finalité n'est pas de produire une carte de plus, mais de transformer des données hétérogènes en **insight rapide, accessible et défendable** : où sont les actifs écologiques les plus précieux, où sont les pressions, et où l'action publique aurait le meilleur rendement écologique et social.

L'ambition est structurée par deux cadres de référence :

- le **Cadre mondial de la biodiversité de Kunming-Montréal** (COP15, 2022), qui fixe l'objectif « 30x30 » — conserver 30 % des terres et eaux et mettre 30 % des écosystèmes dégradés en restauration effective d'ici 2030 ;
- les **plans directeurs de l'eau (PDE)** des organismes de bassins versants (OBV) québécois, outils légaux de gestion intégrée de l'eau par bassin versant depuis la *Loi sur l'eau* (2009).

RIVE se veut le pont opérationnel entre ces cadres stratégiques et le territoire concret.

## 2. Territoire d'étude

Trois-Rivières occupe une position charnière à la confluence du **fleuve Saint-Laurent** et de la **rivière Saint-Maurice**, à la tête du **lac Saint-Pierre**. Cette géographie concentre une valeur écologique exceptionnelle.

Le **lac Saint-Pierre**, dernier élargissement d'eau douce du Saint-Laurent (40 km de long, 25 km de large), est une **Réserve mondiale de la biosphère de l'UNESCO** (2000). Il contient plus de **40 % des milieux humides du Saint-Laurent** et plus de **20 % de tous les marais du fleuve**, abrite la plus grande héronnière d'Amérique du Nord et sert de halte migratoire majeure (près de 290 espèces d'oiseaux recensées). On le surnomme « les reins du Saint-Laurent » pour sa fonction de filtration.

Le territoire municipal chevauche **trois zones de gestion de l'eau**, chacune relevant d'un OBV distinct, ce qui impose une architecture de données capable de raisonner par bassin versant et non seulement par frontière administrative.

Emprises à modéliser : cœur urbain de Trois-Rivières, corridor de la rivière Saint-Maurice, plaine alluviale et rives du lac Saint-Pierre, terres agricoles de la plaine, et massifs forestiers périurbains.

## 3. Services écosystémiques ciblés

RIVE structure l'analyse selon les grandes familles de services écosystémiques (classification CICES / TEEB adaptée au contexte laurentien) :

**Services de régulation** — régulation des crues et laminage des débits par les plaines inondables et milieux humides ; filtration de l'eau et rétention des nutriments/sédiments ; séquestration et stockage du carbone (forêts, sols humides) ; régulation du microclimat urbain et atténuation des îlots de chaleur ; stabilisation des berges et contrôle de l'érosion par les bandes riveraines.

**Services d'approvisionnement** — eau brute, bois, ressources halieutiques du lac Saint-Pierre, production agricole des plaines.

**Services culturels** — récréation (chasse, pêche, plein air, ornithologie), valeur paysagère, patrimoine naturel et identité régionale, éducation et recherche.

**Services de soutien / habitat** — habitats pour la biodiversité, connectivité écologique et corridors, frayères et zones de reproduction.

Chaque service sera associé à un ou plusieurs **indicateurs cartographiables** et, lorsque possible, à une **valeur économique** (transfert de bénéfices) pour appuyer l'arbitrage politique.

## 4. Sources de données

Le système est conçu pour fusionner trois grandes classes de données :

**Observations de terrain** — relevés de végétation, qualité de l'eau, inventaires fauniques, points de validation (vérité-terrain) pour calibrer la télédétection. Ces données arrivent ponctuellement et doivent être horodatées et géolocalisées avec précision. L'outil de *Field Collection* de GeoLibre (saisie de points/lignes/polygones par GPS ou sur carte, avec formulaire personnalisé) couvre directement ce besoin.

**Télédétection** — imagerie **optique** (drone haute résolution, satellite type Sentinel-2/Planet pour indices spectraux NDVI/NDWI/EVI), **LiDAR** (structure de canopée, modèles numériques de terrain et de surface, hauteur de végétation), et **radar** (SAR Sentinel-1 pour l'humidité des sols, la détection d'inondations et le suivi tout-temps). Ces données sont volumineuses et gagnent à être servies en formats cloud-native (COG, Zarr).

**Cartes thématiques** — cartographie des milieux humides (CIC/MELCCFP), couvert forestier et peuplements, occupation du sol, zones inondables, données cadastrales et de zonage, réseau hydrographique (GRHQ), limites de bassins versants et d'aires protégées.

Un **catalogue de métadonnées** documentera pour chaque couche : source, date, résolution, précision, licence et statut de validation.

## 5. Enjeux et pressions à cartographier

Les pressions prioritaires sur le territoire incluent la **perte et la dégradation des milieux humides** (drainage agricole, remblai urbain), l'**artificialisation des berges** et la perte de bandes riveraines, la **pression agricole** sur la qualité de l'eau du lac Saint-Pierre (nutriments, sédiments, cultures en plaine inondable), l'**étalement urbain** et l'imperméabilisation, la **fragmentation** des habitats et corridors, et les **effets des changements climatiques** (régimes de crues, espèces envahissantes, stress thermique).

Pour chaque enjeu, RIVE vise à croiser *valeur du service rendu* × *niveau de pression* × *faisabilité d'action* afin de hiérarchiser les interventions.

## 6. Priorisation selon le cadre COP15

L'objectif « 30x30 » du Cadre de Kunming-Montréal offre une grille de priorisation directement opérationnelle :

- **Cible 3 (conservation)** — identifier les 30 % du territoire à la plus haute valeur écologique à protéger en priorité ; suivre le pourcentage effectivement sous protection.
- **Cible 2 (restauration)** — repérer les écosystèmes dégradés (milieux humides drainés, berges artificialisées) candidats à la restauration, pour atteindre 30 % en restauration effective.
- **Cible 11 (services écosystémiques)** — maintenir et renforcer les services rendus par la nature aux populations.
- **Cible 12 (nature en ville)** — accroître les espaces verts et bleus urbains et leurs bénéfices.

RIVE traduira ces cibles en couches de suivi et en tableaux de bord d'avancement, permettant à la Ville et aux MRC de situer leur territoire par rapport aux engagements nationaux et internationaux.

## 7. Alignement avec la gestion de l'eau au Québec

Parce que Trois-Rivières chevauche trois zones d'OBV, RIVE doit produire des synthèses **par bassin versant** compatibles avec les **plans directeurs de l'eau**. Le PDE contient le portrait, le diagnostic, les enjeux, une orientation et un plan d'action à l'échelle du bassin ; RIVE peut alimenter directement ces sections en fournissant portrait cartographique, indicateurs de diagnostic et suivi des actions. La plateforme se positionne ainsi comme un **outil de concertation** pour les tables de gestion intégrée de l'eau, en cohérence avec la *Loi affirmant le caractère collectif des ressources en eau* (2009).

## 8. Parties prenantes et usages

Utilisateurs visés : services d'urbanisme et d'environnement de la **Ville de Trois-Rivières**, **MRC** de la région, **OBV** et tables de concertation, **Réserve de la biosphère du lac Saint-Pierre**, ministères (MELCCFP), milieu de la recherche (UQTR), organismes de conservation, et le **grand public** pour la transparence et la mobilisation.

Usages types : arbitrer un projet d'aménagement au regard de sa valeur écologique ; cibler des parcelles de restauration ; documenter un PDE ou un plan d'urbanisme ; produire un tableau de bord d'avancement 30x30 ; appuyer une demande de financement.

## 9. Principes de conception

RIVE est **open source**, **cloud-native**, **responsive** (bureau, web, mobile), **accessible** (WCAG, bilinguisme FR/EN possible) et **partageable** (liens, embarquement iframe, cartes-récits). Elle privilégie des formats ouverts et interopérables (GeoJSON, GeoParquet, COG, PMTiles) et une architecture qui sépare données, traitement et présentation pour rester évolutive.

La brique cartographique retenue est **GeoLibre** (projet opengeos, bâti sur MapLibre GL JS, DuckDB-WASM Spatial et deck.gl), qui fournit nativement le socle GIS moderne et évite de réinventer le rendu, le traitement client et le partage. Voir le document d'architecture pour la justification et l'intégration.

## 10. Phasage

**Phase 1 — Cadrage et prototype (en cours).** Documents de planification et d'architecture, prototype web avec données d'exemple sur Trois-Rivières, modèle d'indicateurs de démonstration.

**Phase 2 — Données réelles et pipelines.** Intégration des cartes thématiques et de la télédétection, chaînes de traitement (indices spectraux, LiDAR, détection de milieux humides), catalogue de métadonnées.

**Phase 3 — Modèle de services écosystémiques.** Calcul des indicateurs par service, valeur économique, priorisation 30x30, validation terrain.

**Phase 4 — Déploiement et concertation.** Mise en ligne, formation des utilisateurs, intégration aux PDE et plans d'urbanisme, tableaux de bord de suivi et cartes-récits publiques.

---

*Sources principales : CBD — texte final du Cadre de Kunming-Montréal ; MELCCFP / ROBVQ — gestion intégrée de l'eau par bassin versant et plans directeurs de l'eau ; UNESCO / Réserve de la biosphère du lac Saint-Pierre. Voir la section Références du README.*
