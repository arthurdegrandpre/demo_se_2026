# RIVE — Architecture technique

Version 0.1 · Juillet 2026

---

## 1. Principes directeurs

L'architecture suit quatre principes : **séparation des responsabilités** (données / traitement / présentation), **formats ouverts et cloud-native**, **calcul au plus près de la donnée** (côté client quand c'est possible, sidecar serveur quand c'est nécessaire), et **réutilisation plutôt que réinvention** en s'appuyant sur un socle GIS open source mature.

## 2. Choix du socle : GeoLibre

Plutôt que d'assembler MapLibre, un moteur de traitement et un système de partage à la main, RIVE adopte **GeoLibre** (opengeos) comme socle GIS. GeoLibre est une plateforme GIS open source, légère et cloud-native, qui tourne dans le navigateur, sur le bureau (Tauri), sur mobile (Android) et dans Jupyter, en gardant les données locales et privées.

Ce que GeoLibre apporte directement, sans développement :

- **Rendu cartographique** MapLibre GL JS (pan/zoom/rotation/tilt, terrain 3D, globe, basemaps OpenFreeMap ou fond neutre).
- **Formats avancés** en entrée : XYZ, WMS, WFS, WMTS, ArcGIS, STAC ; GeoParquet, FlatGeobuf, PMTiles, Zarr, OSM PBF ; COG, GeoTIFF, NetCDF/HDF cloud-optimisés, MBTiles ; LiDAR, 3D Tiles, deck.gl ; bases DuckDB et PostgreSQL/PostGIS.
- **Traitement** vectoriel (Turf.js côté client, sidecar GeoPandas optionnel) et raster (sidecar rasterio avec repli client) : buffers, dissolve, overlay, jointures spatiales, grilles H3, pentes/exposition, statistiques zonales, calculatrice raster, et une **boîte à outils d'indices spectraux (NDVI, NDWI, EVI)** directement pertinente pour notre télédétection optique.
- **SQL spatial** DuckDB-WASM dans le navigateur (avec moteurs PGlite/PostGIS et Apache Sedona), streaming HTTP range sur URL distantes.
- **Field Collection** pour la saisie terrain (points/lignes/polygones par GPS ou tap, formulaire personnalisé).
- **Partage** : format de projet `.geolibre.json`, viewer web embarquable par paramètres d'URL (`?url=…&layout=compact&panels=none&maponly`), **cartes-récits** (story maps) avec export HTML autonome, et collaboration multi-utilisateurs.
- **Segmentation IA** (SamGeo/SAM) et **assistant en langage naturel** (fournisseur au choix, clé API propre) pour interroger et manipuler les données de façon auditables.

**Stratégie d'intégration.** RIVE se construit comme une **couche métier au-dessus de GeoLibre**, selon deux modes complémentaires :

1. **Mode « projet »** — RIVE produit des fichiers `.geolibre.json` décrivant les couches de services écosystémiques et leurs styles. N'importe qui peut les ouvrir dans GeoLibre Web (`https://web.geolibre.app/?url=…`) ou l'app de bureau. Coût de développement quasi nul, partage immédiat.
2. **Mode « tableau de bord »** — une application web dédiée (le *prototype* de ce dépôt) qui embarque MapLibre et une interface d'aide à la décision (indicateurs, priorisation 30x30, panneaux thématiques) taillée pour les décideurs non-spécialistes. Elle peut embarquer le viewer GeoLibre en iframe pour l'exploration avancée, et consommer les mêmes données/formats.

Les deux modes partagent le **même entrepôt de données** et les mêmes formats, garantissant la cohérence.

## 3. Vue d'ensemble en couches

```
┌─────────────────────────────────────────────────────────────┐
│  PRÉSENTATION                                                 │
│  • Tableau de bord RIVE (React + MapLibre)  ← décideurs      │
│  • GeoLibre Web / Desktop / Mobile          ← analystes      │
│  • Cartes-récits & embeds iframe            ← public         │
├─────────────────────────────────────────────────────────────┤
│  API / SERVICES                                              │
│  • Tuiles vectorielles (PMTiles) & raster (COG)             │
│  • API d'indicateurs (GeoParquet / GeoJSON)                 │
│  • Catalogue STAC + métadonnées                             │
├─────────────────────────────────────────────────────────────┤
│  TRAITEMENT                                                   │
│  • Indices spectraux (NDVI/NDWI/EVI) — optique              │
│  • Métriques LiDAR (hauteur canopée, MNT/MNS)              │
│  • SAR (humidité sol, inondations)                          │
│  • Modèle de services écosystémiques & score 30x30         │
│  • Statistiques zonales par bassin versant / zone          │
├─────────────────────────────────────────────────────────────┤
│  DONNÉES                                                      │
│  • Vecteur : GeoParquet / FlatGeobuf / GeoJSON             │
│  • Raster : COG / Zarr                                       │
│  • Terrain : Field Collection (GeoLibre)                    │
│  • Base : PostGIS (référentiel) + DuckDB (analytique)      │
└─────────────────────────────────────────────────────────────┘
```

