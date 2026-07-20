import { useCallback, useEffect, useState } from 'react'
import { fetchDefaults, visualize } from './api.js'
import SettingsPanel from './components/SettingsPanel.jsx'
import TextInput from './components/TextInput.jsx'
import Controls from './components/Controls.jsx'
import Plot3D from './components/Plot3D.jsx'
import InfoPanel from './components/InfoPanel.jsx'

export default function App() {
  const [provider, setProvider] = useState({
    base_url: 'https://api.openai.com/v1',
    api_key: '',
    model: 'text-embedding-3-small',
  })
  const [hasServerKey, setHasServerKey] = useState(false)
  const [rawText, setRawText] = useState('')
  const [reduction, setReduction] = useState({
    method: 'umap', n_neighbors: 15, min_dist: 0.1, perplexity: 30,
  })
  const [clustering, setClustering] = useState({ method: 'hdbscan', n_clusters: 8 })
  const [neighborsK, setNeighborsK] = useState(5)
  const [showLines, setShowLines] = useState(true)
  const [pointScale, setPointScale] = useState(1)

  const [data, setData] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDefaults()
      .then((d) => {
        setHasServerKey(d.has_server_key)
        setProvider((p) => ({ ...p, base_url: d.base_url, model: d.model }))
      })
      .catch(() => { /* backend ainda não subiu — defaults locais servem */ })
  }, [])

  const run = useCallback(async () => {
    const texts = rawText.split('\n').map((l) => l.trim()).filter(Boolean)
    if (texts.length < 4) {
      setError('Informe pelo menos 4 textos (um por linha).')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await visualize({
        texts,
        provider,
        reduction,
        clustering,
        neighbors_k: neighborsK,
      })
      setData(result)
      setSelectedId(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [rawText, provider, reduction, clustering, neighborsK])

  const selectedPoint = data?.points.find((p) => p.id === selectedId) ?? null

  return (
    <div className="app">
      <aside className="sidebar">
        <header>
          <h1>RagVisualizer</h1>
          <p className="hint">Mapa semântico 3D de embeddings</p>
        </header>

        <SettingsPanel provider={provider} onChange={setProvider} hasServerKey={hasServerKey} />
        <TextInput value={rawText} onChange={setRawText} />
        <Controls
          reduction={reduction} onReductionChange={setReduction}
          clustering={clustering} onClusteringChange={setClustering}
          showLines={showLines} onShowLinesChange={setShowLines}
          neighborsK={neighborsK} onNeighborsKChange={setNeighborsK}
          pointScale={pointScale} onPointScaleChange={setPointScale}
        />

        <button type="button" className="primary" onClick={run} disabled={loading}>
          {loading ? 'Gerando embeddings…' : 'Visualizar'}
        </button>
        {error && <p className="error">{error}</p>}

        <InfoPanel point={selectedPoint} onSelect={setSelectedId} />
      </aside>

      <main className="plot-area">
        {data && (
          <div className="meta-bar">
            <span title="Quantidade de textos embedados nesta visualização">
              {data.meta.count} textos
            </span>
            <span title={`Modelo de embeddings usado e a dimensão original dos vetores (${data.meta.dim} dimensões, projetadas para 3)`}>
              {data.meta.model} · {data.meta.dim}d
            </span>
            <span title="Método de redução dimensional usado para projetar os vetores em 3D">
              {data.meta.reduction_method.toUpperCase()}
            </span>
            <span title="Trustworthiness: quanto a projeção 3D preservou as vizinhanças reais do espaço original (0–100%). Abaixo de ~85%, desconfie das distâncias visuais e confie nos scores de cosseno do painel de detalhes.">
              confiabilidade: {(data.meta.trustworthiness * 100).toFixed(1)}%
            </span>
          </div>
        )}
        <Plot3D
          points={data?.points}
          selectedId={selectedId}
          showLines={showLines}
          pointScale={pointScale}
          onSelect={setSelectedId}
        />
      </main>
    </div>
  )
}
