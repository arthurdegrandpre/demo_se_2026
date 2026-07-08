import { METADATA, KNOWLEDGE, COP15, SERVICES } from '../data/layers.js'

export default function InfoPanel() {
  return (
    <div className="info-panel">
      <h2>Méthodologie & métadonnées</h2>

      <h3>Sources de données</h3>
      {METADATA.map((m) => (
        <div className="meta-card" key={m.couche}>
          <div className="meta-head">
            {m.couche}
            {m.reel ? <span className="tag-real">réel</span> : <span className="tag-demo">démo</span>}
          </div>
          <dl className="meta-dl">
            {m.producteur && <div><dt>Producteur</dt><dd>{m.producteur}</dd></div>}
            {m.jeu && <div><dt>Jeu</dt><dd>{m.jeu}</dd></div>}
            {m.couverture && <div><dt>Couverture</dt><dd>{m.couverture}</dd></div>}
            {m.echelle && <div><dt>Échelle</dt><dd>{m.echelle}</dd></div>}
            {m.typologie && <div><dt>Typologie</dt><dd>{m.typologie}</dd></div>}
            {m.attributs && <div><dt>Attributs</dt><dd>{m.attributs}</dd></div>}
            {m.diffusion && <div><dt>Diffusion</dt><dd>{m.diffusion}</dd></div>}
            {m.lignee && <div><dt>Lignée</dt><dd>{m.lignee}</dd></div>}
          </dl>
          {m.url && (
            <a className="meta-link" href={m.url} target="_blank" rel="noreferrer">Fiche source ↗</a>
          )}
        </div>
      ))}

      <h3>Modèle d’indicateurs & priorisation 30x30</h3>
      <p className="hint">
        Chaque unité d’analyse reçoit un score de services écosystémiques (0–100), moyenne pondérée
        des indicateurs&nbsp;:
      </p>
      <ul className="weights">
        {SERVICES.map((s) => (
          <li key={s.key}>
            <span className="swatch" style={{ background: s.color }} /> {s.label}
            <span className="w">× {s.weight}</span>
          </li>
        ))}
      </ul>
      <p className="hint">
        La <strong>priorité</strong> combine ce score et la pression&nbsp;:
        <code> priorité = 0,6 × score + 0,4 × pression</code>. Les seuils définissent quatre classes
        (Très élevée → Faible) pour repérer le tiers supérieur à conserver et les secteurs dégradés à
        restaurer. Les valeurs actuelles sont <em>illustratives</em> ; en production elles proviendront
        de statistiques zonales calculées sur les couches réelles.
      </p>

      <h3>Cadre COP15 (Kunming-Montréal)</h3>
      <ul className="cop15">
        {COP15.map(([k, v]) => (
          <li key={k}><strong>{k}</strong> — {v}</li>
        ))}
      </ul>

      <h3>Accès direct à la connaissance</h3>
      <ul className="knowledge">
        {KNOWLEDGE.map(([label, url]) => (
          <li key={url}><a href={url} target="_blank" rel="noreferrer">{label} ↗</a></li>
        ))}
      </ul>
    </div>
  )
}