## 4. Modèle de données

**Entités spatiales de référence.** Zones d'analyse (unités territoriales : quartiers, MRC, sous-bassins), bassins versants (limites OBV), aires protégées, occupation du sol.

**Couches thématiques.** Milieux humides, couvert forestier / peuplements, bandes riveraines, zones inondables, réseau hydrographique, stations d'observation terrain.

**Table d'indicateurs.** Pour chaque unité d'analyse et chaque date : valeurs par service écosystémique (régulation des crues, filtration, carbone, habitat, récréation…), pression, et scores dérivés. Stockée en **GeoParquet** (analytique, colonne) et exposée en **GeoJSON** pour l'affichage.

**Modèle de score de service écosystémique (démonstration).** Chaque unité reçoit un score composite normalisé 0–100 :

```
Score_SE = Σ (poids_service × indicateur_normalisé_service)
Priorité = f(Score_SE, Pression, Faisabilité)
```

Les pondérations sont paramétrables et documentées ; la priorisation 30x30 classe ensuite les unités pour identifier le tiers supérieur à conserver et les zones dégradées à restaurer.

**Métadonnées.** Chaque couche porte : source, date, résolution, précision, licence, statut de validation — exposées via un **catalogue STAC** compatible GeoLibre.

## 5. Chaînes de traitement (pipelines)

**Optique** → correction/mosaïque → indices spectraux (NDVI végétation, NDWI eau/humidité, EVI) → classification occupation du sol / détection milieux humides → validation par points terrain. Réalisable avec la boîte à outils Spectral Index de GeoLibre (côté client) pour le prototype, puis via un sidecar rasterio/Python pour la production.

**LiDAR** → nuage de points → MNT/MNS → hauteur de canopée, structure verticale, volumes → indicateurs de carbone forestier et d'habitat.

**Radar (SAR)** → Sentinel-1 → humidité du sol, cartographie d'inondation tout-temps, suivi saisonnier des milieux humides.

