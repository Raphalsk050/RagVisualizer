const TIPS = {
  reduction:
    'Como comprimir os vetores de N dimensões para 3D. A projeção é apenas visual: ' +
    'as similaridades exibidas são sempre calculadas no espaço original.',
  umap:
    'UMAP: melhor equilíbrio entre estrutura local (grupos) e global (distância entre grupos). Recomendado.',
  tsne: 't-SNE: enfatiza a separação de grupos locais, mas distorce distâncias entre grupos. Mais lento.',
  pca: 'PCA: projeção linear, rápida e determinística. Preserva a estrutura global, mas separa menos os grupos.',
  n_neighbors:
    'Quantos vizinhos o UMAP considera ao montar o mapa. Valores baixos (2–10) destacam detalhes ' +
    'locais e grupos pequenos; valores altos (30+) priorizam a estrutura global do conjunto.',
  min_dist:
    'Distância mínima entre pontos no 3D. Baixo (0–0.2) = clusters bem compactos; ' +
    'alto (0.5+) = pontos mais espalhados e uniformes.',
  perplexity:
    'Nº efetivo de vizinhos que o t-SNE considera por ponto. Baixo = foco em vizinhança imediata; ' +
    'alto = mais contexto global. Regra prática: entre 5 e 50, menor que o nº de textos.',
  clustering: 'Como agrupar os pontos para colorir o gráfico. O agrupamento usa os vetores originais.',
  hdbscan:
    'HDBSCAN: descobre sozinho quantos grupos existem e marca como ruído (cinza) o que não pertence a nenhum.',
  kmeans: 'KMeans: força a divisão em exatamente N grupos, todos os pontos recebem um grupo.',
  none: 'Sem clustering: todos os pontos com a mesma cor.',
  n_clusters: 'Número exato de grupos que o KMeans deve formar.',
  neighbors_k:
    'Quantos vizinhos semânticos listar para cada ponto, ranqueados por similaridade de cosseno ' +
    'calculada no espaço original de alta dimensão (não no 3D).',
  show_lines:
    'Ao clicar em um ponto, desenha linhas até seus vizinhos semânticos. ' +
    'Linhas mais grossas = maior similaridade.',
  point_scale:
    'Tamanho visual dos pontos no gráfico. Só muda a aparência dos marcadores — ' +
    'não altera posições, distâncias nem os cálculos de similaridade.',
}

export default function Controls({
  reduction, onReductionChange,
  clustering, onClusteringChange,
  showLines, onShowLinesChange,
  neighborsK, onNeighborsKChange,
  pointScale, onPointScaleChange,
}) {
  const setR = (field, parse = (v) => v) => (e) =>
    onReductionChange({ ...reduction, [field]: parse(e.target.value) })
  const setC = (field, parse = (v) => v) => (e) =>
    onClusteringChange({ ...clustering, [field]: parse(e.target.value) })

  return (
    <section className="panel">
      <h2>Projeção e análise</h2>

      <label title={TIPS.reduction}>
        Redução dimensional
        <select value={reduction.method} onChange={setR('method')}>
          <option value="umap" title={TIPS.umap}>UMAP (recomendado)</option>
          <option value="tsne" title={TIPS.tsne}>t-SNE</option>
          <option value="pca" title={TIPS.pca}>PCA</option>
        </select>
      </label>

      {reduction.method === 'umap' && (
        <div className="param-row">
          <label title={TIPS.n_neighbors}>
            n_neighbors: {reduction.n_neighbors}
            <input type="range" min="2" max="50" value={reduction.n_neighbors}
              onChange={setR('n_neighbors', Number)} />
          </label>
          <label title={TIPS.min_dist}>
            min_dist: {reduction.min_dist}
            <input type="range" min="0" max="0.99" step="0.05" value={reduction.min_dist}
              onChange={setR('min_dist', Number)} />
          </label>
        </div>
      )}

      {reduction.method === 'tsne' && (
        <label title={TIPS.perplexity}>
          perplexity: {reduction.perplexity}
          <input type="range" min="2" max="100" value={reduction.perplexity}
            onChange={setR('perplexity', Number)} />
        </label>
      )}

      <label title={TIPS.clustering}>
        Clustering
        <select value={clustering.method} onChange={setC('method')}>
          <option value="hdbscan" title={TIPS.hdbscan}>HDBSCAN (automático)</option>
          <option value="kmeans" title={TIPS.kmeans}>KMeans</option>
          <option value="none" title={TIPS.none}>Nenhum</option>
        </select>
      </label>

      {clustering.method === 'kmeans' && (
        <label title={TIPS.n_clusters}>
          nº de clusters: {clustering.n_clusters}
          <input type="range" min="2" max="20" value={clustering.n_clusters}
            onChange={setC('n_clusters', Number)} />
        </label>
      )}

      <label title={TIPS.neighbors_k}>
        vizinhos (k): {neighborsK}
        <input type="range" min="1" max="10" value={neighborsK}
          onChange={(e) => onNeighborsKChange(Number(e.target.value))} />
      </label>

      <label title={TIPS.point_scale}>
        tamanho dos pontos: {pointScale.toFixed(1)}×
        <input type="range" min="0.4" max="3" step="0.2" value={pointScale}
          onChange={(e) => onPointScaleChange(Number(e.target.value))} />
      </label>

      <label className="checkbox" title={TIPS.show_lines}>
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
