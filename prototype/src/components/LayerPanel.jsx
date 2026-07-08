import { PRIORITY_COLORS, MH_CLASSES } from '../data/layers.js'

export default function LayerPanel({ layers, onToggle }) {
  return (
    <div className="layer-panel">
      <h2>Couches</h2>
      <ul className="layer-list">
        {layers.map((l) => (
          <li key={l.id}>
            <label>
              <input type="checkbox" checked={l.visible} onChange={() => onToggle(l.id)} />
              <span
                className="swatch"
                style={{
                  background:
                    l.legend === 'priority'
                      ? 'linear-gradient(90deg,#7a0177,#fbb4b9)'
                      : l.id === 'mh_melccfp'
                      ? 'linear-gradient(90deg,#6677cd,#a3ff73,#cdaa66)'
                      : l.color,
                }}
              />
              {l.label}
              {l.real && <span className="tag-real">réel</span>}
            </label>
          </li>
        ))}
      </ul>

      <h3>Milieux humides — classes (MELCCFP)</h3>
      <ul className="legend legend-cols">
        {MH_CLASSES.map(([label, color]) => (
          <li key={label}>
            <span className="swatch" style={{ background: color }} /> {label}
          </li>
        ))}
      </ul>
      <p className="hint">
        Donnée réelle diffusée en direct par le service ArcGIS du MELCCFP (CMHPQ 2023).
        <strong> Zoomez (niveau ≥ 10)</strong> pour afficher les milieux humides, puis cliquez-en un
        pour ses attributs réels (classe, type, superficie, confiance, source).
      </p>

      <h3>Légende — priorité 30x30</h3>
      <ul className="legend">
        {Object.entries(PRIORITY_COLORS).map(([k, c]) => (
          <li key={k}>
            <span className="swatch" style={{ background: c }} /> {k}
          </li>
        ))}
      </ul>
      <p className="hint">
        La priorité combine la valeur des services écosystémiques et la pression, selon la cible
        « 30x30 » du Cadre de Kunming-Montréal. Cliquez une zone pour son détail.
      </p>
    </div>
  )
}
