# RIVE — Services écosystémiques de la région de Trois-Rivières

**Référentiel Interactif des services écosystémiques et de la Valeur Écologique.**

Plateforme d'aide à la décision, open source et cloud-native, qui relie une base de données géospatiale (terrain, télédétection, cartes thématiques) à des algorithmes de traitement pour produire des indicateurs clairs sur les services écosystémiques du territoire de Trois-Rivières — au service de l'aménagement, des politiques publiques et de la concertation.

Cadres de référence : Cadre mondial de la biodiversité de **Kunming-Montréal (COP15)** — objectif « 30x30 » — et **plans directeurs de l'eau** des organismes de bassins versants (OBV) du Québec.

## Contenu du dépôt

```
docs/
  01-planification.md   Objectifs, territoire, services, données, enjeux, COP15, OBV, phasage
  02-architecture.md    Socle GeoLibre, modèle de données, pipelines, déploiement
prototype/              Tableau de bord web (Vite + React + MapLibre GL JS)
  public/data/          Données GeoJSON d'exemple (Trois-Rivières)
  src/                  Application React
project/
  rive-trois-rivieres.geolibre.json   Projet ouvrable dans GeoLibre Web
```

## Voir tout de suite (sans installation)

Ouvrez **`RIVE-demo.html`** (double-clic). C'est une version autonome, sans dépendances ni
serveur : carte, indicateurs, fiches par zone et **panneau GeoLibre embarqué** (bascule
« Carte RIVE / GeoLibre » en haut). Les données sont intégrées au fichier ; seule une connexion
Internet est requise (fond de carte et GeoLibre chargés depuis le web).

> Le fichier `prototype/index.html` ne s'ouvre **pas** par double-clic : c'est le point d'entrée
> d'une application Vite qui doit être servie (`npm run dev`) ou compilée (`npm run build`). Ouvert
> directement, il affiche une page vide — c'est normal. Utilisez `RIVE-demo.html` pour un aperçu
> immédiat, ou lancez le serveur ci-dessous pour la version complète.

## Démarrer le prototype (version développement)

```bash
cd prototype
npm install
npm run dev      # http://localhost:5173
npm run build    # build statique dans dist/
```

## Publier sur GitHub Pages (mode de diffusion privilégié)

Le dépôt inclut un workflow (`.github/workflows/deploy.yml`) qui **construit et publie
automatiquement** le tableau de bord sur GitHub Pages à chaque `push` sur `main`.

Mise en route (une fois) : dans **Settings → Pages → Build and deployment**, choisir
**Source : GitHub Actions**. Le prochain push publie le site à
`https://<utilisateur>.github.io/<dépôt>/`.

