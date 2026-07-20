export default function InfoPanel({ point, onSelect }) {
  if (!point) {
    return (
      <section className="panel info-panel">
        <h2>Detalhes</h2>
        <p className="hint">Clique em um ponto do gráfico para ver o texto e seus vizinhos semânticos.</p>
      </section>
    )
  }

  return (
    <section className="panel info-panel">
      <h2>Detalhes</h2>
      <p className="selected-text">"{point.text}"</p>
      <p className="hint">
        Cluster: {point.cluster === -1 ? 'ruído' : point.cluster}
      </p>
      <h3>Vizinhos mais próximos <span className="hint">(cosseno no espaço original)</span></h3>
      <ol className="neighbor-list">
        {point.neighbors.map((n) => (
          <li key={n.id}>
            <button type="button" className="link" onClick={() => onSelect(n.id)}>
              {n.text}
            </button>
            <span className="score">{(n.score * 100).toFixed(1)}%</span>
          </li>
        ))}
      </ol>
    </section>
  )
}
