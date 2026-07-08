import { PRIORITY_COLORS, SERVICES } from '../data/layers.js'

// Champs du service MELCCFP (ordre d'affichage, alias lisibles).
const MH_FIELDS = [
  ['TYPE', 'Type'],
  ['PHYSIONOMIE', 'Physionomie'],
  ['SYS_TROPHIQUE', 'Régime trophique'],
  ['SUPERFICIE', 'Superficie (ha)'],
  ['CONFIANCE', 'Confiance'],
  ['PARTICULARITE', 'Particularité'],
  ['SOURCE', 'Source(s)'],
]

export default function FeatureCard({ feature, onClose }) {
  const f = feature

  // Résultat d'identification MELCCFP (donnée réelle).
  if (f.__mh) {
    return (
      <div className="feature-card">
        <button className="close" onClick={onClose} aria-label="Fermer">×</button>
        <h3>{f.CLASSE || 'Milieu humide'}</h3>
        <div className="badge" style={{ background: '#1d91c0' }}>Milieu humide · MELCCFP</div>
        <dl>
          {MH_FIELDS.filter(([k]) => f[k] !== undefined && f[k] !== '' && f[k] !== 'Null').map(([k, alias]) => (
            <div key={k}><dt>{alias}</dt><dd>{String(f[k])}</dd></div>
          ))}
        </dl>
        <p className="meta">Source : CMHPQ 2023 — © Gouvernement du Québec (MELCCFP)</p>
      </div>
    )
  }

  const isZone = f.classe_priorite !== undefined
  if (!isZone) {
    return (
      <div className="feature-card">
        <button className="close" onClick={onClose} aria-label="Fermer">×</button>
        <h3>{f.type || f.cours || 'Élément'}</h3>
        <dl>
          {Object.entries(f).map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{String(v)}</dd></div>
          ))}
        </dl>
      </div>
    )
  }
  return (
    <div className="feature-card">
      <button className="close" onClick={onClose} aria-label="Fermer">×</button>
      <h3>{f.nom}</h3>
      <div className="badge" style={{ background: PRIORITY_COLORS[f.classe_priorite] }}>
        Priorité {f.classe_priorite} · {f.priorite}
      </div>
      <p className="meta">Profil : {f.profil} · {Number(f.superficie_ha).toLocaleString('fr-CA')} ha · Score SE {f.score_se}/100</p>

      <div className="services">
        {SERVICES.map((s) => (
          <div key={s.key} className="svc">
            <span className="svc-lbl">{s.label}</span>
            <span className="svc-bar"><span className="svc-fill" style={{ width: `${f[s.key]}%`, background: s.color }} /></span>
            <span className="svc-val">{f[s.key]}</span>
          </div>
        ))}
        <div className="svc pressure">
          <span className="svc-lbl">Pression</span>
          <span className="svc-bar"><span className="svc-fill" style={{ width: `${f.pression}%`, background: '#b30000' }} /></span>
          <span className="svc-val">{f.pression}</span>
        </div>
      </div>
    </div>
  )
}