**Fusion & indicateurs** → statistiques zonales (raster × unités d'analyse) via DuckDB Spatial / rasterio → table d'indicateurs → score de service écosystémique → priorisation 30x30.

Les pipelines sont **idempotents et versionnés** : chaque couche produite référence les intrants et la version d'algorithme, pour la traçabilité et la reproductibilité exigées par un usage politique.

## 6. Stockage et service des données

Pour un premier déploiement à faible coût, les données peuvent être servies en **statique cloud-native** : PMTiles (vecteur) et COG (raster) sur un simple hébergement d'objets/CDN, lus par plage HTTP directement par le navigateur — sans serveur de tuiles. C'est l'approche privilégiée pour la diffusion publique et l'embarquement.

Pour l'édition, la concertation et les requêtes lourdes, un **PostGIS** sert de référentiel autoritatif et **DuckDB** (in-process, WASM côté client ou serveur) assure l'analytique rapide. Cette dualité « statique pour lire, base pour écrire » maximise performance et simplicité.

## 7. Application prototype (ce dépôt)

Le prototype (`/prototype`) est un scaffold **Vite + React + MapLibre GL JS** qui matérialise le *mode tableau de bord* :

- carte interactive responsive avec couches de services écosystémiques d'exemple (données GeoJSON autour de Trois-Rivières) ;
- panneau de couches (visibilité, opacité, légendes) ;
- panneau d'indicateurs et de priorisation 30x30 (scores par zone, filtres) ;
- fiche contextuelle au clic (valeur du service, pression, priorité) ;
- lien direct vers l'exploration avancée dans GeoLibre Web.

Il est conçu pour migrer sans friction vers les données réelles : mêmes formats (GeoJSON → GeoParquet/PMTiles), même modèle d'indicateurs, mêmes conventions de couches.

## 8. Déploiement

- **Prototype / diffusion publique** : site statique sur **GitHub Pages** (mode privilégié, automatisé par `.github/workflows/deploy.yml` : build Vite + projets GeoLibre + démo autonome, publiés à chaque `push`). Alternatives équivalentes : Netlify ou hébergement d'objets + CDN. Aucune donnée sensible côté serveur ; calcul côté client. Les URL publiques github.io activent le partage GeoLibre `?url=` et la lecture GeoParquet en streaming HTTP range.
- **Production analytique** : conteneurs Docker (API d'indicateurs, sidecars de traitement, PostGIS). GeoLibre fournit lui-même une image Docker pour la version navigateur.
- **Terrain / hors-ligne** : app GeoLibre mobile (Android) avec zones téléchargées hors-ligne pour la collecte.

## 9. Sécurité, gouvernance et accessibilité

Données ouvertes par défaut, licences documentées, respect de la vie privée (aucune donnée personnelle dans les couches publiques). Accessibilité WCAG, contrastes et navigation clavier dans le tableau de bord. Bilinguisme FR/EN prévu par la couche i18n (GeoLibre gère l'internationalisation ; le prototype externalise ses chaînes). Traçabilité complète des traitements pour la défendabilité en contexte décisionnel et politique.

## 9b. Première donnée réelle intégrée : milieux humides MELCCFP

La couche des milieux humides est désormais une **donnée réelle**, consommée en direct depuis le service
ArcGIS REST officiel du MELCCFP (Cartographie des milieux humides potentiels du Québec, CMHPQ 2023,
couche `0`). Elle illustre le principe « réutilisation plutôt que réinvention » et le chargement natif :

- **GeoLibre** : le projet `rive-trois-rivieres.geolibre.json` (format officiel — `mapView`,
  `basemapStyleUrl`, `layers[].source`, `styles`) charge la couche en tuiles d'export ArcGIS (type `xyz`)
  et se charge dans le panneau embarqué via le paramètre **`?url=`** (seul mécanisme d'embarquement
  toujours actif ; le pont `postMessage`/`?embed=1` est restreint par `sharing.embedOrigins` côté
  déploiement et inopérant sur le viewer hébergé). GeoLibre récupère donc le `.geolibre.json` depuis
  une **URL publique** — immédiat une fois le site publié sur GitHub Pages. Chargement manuel : *Add Data →
  ArcGIS*, ou WMS via `https://geo.environnement.gouv.qc.ca/donnees/services/Biodiversite/MH_potentiels/MapServer/WMSServer`
  (endpoint OGC sous `/donnees/services/`, sans « rest »).
- **Tableau de bord RIVE** : l'export dynamique ArcGIS
  (`/export?bbox={bbox-epsg-3857}&…&f=image`) est branché comme source raster MapLibre, ce qui restitue
  la symbologie officielle par `CLASSE`. Le clic déclenche une requête `identify` renvoyant les attributs
  réels (CLASSE, TYPE, PHYSIONOMIE, SYS_TROPHIQUE, SUPERFICIE, CONFIANCE, SOURCE).

Ce patron — service OGC/ArcGIS distant rendu en tuiles + identification au clic — est **généralisable**
aux autres couches thématiques gouvernementales (zones inondables, hydrographie GRHQ, aires protégées)
sans téléchargement ni hébergement. Pour l'analyse lourde (statistiques zonales), on bascule vers un
extrait local en GeoParquet/FlatGeobuf, également natif dans GeoLibre.

Limite à connaître : le service masque la couche au-delà du 1:600 000 (rendu à partir du niveau de zoom
≈ 10) ; la vue par défaut du tableau de bord est donc centrée sur la région à un zoom adéquat.

## 9c. Couches de démonstration retirées et plan de réintégration

Les couches synthétiques initiales (couvert forestier, **bandes riveraines**, stations de terrain) ont
été **retirées** du prototype : ne représentant pas d'information réelle, elles nuisaient à la lisibilité
et à la crédibilité de l'outil. Le prototype ne conserve donc que la donnée réelle (milieux humides) et le
cadre méthodologique explicitement marqué « démo » (unités d'analyse).

Réintégration prévue à partir de sources réelles :

- **Bandes riveraines** — produit *dérivé* plutôt que saisi : tampon de 10–15 m autour du réseau
  hydrographique (GRHQ), conformément à la *Politique de protection des rives, du littoral et des plaines
  inondables*, calculé avec Turf.js/GeoPandas (buffer) puis croisé avec l'occupation du sol pour repérer
  les rives à restaurer. C'est un indicateur beaucoup plus utile qu'une couche de lignes illustratives.
- **Couvert forestier** — peuplements écoforestiers (MRNF) ou classification NDVI/LiDAR.
- **Observations terrain** — via l'outil *Field Collection* de GeoLibre (données réelles horodatées).

## 10. Prochaines étapes techniques

Brancher un flux Sentinel-2 via STAC et produire un NDVI de référence ; dériver les bandes riveraines par
tampon sur la GRHQ ; implémenter le calcul de **statistiques zonales** (surface de milieux humides réels
par unité d'analyse) en DuckDB Spatial, pour remplacer les scores illustratifs par des valeurs réelles ;
formaliser le schéma de la table d'indicateurs ; publier le `.geolibre.json` régional et l'héberger pour un
chargement direct dans le panneau GeoLibre embarqué.
