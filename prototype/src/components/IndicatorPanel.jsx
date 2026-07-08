import { useEffect, useMemo, useState } from 'react'
import { PRIORITY_COLORS, SERVICES } from '../data/layers.js'

export default function IndicatorPanel({ onSelect }) {
  const [zones, setZones] = useState([])
  const [sort, setSort] = useState('priorite')

  useEffect(() => {
    fetch('data/zones_analyse.geojson')
      .then((r) => r.json())
      .then((j) => setZones(j.features.map((f) => f.properties)))
      .catch(() => setZones([]))
  }, [])

  const rows = useMemo(
    () => [...zones].sort((a, b) => b[sort] - a[sort]),
    [zones, sort],
  )

  const summary = useMemo(() => {
    if (!zones.length) return null
    const n = zones.length
    const prio = zones.filter((z) => z.classe_priorite === 'Très élevée' || z.classe_priorite === 'Élevée').length
    const avg = (k) => Math.round(zones.reduce((s, z) => s + z[k], 0) / n)
    const ha = zones.reduce((s, z) => s + (z.superficie_ha || 0), 0)
    return { n, prio, avg, ha }
  }, [zones])

  return (
    <div className="indicator-panel">
      <h2>Indicateurs & priorisation</h2>

      {summary && (
        <div className="cards">
          <div className="stat">
            <div className="num">{summary.prio}/{summary.n}</div>
            <div className="lbl">zones à priorité élevée</div>
          </div>
          <div className="stat">
            <div className="num">{summary.avg('score_se')}</div>
            <div className="lbl">score SE moyen (0–100)</div>
          </div>
          <div className="stat">
            <div className="num">{summary.ha.toLocaleString('fr-CA')}</div>
            <div className="lbl">hectares analysés</div>
          </div>
        </div>
      )}

      <div className="sort-row">
        <label>Trier par&nbsp;</label>
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="priorite">Priorité 30x30</option>
          <option value="score_se">Score de services</option>
          <option value="pression">Pression</option>
          {SERVICES.map((s) => (
            <option key={s.key} value={s.key}>{s.label}</option>
          ))}
        </select>
      </div>

      <ul className="zone-list">
        {rows.map((z) => (
          <li key={z.id} onClick={() => onSelect(z)} title="Voir le détail">
            <span className="dot" style={{ background: PRIORITY_COLORS[z.classe_priorite] }} />
            <span className="zn">{z.nom}</span>
            <span className="bar">
              <span className="fill" style={{ width: `${z[sort]}%`, background: PRIORITY_COLORS[z.classe_priorite] }} />
            </span>
            <span className="val">{z[sort]}</span>
          </li>
        ))}
      </ul>
      <p className="hint">Données de démonstration. Le modèle de score est décrit dans docs/02-architecture.md.</p>
    </div>
  )
}
