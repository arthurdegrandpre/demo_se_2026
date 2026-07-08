// Catalogue des couches + métadonnées + accès à la connaissance du prototype RIVE.
//
// Deux couches seulement, pour rester honnête et lisible :
//  1) Milieux humides potentiels — DONNÉE RÉELLE, service ArcGIS REST du MELCCFP
//     (CMHPQ 2023), chargée nativement (GeoLibre) et rendue en direct (RIVE).
//  2) Unités d'analyse — CADRE MÉTHODOLOGIQUE de priorisation 30x30 (valeurs
//     illustratives). Les anciennes couches synthétiques (bandes riveraines,
//     couvert forestier, stations) ont été retirées : elles ne représentaient
//     pas d'information réelle. Voir docs/02-architecture.md pour leur
//     réintégration à partir de sources réelles (Phase 2).

export const MELCCFP_MH = {
  service: 'https://geo.environnement.gouv.qc.ca/donnees/rest/services/Biodiversite/MH_potentiels/MapServer',
  // NB : l'endpoint OGC est sous /donnees/services/ (sans « rest »).
  wms: 'https://geo.environnement.gouv.qc.ca/donnees/services/Biodiversite/MH_potentiels/MapServer/WMSServer',
  layerId: 0,
  attribution: '© Gouvernement du Québec — MELCCFP, Cartographie des milieux humides potentiels du Québec (CMHPQ 2023)',
}

// Légende officielle (champ CLASSE) — couleurs reprises du service.
export const MH_CLASSES = [
  ['Eau peu profonde', '#6677cd'],
  ['Prairie humide', '#f5f57a'],
  ['Marais', '#ff8f7f'],
  ['Marécage', '#a3ff73'],
  ['Tourbière boisée', '#5c8944'],
  ['Tourbière ouverte indifférenciée', '#ffebaf'],
  ['Tourbière ouverte minérotrophe', '#f5ca7a'],
  ['Tourbière ouverte ombrotrophe', '#cdaa66'],
  ['Complexe palsique', '#df7fc2'],
  ['Milieu humide indifférencié', '#cccccc'],
]

export const PRIORITY_COLORS = {
  'Très élevée': '#7a0177',
  'Élevée': '#c51b8a',
  'Moyenne': '#f768a1',
  'Faible': '#fbb4b9',
}

export const SERVICES = [
  { key: 's_crue', label: 'Régulation des crues', color: '#2c7fb8', weight: 0.22 },
  { key: 's_filtration', label: 'Filtration de l’eau', color: '#41b6c4', weight: 0.22 },
  { key: 's_carbone', label: 'Stockage du carbone', color: '#238443', weight: 0.18 },
  { key: 's_habitat', label: 'Habitat / biodiversité', color: '#6a51a3', weight: 0.24 },
  { key: 's_recreation', label: 'Récréation / culturel', color: '#d95f0e', weight: 0.14 },
]

export const LAYERS = [
  {
    // DONNÉE RÉELLE — service ArcGIS REST du MELCCFP (rendu dynamique + identify).
    id: 'mh_melccfp',
    label: 'Milieux humides potentiels — MELCCFP 2023',
    type: 'arcgis-dynamic',
    url: MELCCFP_MH.service,
    layerId: MELCCFP_MH.layerId,
    attribution: MELCCFP_MH.attribution,
    visible: true,
    minzoom: 10,
    opacity: 0.8,
    identify: true,
    real: true,
  },
  {
    id: 'zones',
    label: 'Unités d’analyse — priorisation 30x30 (cadre méthodo.)',
    file: 'data/zones_analyse.geojson',
    type: 'fill',
    visible: true,
    legend: 'priority',
    interactive: true,
  },
]

// URL d'export ArcGIS dynamique → tuiles raster MapLibre ({bbox-epsg-3857}).
export function arcgisTileUrl(service, layerId) {
  return (
    `${service}/export?bbox={bbox-epsg-3857}&bboxSR=3857&imageSR=3857` +
    `&size=512,512&dpi=96&format=png32&transparent=true&layers=show:${layerId}&f=image`
  )
}

