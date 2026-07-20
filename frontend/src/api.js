export async function fetchDefaults() {
  const res = await fetch('/api/defaults')
  if (!res.ok) throw new Error('Backend indisponível')
  return res.json()
}

export async function visualize(payload) {
  const res = await fetch('/api/visualize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    let detail = `Erro ${res.status}`
    try {
      const body = await res.json()
      if (body.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
    } catch { /* corpo não-JSON */ }
    throw new Error(detail)
  }
  return res.json()
}
