import { useEffect, useRef, useState } from 'react'

// Panneau GeoLibre embarqué — chargement de projets via le « embed bridge ».
//
// Pourquoi pas `?url=` ? La version hébergée (web.geolibre.app) devrait alors
// récupérer le projet depuis localhost : les navigateurs récents bloquent ce
// type de requête « site public → réseau local » (CORS / Local Network Access).
//
// À la place, GeoLibre expose un pont postMessage (apps/geolibre-desktop/src/
// hooks/useEmbedBridge.ts, activé par `?embed=1`) : l'iframe annonce
// `geolibre:ready`, puis le parent pousse un projet complet avec un message
// `geolibre:load-project`. Aucune requête cross-origin : c'est NOTRE page qui
// lit les .geolibre.json (même origine), puis les transmet. On peut donc aussi
// BASCULER de projet à volonté (projet principal, démo SQL, carte-récit).

const GEOLIBRE_ORIGIN = 'https://web.geolibre.app'
const IFRAME_SRC = `${GEOLIBRE_ORIGIN}/?embed=1&layout=compact`

const MH_ARCGIS =
  'https://geo.environnement.gouv.qc.ca/donnees/rest/services/Biodiversite/MH_potentiels/MapServer'

// Projets poussables. `file` est servi en même origine depuis public/.
const PROJECTS = [
  { key: 'main', label: 'Projet principal', file: 'rive-trois-rivieres.geolibre.json',
    hint: 'Milieux humides (MELCCFP) + unités d’analyse. Zoomer au niveau ≈ 10+.' },
  { key: 'sql', label: 'Démo SQL', file: 'rive-sql-demo.geolibre.json',
    hint: 'Extrait réel CMHPQ (768 polygones). Ouvrir Processing → SQL Workspace et coller docs/demos/requetes-sql.sql.' },
  { key: 'story', label: 'Carte-récit COP15', file: 'rive-storymap-cop15.geolibre.json',
    hint: 'Récit 30x30 : Project → Story Map pour présenter / exporter en HTML.' },
]

function projectFileUrl(file) {
  const override = import.meta.env?.VITE_GEOLIBRE_PROJECT_URL
  if (override && file === PROJECTS[0].file) return override
  return new URL(`${import.meta.env.BASE_URL || './'}${file}`, window.location.href).href
}

// Lien de partage GeoLibre : `?url=` charge le projet depuis son URL publique.
// C'est LE mode de partage une fois le site publié sur GitHub Pages (les
// .geolibre.json sont alors servis en https par github.io, que web.geolibre.app
// peut récupérer). En local (localhost), ce lien ne fonctionne pas encore : le
// projet n'est pas accessible publiquement — d'où l'avertissement affiché.
function shareUrl(file) {
  return `${GEOLIBRE_ORIGIN}/?url=${encodeURIComponent(projectFileUrl(file))}&layout=compact`
}

function isLocalHost() {
  return /^(localhost|127\.|0\.0\.0\.0|\[::1\])/.test(window.location.hostname) ||
    window.location.protocol === 'file:'
}

export default function GeoLibrePanel() {
  const iframeRef = useRef(null)
  const readyRef = useRef(false)
  const seqRef = useRef(0)
  const [current, setCurrent] = useState(PROJECTS[0])
  const [copied, setCopied] = useState(false)
  const currentRef = useRef(current)
  currentRef.current = current
  const local = isLocalHost()

  function copyShare() {
    const url = shareUrl(current.file)
    const done = () => { setCopied(true); setTimeout(() => setCopied(false), 2000) }
    if (navigator.clipboard?.writeText) navigator.clipboard.writeText(url).then(done).catch(done)
    else done()
  }

  // Pousse un projet dans l'iframe (fetch même origine → postMessage).
  function pushProject(proj) {
    const frame = iframeRef.current
    if (!frame || !frame.contentWindow || !readyRef.current) return
    fetch(projectFileUrl(proj.file))
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status} sur ${proj.file}`)
        return r.json()
      })
      .then((project) => {
        seqRef.current += 1
        frame.contentWindow.postMessage(
          { type: 'geolibre:load-project', project, seq: seqRef.current },
          GEOLIBRE_ORIGIN,
        )
      })
      .catch((err) => console.warn('RIVE — projet GeoLibre :', err))
  }

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== GEOLIBRE_ORIGIN) return
      const frame = iframeRef.current
      if (!frame || e.source !== frame.contentWindow) return
      const type = e.data && e.data.type
      if (type === 'geolibre:ready') {
        // (ré)émis à chaque (re)chargement de l'iframe → repousser le projet courant.
        readyRef.current = true
        pushProject(currentRef.current)
      } else if (type === 'geolibre:error') {
        console.warn('GeoLibre —', e.data.message)
      }
      // les instantanés `geolibre:state` renvoyés par le pont sont ignorés
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function select(proj) {
    setCurrent(proj)
    pushProject(proj) // si l'iframe est déjà prête, bascule immédiate
  }

  return (
    <div className="geolibre-panel">
      <div className="geolibre-note">
        <div className="geolibre-projects" role="tablist" aria-label="Projet GeoLibre">
          {PROJECTS.map((p) => (
            <button
              key={p.key}
              className={p.key === current.key ? 'active' : ''}
              onClick={() => select(p)}
            >
              {p.label}
            </button>
          ))}
          <a className="geolibre-tablink" href={shareUrl(current.file)} target="_blank" rel="noreferrer">
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
          {local && (
            <em className="geolibre-warn">
              Le lien de partage s’activera une fois le site publié (GitHub Pages) — en local, le projet
              n’est pas accessible publiquement.
            </em>
          )}
        </div>
      </div>
      <iframe
        ref={iframeRef}
        title="GeoLibre"
        src={IFRAME_SRC}
        className="geolibre-iframe"
        allow="clipboard-read; clipboard-write; geolocation"
      />
    </div>
  )
}
