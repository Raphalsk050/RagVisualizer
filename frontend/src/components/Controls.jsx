export default function Controls({
  reduction, onReductionChange,
  clustering, onClusteringChange,
  showLines, onShowLinesChange,
  neighborsK, onNeighborsKChange,
}) {
  const setR = (field, parse = (v) => v) => (e) =>
    onReductionChange({ ...reduction, [field]: parse(e.target.value) })
  const setC = (field, parse = (v) => v) => (e) =>
    onClusteringChange({ ...clustering, [field]: parse(e.target.value) })

  return (
    <section className="panel">
      <h2>Projeção e análise</h2>

      <label>
        Redução dimensional
        <select value={reduction.method} onChange={setR('method')}>
          <option value="umap">UMAP (recomendado)</option>
          <option value="tsne">t-SNE</option>
          <option value="pca">PCA</option>
        </select>
      </label>

      {reduction.method === 'umap' && (
        <div className="param-row">
          <label>
            n_neighbors: {reduction.n_neighbors}
            <input type="range" min="2" max="50" value={reduction.n_neighbors}
              onChange={setR('n_neighbors', Number)} />
          </label>
          <label>
            min_dist: {reduction.min_dist}
            <input type="range" min="0" max="0.99" step="0.05" value={reduction.min_dist}
              onChange={setR('min_dist', Number)} />
          </label>
        </div>
      )}

      {reduction.method === 'tsne' && (
        <label>
          perplexity: {reduction.perplexity}
          <input type="range" min="2" max="100" value={reduction.perplexity}
            onChange={setR('perplexity', Number)} />
        </label>
      )}

      <label>
        Clustering
        <select value={clustering.method} onChange={setC('method')}>
          <option value="hdbscan">HDBSCAN (automático)</option>
          <option value="kmeans">KMeans</option>
          <option value="none">Nenhum</option>
        </select>
      </label>

      {clustering.method === 'kmeans' && (
        <label>
          nº de clusters: {clustering.n_clusters}
          <input type="range" min="2" max="20" value={clustering.n_clusters}
            onChange={setC('n_clusters', Number)} />
        </label>
      )}

      <label>
        vizinhos (k): {neighborsK}
        <input type="range" min="1" max="10" value={neighborsK}
          onChange={(e) => onNeighborsKChange(Number(e.target.value))} />
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={showLines}
          onChange={(e) => onShowLinesChange(e.target.checked)}
        />
        Mostrar linhas de vizinhança ao selecionar
      </label>
    </section>
  )
}
