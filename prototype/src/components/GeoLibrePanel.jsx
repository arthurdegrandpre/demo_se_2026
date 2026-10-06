import { useMemo, useState } from 'react'

// Panneau GeoLibre embarqué — chargement de projets par le paramètre `?url=`.
//
// Historique : une version précédente poussait le projet par postMessage
// (`?embed=1` + `geolibre:load-project`). Ce pont est désormais DÉSACTIVÉ par
// défaut côté GeoLibre : il n'est ouvert qu'aux origines explicitement
// autorisées par le déploiement (`sharing.embedOrigins` de deployment.json).
// La version hébergée web.geolibre.app n'autorise évidemment pas localhost ni
// un github.io quelconque → le pont ne peut pas fonctionner. Doc :
// https://geolibre.app/user-guide/embedding/
//
// Le seul mécanisme d'embarquement toujours actif est `?url=<URL publique du
// projet>` : GeoLibre récupère lui-même le .geolibre.json depuis une URL
// publique. C'est le mode documenté pour les iframes, et il s'aligne sur la
// publication GitHub Pages (les projets y sont servis à des URL publiques).
//
// Conséquence : en local (localhost / file://), web.geolibre.app ne peut pas
// lire le projet (non public) — on affiche alors GeoLibre vide + un rappel de
// chargement manuel. Pour prévisualiser en local contre des fichiers publiés,
// définir VITE_GEOLIBRE_PUBLIC_BASE (ex. l'URL GitHub Pages du site).

const GEOLIBRE_ORIGIN = 'https://web.geolibre.app'

const MH_ARCGIS =
  'https://geo.environnement.gouv.qc.ca/donnees/rest/services/Biodiversite/MH_potentiels/MapServer'

const PROJECTS = [
  { key: 'main', label: 'Projet principal', file: 'rive-trois-rivieres.geolibre.json',
    hint: 'Milieux humides (MELCCFP) + unités d’analyse. Zoomer au niveau ≈ 10+.' },
  { key: 'sql', label: 'Démo SQL', file: 'rive-sql-demo.geolibre.json',
    hint: 'Extrait réel CMHPQ (768 polygones). Ouvrir Processing → SQL Workspace et coller docs/demos/requetes-sql.sql.' },
  { key: 'story', label: 'Carte-récit COP15', file: 'rive-storymap-cop15.geolibre.json',
    hint: 'Récit 30x30 : Project → Story Map pour présenter / exporter en HTML.' },
]

const PUBLIC_BASE = import.meta.env?.VITE_GEOLIBRE_PUBLIC_BASE || ''

function isLocalHost() {
  return /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(window.location.hostname) ||
    window.location.protocol === 'file:'
}

// URL publique du projet (celle que web.geolibre.app devra récupérer).
function publicProjectUrl(file) {
  const base = PUBLIC_BASE
    ? PUBLIC_BASE.replace(/\/?$/, '/')
    : (import.meta.env.BASE_URL || './')
  return new URL(`${base}${file}`, window.location.href).href
}

// Src de l'iframe : viewer GeoLibre chargeant le projet par `?url=`.
function viewerSrc(file) {
  return `${GEOLIBRE_ORIGIN}/?url=${encodeURIComponent(publicProjectUrl(file))}&layout=compact&welcome=0`
}

export default function GeoLibrePanel() {
  const [current, setCurrent] = useState(PROJECTS[0])
  const [copied, setCopied] = useState(false)

  // En local sans base publique, le viewer hébergé ne peut pas lire le projet.
  const cannotLoad = isLocalHost() && !PUBLIC_BASE

  // Src effective de l'iframe (remonte l'iframe à chaque changement via `key`).
  const src = useMemo(
    () => (cannotLoad ? `${GEOLIBRE_ORIGIN}/?layout=compact&welcome=0` : viewerSrc(current.file)),
    [current, cannotLoad],
  )

  function copyShare() {
    const url = viewerSrc(current.file)
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000) }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done).catch(done)
    else done()
  }

  return (
    <div className="geolibre-panel">
      <div className="geolibre-note">
        <div className="geolibre-projects" role="tablist" aria-label="Projet GeoLibre">
          {PROJECTS.map((p) => (
            <button
              key={p.key}
              className={p.key === current.key ? 'active' : ''}
              onClick={() => setCurrent(p)}
            >
              {p.label}
            </button>
          ))}
          <a className="geolibre-tablink" href={viewerSrc(current.file)} target="_blank" rel="noreferrer">
            Ouvrir dans un onglet ↗
          </a>
          <button className="geolibre-share" onClick={copyShare} title="Copier le lien de partage GeoLibre (?url=)">
            {copied ? 'Lien copié ✓' : 'Copier le lien'}
          </button>
        </div>
        <div className="geolibre-hint">
          {current.hint}{' '}
          {current.key === 'main' && (
            <>Chargement manuel si besoin : <em>Add Data → ArcGIS</em> avec <code>{MH_ARCGIS}</code>. </>
          )}
          {cannotLoad && (
            <em className="geolibre-warn">
              En local, web.geolibre.app ne peut pas lire le projet (non public) : GeoLibre s’ouvre vide.
              Le projet se chargera automatiquement une fois le site publié (GitHub Pages), ou définissez
              <code>VITE_GEOLIBRE_PUBLIC_BASE</code> pour prévisualiser contre des fichiers déjà publiés.
            </em>
          )}
        </div>
      </div>
      <iframe
        key={src}
        title="GeoLibre"
        src={src}
        className="geolibre-iframe"
        allow="fullscreen; clipboard-read; clipboard-write; geolocation"
      />
    </div>
  )
}