> **La page publiée affiche le README (et non l'app) ?** C'est que Pages est en mode
> **« Deploy from a branch »** : GitHub rend alors le `README.md` de la racine et **ignore**
> le site construit par le workflow. Correctif : **Settings → Pages → Source : GitHub Actions**,
> puis relancer le workflow (onglet *Actions* → *Déployer RIVE…* → *Run workflow*, ou un
> nouveau push). Par sécurité, un `index.html` de secours à la racine redirige vers la démo
> autonome `RIVE-demo.html` si jamais le mode « branche » reste actif — mais l'app complète
> (onglet GeoLibre, démos SQL et carte-récit) n'est servie que via GitHub Actions.

Ce que le workflow met en ligne, comme fichiers statiques : le tableau de bord (Vite/React),
les trois projets `*.geolibre.json`, l'extrait CMHPQ réel, la démo autonome `RIVE-demo.html`
et les ressources `demos/`. Il régénère les projets et la démo (`tools/build_*.py`) puis
compile avec le bon **sous-chemin** (`VITE_BASE=/<dépôt>/`), pour que les assets et les
`fetch` de projets résolvent correctement.

Pourquoi Pages change la donne — une fois les `*.geolibre.json` servis à des **URL publiques
github.io** :

- les **liens de partage GeoLibre `?url=`** fonctionnent (GitHub Pages répond avec
  `access-control-allow-origin: *`) : chaque projet et la **carte-récit COP15** deviennent une
  URL partageable, ouvrable par n'importe qui dans GeoLibre Web — idéal pour un conseil ou un OBV ;
- la lecture **GeoParquet en streaming HTTP range** (`read_parquet('https://…')`) devient
  possible, car Pages sert les intervalles d'octets : le socle « cloud-native, zéro serveur ».

Dans l'app, l'onglet **GeoLibre** expose ces liens (bouton *Copier le lien*, *Ouvrir dans un
onglet*).

La bascule « GeoLibre » en haut de l'app affiche GeoLibre Web dans un panneau embarqué (iframe) et
**charge le projet RIVE** par le paramètre **`?url=`** — le seul mécanisme d'embarquement toujours
actif côté GeoLibre. (Le pont `postMessage`/`?embed=1` d'une version antérieure ne fonctionne pas sur
le viewer hébergé : il est restreint aux origines explicitement autorisées par le déploiement via
`sharing.embedOrigins`, ce que `web.geolibre.app` ne fait pas — voir la
[doc d'embarquement](https://geolibre.app/user-guide/embedding/).)

Conséquence : GeoLibre doit récupérer le `.geolibre.json` depuis une **URL publique**. Une fois le
site publié sur GitHub Pages, les projets sont servis en https et le panneau se charge tout seul,
localement comme en ligne. En développement local (`localhost` / `file://`), `web.geolibre.app` ne
peut pas lire le projet (non public) : GeoLibre s'ouvre **vide** avec un rappel de chargement manuel
(*Add Data → ArcGIS*). Pour prévisualiser en local contre des fichiers déjà publiés, définissez
`VITE_GEOLIBRE_PUBLIC_BASE` (ex. l'URL GitHub Pages du site) dans `prototype/.env.local`.

Le tableau de bord repose sur **deux couches**, pour rester honnête et lisible :

- **Milieux humides potentiels — MELCCFP 2023** : *donnée réelle*, servie en direct par le service ArcGIS officiel, cliquable (attributs réels).
- **Unités d'analyse — priorisation 30x30** : *cadre méthodologique* de démonstration (valeurs illustratives), coloré par priorité (valeur des services × pression).

Trois onglets : **Couches** (visibilité + légendes), **Indicateurs** (classement des unités, fiche détaillée par service), **Méthodo** (métadonnées des sources, modèle de score, cadre COP15, et **accès direct à la connaissance** — liens vers Données Québec, MELCCFP, ROBVQ, UNESCO, GeoLibre, CBD).

> Les anciennes couches synthétiques (couvert forestier, bandes riveraines, stations de terrain) ont été **retirées** : elles ne représentaient pas d'information réelle. Leur réintégration à partir de sources réelles (hydrographie GRHQ, bandes riveraines dérivées par tampon, etc.) est décrite en Phase 2 (`docs/02-architecture.md`).

### Donnée réelle : milieux humides potentiels (MELCCFP, CMHPQ 2023)

La couche des milieux humides n'est **pas** une donnée de démonstration : elle est servie en direct par le
service ArcGIS REST officiel du MELCCFP (Cartographie des milieux humides potentiels du Québec, CMHPQ 2023) :

```
https://geo.environnement.gouv.qc.ca/donnees/rest/services/Biodiversite/MH_potentiels/MapServer
```

Dans le tableau de bord RIVE, elle est rendue via l'export dynamique ArcGIS (symbologie officielle par
classe : marais, marécage, tourbières…) et **cliquable** : un clic interroge le service (`identify`) et
affiche les attributs réels (classe, type, superficie, confiance, source). **Zoomez au niveau ≥ 10** pour
l'afficher (le service masque la couche au-delà du 1:600 000).

**Chargement dans GeoLibre** : le projet `rive-trois-rivieres.geolibre.json` (copies dans `project/` et
`prototype/public/`) référence cette couche en tuiles d'export ArcGIS et se charge automatiquement dans le
panneau GeoLibre du prototype. Manuellement : *Add Data → ArcGIS*, coller l'URL du MapServer ci-dessus
(GeoLibre consomme nativement les services ArcGIS/WMS/WFS).

#### Si GeoLibre « n'affiche rien » après l'ajout

Deux causes fréquentes, dans l'ordre :

1. **Échelle** — le service **masque la couche au-delà du 1:600 000**. Après l'ajout, **zoomez sur la
   région (niveau ≈ 10+)** : à l'échelle de la province, rien ne s'affiche, c'est normal.
2. **CORS** — la version web hébergée (`web.geolibre.app`) est un autre domaine ; si le serveur
   gouvernemental refuse la requête cross-origin, la couche ne se charge pas. Solutions : utiliser
   **GeoLibre Desktop** (non soumis au CORS du navigateur), ou l'alternative **WMS**
   (`https://geo.environnement.gouv.qc.ca/donnees/services/Biodiversite/MH_potentiels/MapServer/WMSServer`
   — endpoint OGC sous `/donnees/services/`, sans « rest » ; couche `Milieux_humides_potentiels11904`),
   *Add Data → WMS*. Le projet `.geolibre.json` fourni évite le problème en passant par les tuiles
   d'export (images, non soumises au CORS).

Le rendu des tuiles-images (ArcGIS `export`, WMS `GetMap`) contourne le CORS ; c'est pourquoi le
tableau de bord RIVE affiche la couche de façon fiable là où l'ajout web peut échouer.

> Les unités d'analyse restent un **exemple de démonstration** autour de Trois-Rivières, en attendant
> l'intégration des données de production.

## Socle technique : GeoLibre

RIVE s'appuie sur **[GeoLibre](https://geolibre.app/)** (projet opengeos, bâti sur MapLibre GL JS, DuckDB-WASM Spatial et deck.gl) comme socle GIS, selon deux modes :

- **Mode projet** — fichiers `.geolibre.json` ouvrables directement dans GeoLibre Web
  (`https://web.geolibre.app/?url=<url-du-projet>`), pour le partage et l'exploration avancée.
- **Mode tableau de bord** — l'app de ce dépôt, taillée pour les décideurs, qui réutilise les mêmes
  données et formats.

GeoLibre fournit nativement le rendu, les formats cloud-native (GeoParquet, PMTiles, COG, Zarr, STAC),
la collecte terrain, le traitement (indices spectraux NDVI/NDWI/EVI, LiDAR, statistiques zonales,
SQL spatial DuckDB) et le partage (embeds, cartes-récits). Voir `docs/02-architecture.md`.

### Démos (montrer la puissance de la plateforme)

Deux démonstrations, sur la **donnée réelle du territoire**, lancées depuis l'onglet **GeoLibre**
(boutons **« Démo SQL »** et **« Carte-récit COP15 »**) — voir `docs/demos/`.

- **SQL spatial dans le navigateur** — un extrait réel de la CMHPQ 2023 (768 polygones de milieux
  humides pour Trois-Rivières) interrogé dans le *SQL Workspace* (DuckDB-WASM) : superficie par classe
  (~4 305 ha), jointure spatiale `ST_Intersects` chiffrant les milieux humides des zones prioritaires,
  contrôle qualité `ST_Area`. Requêtes prêtes : `docs/demos/requetes-sql.sql`. Aucun serveur.
- **Carte-récit COP15 / 30x30** — une *story map* à défilement (5 chapitres) reliant les unités
  prioritaires aux cibles du Cadre de Kunming-Montréal, exportable en page HTML autonome.

Les projets sont générés par `python3 tools/build_geolibre_projects.py`.

## Feuille de route

Phase 1 (en cours) : cadrage, prototype, modèle d'indicateurs de démonstration.
Phase 2 : données réelles + pipelines (télédétection optique/LiDAR/SAR, milieux humides).
Phase 3 : modèle de services écosystémiques, valeur économique, priorisation 30x30 validée.
Phase 4 : déploiement, intégration aux PDE et plans d'urbanisme, cartes-récits publiques.

## Références

- CBD — Cadre mondial de la biodiversité de Kunming-Montréal (COP15) : https://www.cbd.int/article/cop15-final-text-kunming-montreal-gbf-221222
- MELCCFP — Cartographie des milieux humides potentiels du Québec (CMHPQ 2023), Données Québec : https://www.donneesquebec.ca/recherche/fr/dataset/milieux-humides-potentiels
- MELCCFP — Service ArcGIS REST (milieux humides potentiels) : https://geo.environnement.gouv.qc.ca/donnees/rest/services/Biodiversite/MH_potentiels/MapServer
- MELCCFP — Gestion intégrée des ressources en eau par bassin versant : https://www.environnement.gouv.qc.ca/eau/bassinversant/gire-bassins-versants.htm
- ROBVQ — OBV du Québec : https://robvq.qc.ca/obv-du-quebec/
- Ville de Trois-Rivières — Gestion intégrée de l'eau : https://www.v3r.net/services-a-la-population/eau/gestion-integree-de-l-eau/
- UNESCO — Réserve de la biosphère du lac Saint-Pierre : https://www.unesco.org/en/mab/lac-saint-pierre
- GeoLibre : https://geolibre.app/

## Licence

À définir (recommandé : code sous MIT, données sous licences ouvertes documentées par couche).
