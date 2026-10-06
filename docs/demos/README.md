# Démos GeoLibre — démontrer la puissance de la plateforme

Deux démonstrations montrent ce que GeoLibre apporte à RIVE au-delà du simple
affichage : un **SIG d'analyse complet** et un **outil de récit cartographique**,
tous deux sur la donnée réelle du territoire, sans serveur ni installation.

Elles se lancent depuis le prototype : onglet **GeoLibre**, boutons
**« Démo SQL »** et **« Carte-récit COP15 »**. Chaque bouton charge le projet
`.geolibre.json` correspondant dans GeoLibre via le paramètre **`?url=`** (le
projet est récupéré depuis son URL publique — immédiat une fois le site publié
sur GitHub Pages ; en local, définir `VITE_GEOLIBRE_PUBLIC_BASE` pour
prévisualiser, sinon GeoLibre s'ouvre vide).

## 1. SQL spatial dans le navigateur (DuckDB-WASM)

**Projet** : `prototype/public/rive-sql-demo.geolibre.json` — extrait réel de la
CMHPQ 2023 (MELCCFP) pour Trois-Rivières, **768 polygones** de milieux humides,
plus les unités d'analyse. **Requêtes** : `docs/demos/requetes-sql.sql`.

Ouvrir *Processing → SQL Workspace*, coller les requêtes. On calcule en direct,
côté client : la superficie de milieux humides **par classe** (~4 305 ha au
total), la répartition **par niveau de confiance**, une **jointure spatiale**
(`ST_Intersects`) qui chiffre les hectares de milieux humides tombant dans les
zones **prioritaires « Très élevée »**, et un **contrôle qualité** `ST_Area` vs
superficie déclarée. La requête 7 montre le passage à l'échelle : lire un
**GeoParquet distant** par `read_parquet(URL)` sans le télécharger (streaming
HTTP range) — le modèle cloud-native visé en production.

*Vérification* : les chiffres par classe reproduisent le calcul de contrôle RIVE
sur les mêmes 768 polygones (`prototype/public/data/mh_trois_rivieres_stats.json`),
puisque les deux partent de l'extrait identique.

*Note données* : extrait borné et simplifié (~50 m) à des fins de démonstration.
En production, convertir le CMHPQ régional complet en GeoParquet (voir ci-dessous).

## 2. Carte-récit COP15 / 30x30

**Projet** : `prototype/public/rive-storymap-cop15.geolibre.json` — une
**carte-récit** (story map) à défilement : 5 chapitres parcourent les unités
prioritaires (rives et delta du lac Saint-Pierre, confluence Saint-Maurice,
massif forestier périurbain, centre-ville), chacun rattaché à une **cible du
Cadre de Kunming-Montréal** (cibles 2, 3, 11, 12). La caméra vole de zone en
zone ; les couches milieux humides + priorité s'affichent en contexte.

GeoLibre construit et présente ces récits sur la carte vivante (*Project → Story
Map*) et **exporte une page HTML autonome** : un seul fichier à envoyer à un
conseil municipal ou à un OBV avant une séance.

## Reproduire / mettre à jour

```bash
# 1. (Optionnel) régénérer l'extrait CMHPQ réel — voir tools/ (données ArcGIS)
# 2. Regénérer les trois projets .geolibre.json à partir des GeoJSON :
python3 tools/build_geolibre_projects.py
# 3. Regénérer la démo autonome (RIVE-demo.html) :
python3 tools/build_standalone.py
```

## Vers la production : GeoParquet

L'extrait de démo est du GeoJSON (lisible partout, mais non optimisé). En
production, convertir le CMHPQ régional en **GeoParquet** (spatialement trié,
compressé) et l'héberger comme fichier statique — **GitHub Pages convient** : il
sert les intervalles d'octets (HTTP range), donc GeoLibre lit le fichier par
`read_parquet('https://<utilisateur>.github.io/<dépôt>/data/mh_trois_rivieres.parquet')`
en **streaming** — pas de téléchargement complet, pas de serveur cartographique.
Conversion type (hors de cet environnement, qui n'a pas accès aux paquets) :

```bash
pip install duckdb
# dans DuckDB : INSTALL spatial; LOAD spatial;
#   COPY (SELECT * FROM ST_Read('mh_trois_rivieres.geojson'))
#   TO 'mh_trois_rivieres.parquet' (FORMAT parquet);
```
