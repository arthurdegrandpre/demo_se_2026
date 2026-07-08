import { useState } from 'react'
import MapView from './components/MapView.jsx'
import LayerPanel from './components/LayerPanel.jsx'
import IndicatorPanel from './components/IndicatorPanel.jsx'
import InfoPanel from './components/InfoPanel.jsx'
import FeatureCard from './components/FeatureCard.jsx'
import GeoLibrePanel from './components/GeoLibrePanel.jsx'
import { LAYERS } from './data/layers.js'

export default function App() {
  const [layers, setLayers] = useState(LAYERS)
  const [selected, setSelected] = useState(null)
  const [tab, setTab] = useState('couches') // couches | indicateurs
  const [view, setView] = useState('rive') // rive | geolibre
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleLayer = (id) =>
    setLayers((ls) => ls.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)))

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="logo">Demo_SE_RIVE_2026</span>
          <span className="tagline">Services écosystémiques · Région de Trois-Rivières</span>
        </div>
        <div className="top-actions">
          <div className="view-switch" role="tablist" aria-label="Vue">
            <button className={view === 'rive' ? 'active' : ''} onClick={() => setView('rive')}>
              Carte
            </button>
            <button className={view === 'geolibre' ? 'active' : ''} onClick={() => setView('geolibre')}>
              GeoLibre
            </button>
          </div>
          <button className="btn burger" onClick={() => setMobileOpen((v) => !v)} aria-label="Menu">
            ☰
          </button>
        </div>
      </header>

      <div className="body">
        <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
          <nav className="tabs">
            <button className={tab === 'couches' ? 'active' : ''} onClick={() => setTab('couches')}>
              Couches
            </button>
            <button className={tab === 'indicateurs' ? 'active' : ''} onClick={() => setTab('indicateurs')}>
              Indicateurs
            </button>
            <button className={tab === 'info' ? 'active' : ''} onClick={() => setTab('info')}>
              Méthodo
            </button>
          </nav>
          <div className="panel-scroll">
            {tab === 'couches' && <LayerPanel layers={layers} onToggle={toggleLayer} />}
            {tab === 'indicateurs' && <IndicatorPanel onSelect={setSelected} />}
            {tab === 'info' && <InfoPanel />}
          </div>
        </aside>

        <main className="map-wrap">
          {/* Les deux vues restent montées ; on masque plutôt que démonter
              pour éviter de recréer la carte MapLibre à chaque bascule. */}
          <div className="view-layer" style={{ display: view === 'rive' ? 'block' : 'none' }}>
            <MapView layers={layers} onSelect={setSelected} />
            {selected && <FeatureCard feature={selected} onClose={() => setSelected(null)} />}
          </div>
          <div className="view-layer" style={{ display: view === 'geolibre' ? 'block' : 'none' }}>
            <GeoLibrePanel />
          </div>
        </main>
      </div>
    </div>
  )
}