// URL d'identification ArcGIS (attributs réels au point cliqué).
export function arcgisIdentifyUrl(service, layerId, lng, lat, bounds, w, h) {
  const ext = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`
  return (
    `${service}/identify?geometry=${lng},${lat}&geometryType=esriGeometryPoint&sr=4326` +
    `&layers=all:${layerId}&tolerance=4&mapExtent=${ext}&imageDisplay=${w},${h},96` +
    `&returnGeometry=false&f=json`
  )
}

// ---- Métadonnées des sources (pour le panneau Méthodologie) ----
export const METADATA = [
  {
    couche: 'Milieux humides potentiels',
    reel: true,
    producteur: 'MELCCFP — Direction de la connaissance écologique',
    jeu: 'Cartographie des milieux humides potentiels du Québec (CMHPQ), version 2023',
    couverture: 'Province de Québec',
    echelle: 'Agrégation multi-sources — masquée au-delà du 1:600 000',
    typologie: '5 classes / 16 sous-classes (marais, marécage, tourbières, eau peu profonde…)',
    attributs: 'CLASSE, TYPE, PHYSIONOMIE, SYS_TROPHIQUE, SUPERFICIE (ha), CONFIANCE, SOURCE',
    diffusion: 'Données Québec (licence ouverte — voir la fiche du jeu de données)',
    lignee:
      'Assemblage de bases de données existantes (dont Canards Illimités Canada) produites à des ' +
      'échelles et pour des objectifs distincts ; un niveau de CONFIANCE accompagne chaque entité.',
    url: 'https://www.donneesquebec.ca/recherche/fr/dataset/milieux-humides-potentiels',
  },
  {
    couche: 'Fond de carte',
    reel: true,
    producteur: 'OpenFreeMap / OpenStreetMap',
    jeu: 'Tuiles vectorielles « positron »',
    couverture: 'Mondiale',
    diffusion: 'OpenStreetMap © contributeurs (ODbL)',
    url: 'https://openfreemap.org/',
  },
  {
    couche: 'Unités d’analyse & indicateurs',
    reel: false,
    producteur: 'RIVE (démonstration)',
    jeu: 'Unités illustratives + scores de services écosystémiques',
    couverture: 'Région de Trois-Rivières',
    diffusion: 'Données de démonstration — non destinées à la décision',
    lignee:
      'Valeurs générées pour illustrer le modèle de priorisation ; à remplacer par des statistiques ' +
      'zonales calculées sur les données réelles (Phase 2).',
    url: '',
  },
]

// ---- Accès direct à la connaissance ----
export const KNOWLEDGE = [
  ['Jeu de données — Milieux humides potentiels (Données Québec)', 'https://www.donneesquebec.ca/recherche/fr/dataset/milieux-humides-potentiels'],
  ['Service ArcGIS REST — MH potentiels (MapServer)', 'https://geo.environnement.gouv.qc.ca/donnees/rest/services/Biodiversite/MH_potentiels/MapServer'],
  ['MELCCFP — Milieux humides et hydriques', 'https://www.environnement.gouv.qc.ca/eau/milieux-humides/'],
  ['ROBVQ — Plans directeurs de l’eau (OBV)', 'https://robvq.qc.ca/obv-du-quebec/'],
  ['UNESCO — Réserve de la biosphère du lac Saint-Pierre', 'https://www.unesco.org/en/mab/lac-saint-pierre'],
  ['CBD — Cadre mondial de la biodiversité de Kunming-Montréal (COP15)', 'https://www.cbd.int/gbf/'],
  ['GeoLibre — Guide et intégration ArcGIS/WMS', 'https://geolibre.app/user-guide/adding-data/'],
]

// ---- Cadre COP15 (cibles priorisées par RIVE) ----
export const COP15 = [
  ['Cible 2', 'Restauration effective de 30 % des écosystèmes dégradés d’ici 2030'],
  ['Cible 3', 'Conservation de 30 % des terres et eaux (« 30x30 »)'],
  ['Cible 11', 'Maintien et renforcement des services écosystémiques'],
  ['Cible 12', 'Espaces verts et bleus en milieu urbain'],
]
