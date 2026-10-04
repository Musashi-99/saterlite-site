// Thin wrapper over the SatQuery FastAPI backend. Every page goes through here.

async function request(path, opts) {
  const r = await fetch(path, opts)
  const ct = r.headers.get('content-type') || ''
  if (!r.ok) {
    let msg = 'Request failed (' + r.status + ')'
    try {
      const j = await r.json()
      msg = j.detail || (j.errors && j.errors[0] && j.errors[0].message) || msg
    } catch { /* non-JSON error body */ }
    throw new Error(typeof msg === 'string' ? msg : JSON.stringify(msg))
  }
  return ct.includes('application/json') ? r.json() : r.text()
}

const json = (body) => ({
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})

export const api = {
  version: () => request('/api/version'),
  health: () => request('/api/health'),
  samples: () => request('/api/samples'),
  providers: () => request('/api/providers'),
  sensors: () => request('/api/sensors'),
  history: () => request('/api/history'),
  historyRecord: (id) => request(`/api/history/${id}`),
  historyDelete: (id) => request(`/api/history/${id}`, { method: 'DELETE' }),
  historyDuplicate: (id) => request(`/api/history/${id}/duplicate`, { method: 'POST' }),
  historyReproduce: (id) => request(`/api/history/${id}/reproduce`, { method: 'POST' }),
  indices: (session) => request(`/api/indices?session=${session}`),
  objects: (session) => request(`/api/objects?session=${session}`),
  evidence: (session) => request(`/api/evidence?session=${session}`),
  inspect: (session, x, y) => request(`/api/inspect?session=${session}&x=${x}&y=${y}`),
  report: (session) => request(`/api/report?session=${session}`),
  benchmark: () => request('/api/benchmark', json({})),
  query: (session, query) => request('/api/query', json({ session, query })),
  explain: (session, query) => request('/api/explain', json({ session, query })),
  analyze: (form) => request('/api/analyze', { method: 'POST', body: form }),
  analyzeSample: (form) => request('/api/analyze_sample', { method: 'POST', body: form }),
}

export function analysisForm({ file, file2, sample, sample2, settings, mode }) {
  const fd = new FormData()
  if (sample) {
    fd.append('name', sample)
    if (sample2) fd.append('name2', sample2)
  } else {
    fd.append('image', file)
    if (file2) fd.append('image2', file2)
    fd.append('mode', mode || 'auto')
  }
  fd.append('gsd', settings.gsd)
  fd.append('k', settings.k)
  fd.append('adaptive_k', settings.adaptive ? 'true' : 'false')
  if (settings.sensor) fd.append('sensor', settings.sensor)
  return fd
}
