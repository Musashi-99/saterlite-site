import { useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Card, DataTable, KV, NoSession, Pill, Spinner } from '../../components/common/ui'

function Histogram({ h }) {
  const ref = useRef(null)
  useEffect(() => {
    const cv = ref.current, dpr = window.devicePixelRatio || 1
    const W = cv.clientWidth, H = 190
    cv.width = W * dpr; cv.height = H * dpr
    const ctx = cv.getContext('2d')
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, W, H)
    const mx = Math.max(...h.counts, 1), bw = W / h.counts.length
    ctx.fillStyle = '#6fb4ff'
    h.counts.forEach((c, i) => { const bh = (c / mx) * (H - 34); ctx.fillRect(i * bw + 1, H - 22 - bh, Math.max(1, bw - 2), bh) })
    ctx.fillStyle = '#93a0bb'; ctx.font = '600 13px Urbanist, sans-serif'
    ctx.fillText(h.edges[0], 6, H - 5)
    const last = String(h.edges[h.edges.length - 1])
    ctx.fillText(last, W - ctx.measureText(last).width - 6, H - 5)
  }, [h])
  return <canvas ref={ref} className="hist" />
}

export default function Spectral() {
  const { session } = useWorkspace()
  const [indices, setIndices] = useState(null)
  const [error, setError] = useState('')
  const [i, setI] = useState(0)

  useEffect(() => {
    if (!session) return
    setIndices(null); setError('')
    api.indices(session).then((r) => setIndices(r.data.indices || [])).catch((e) => setError(e.message))
  }, [session])

  if (!session) return <div className="page"><h1 className="ptitle">Spectral analysis</h1><NoSession /></div>
  const v = indices?.[i]
  const s = v?.stats || {}
  return (
    <div className="page">
      <h1 className="ptitle">Spectral analysis</h1>
      <Card title="Spectral indices">
        {error && <div className="err">{error}</div>}
        {!indices && !error && <div><Spinner /> loading…</div>}
        {indices && (
          <>
            <label className="f first" htmlFor="idx">Index</label>
            <select id="idx" value={i} onChange={(e) => setI(+e.target.value)}>
              {indices.map((x, k) => <option key={k} value={k}>{x.name}{x.available ? '' : ' — unavailable'}</option>)}
            </select>
            {v && (
              <div className="top">
                <KV rows={[
                  ['Formula', <code key="f">{v.formula}</code>],
                  ['Required bands', v.required_bands.join(', ')],
                  ['Status', v.available ? <Pill tone="c">MEASURED</Pill> : <><Pill>UNAVAILABLE</Pill> {v.reason}</>],
                  ['Description', v.description],
                ]} />
                {v.available && (
                  <>
                    <DataTable head={['min', 'max', 'mean', 'median', 'std', 'p5–p95']} rows={[[s.min, s.max, s.mean, s.median, s.std, `${s.p5} – ${s.p95}`]]} />
                    {v.histogram?.counts?.length > 0 && <Histogram h={v.histogram} />}
                  </>
                )}
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
