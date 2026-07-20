import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'

const CLUSTER_COLORS = [
  '#4e79a7', '#f28e2b', '#59a14f', '#e15759', '#b07aa1',
  '#76b7b2', '#edc948', '#ff9da7', '#9c755f', '#bab0ac',
]
const NOISE_COLOR = '#8a8f98'

const truncate = (s, n = 60) => (s.length > n ? s.slice(0, n) + '…' : s)

export default function Plot3D({ points, selectedId, showLines, onSelect }) {
  const ref = useRef(null)

  const traces = useMemo(() => {
    if (!points?.length) return []

    const selected = selectedId != null ? points.find((p) => p.id === selectedId) : null
    const neighborIds = new Set(selected ? selected.neighbors.map((n) => n.id) : [])

    const markerTrace = {
      type: 'scatter3d',
      mode: 'markers+text',
      x: points.map((p) => p.x),
      y: points.map((p) => p.y),
      z: points.map((p) => p.z),
      text: points.map((p) => truncate(p.text, 24)),
      textposition: 'top center',
      textfont: { size: 9, color: '#c8cdd6' },
      hovertext: points.map(
        (p) => `${truncate(p.text)}<br>cluster: ${p.cluster === -1 ? 'ruído' : p.cluster}`,
      ),
      hoverinfo: 'text',
      marker: {
        size: points.map((p) =>
          p.id === selectedId ? 10 : neighborIds.has(p.id) ? 8 : 5,
        ),
        color: points.map((p) =>
          p.cluster === -1 ? NOISE_COLOR : CLUSTER_COLORS[p.cluster % CLUSTER_COLORS.length],
        ),
        opacity: 0.92,
        line: {
          width: points.map((p) =>
            p.id === selectedId ? 3 : neighborIds.has(p.id) ? 2 : 0,
          ),
          color: '#ffffff',
        },
      },
      // ids nativos: o clique devolve o id certo mesmo se a ordem mudar
      ids: points.map((p) => String(p.id)),
    }

    const result = [markerTrace]

    if (selected && showLines) {
      for (const n of selected.neighbors) {
        const target = points.find((p) => p.id === n.id)
        if (!target) continue
        result.push({
          type: 'scatter3d',
          mode: 'lines',
          x: [selected.x, target.x],
          y: [selected.y, target.y],
          z: [selected.z, target.z],
          line: { color: 'rgba(255,255,255,0.55)', width: Math.max(1, n.score * 6) },
          hoverinfo: 'skip',
          showlegend: false,
        })
      }
    }
    return result
  }, [points, selectedId, showLines])

  // onSelect via ref: o listener e vinculado uma unica vez por div e precisa
  // sempre enxergar o callback atual.
  const onSelectRef = useRef(onSelect)
  useLayoutEffect(() => { onSelectRef.current = onSelect })

  useEffect(() => {
    const el = ref.current
    if (!el || !traces.length) return

    const axis = {
      showbackground: false,
      gridcolor: 'rgba(255,255,255,0.08)',
      zerolinecolor: 'rgba(255,255,255,0.15)',
      color: '#8a8f98',
    }
    const layout = {
      paper_bgcolor: 'transparent',
      scene: {
        xaxis: { ...axis, title: '' },
        yaxis: { ...axis, title: '' },
        zaxis: { ...axis, title: '' },
        bgcolor: 'transparent',
      },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      showlegend: false,
      // uirevision preserva rotação/zoom da câmera entre re-renders
      uirevision: 'keep',
    }

    // O `.on` do Plotly so esta garantido depois que a promise resolve
    // (o init do WebGL e assincrono); vinculamos o listener uma vez por div.
    Plotly.react(el, traces, layout, { displayModeBar: false, responsive: true }).then(() => {
      if (el._clickBound || typeof el.on !== 'function') return
      el._clickBound = true
      el.on('plotly_click', (event) => {
        const pt = event?.points?.[0]
        if (pt && pt.data.ids) onSelectRef.current(Number(pt.id))
      })
    })
  }, [traces])

  // purge apenas ao desmontar
  useEffect(() => () => { if (ref.current) Plotly.purge(ref.current) }, [])

  if (!points?.length) {
    return (
      <div className="plot-placeholder">
        <p>Adicione textos e clique em <strong>Visualizar</strong> para ver o mapa semântico 3D.</p>
      </div>
    )
  }

  return <div ref={ref} className="plot3d" />
}
