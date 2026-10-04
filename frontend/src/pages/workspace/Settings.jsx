import { useState } from 'react'
import { api } from '../../api/client'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Btn, Card, DataTable, Empty, KV, Pill, Spinner } from '../../components/common/ui'

export default function Settings() {
  const { settings, setSettings, meta, toast } = useWorkspace()
  const [draft, setDraft] = useState(settings)
  const [bench, setBench] = useState(null)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState('')
  const v = meta.version || {}
  const set = (k, val) => setDraft((d) => ({ ...d, [k]: val }))

  const run = async () => {
    setRunning(true); setError('')
    try { setBench((await api.benchmark()).data) } catch (e) { setError(e.message) }
    setRunning(false)
  }

  return (
    <div className="page">
      <h1 className="ptitle">Settings</h1>
      <div className="grid2">
        <Card title="Analysis defaults">
          <div className="row2">
            <div><label className="f first" htmlFor="sg">GSD (m/px)</label><input id="sg" type="number" value={draft.gsd} onChange={(e) => set('gsd', parseFloat(e.target.value) || 10)} /></div>
            <div><label className="f first" htmlFor="sk">Clusters (k)</label><input id="sk" type="number" min="4" max="10" value={draft.k} onChange={(e) => set('k', parseInt(e.target.value) || 7)} /></div>
          </div>
          <div className="row2">
            <div><label className="f" htmlFor="sa">Adaptive k</label>
              <select id="sa" value={draft.adaptive ? '1' : ''} onChange={(e) => set('adaptive', e.target.value === '1')}><option value="">Fixed</option><option value="1">Adaptive</option></select></div>
            <div><label className="f" htmlFor="ss">Sensor hint</label>
              <select id="ss" value={draft.sensor} onChange={(e) => set('sensor', e.target.value)}><option value="">Auto</option>
                {meta.sensors.map((s) => <option key={s.sensor} value={s.sensor}>{s.sensor}{s.verified ? ' ✓' : ''}</option>)}</select></div>
          </div>
          <div className="btnrow top"><Btn size="sm" arrow={false} variant="primary" onClick={() => { setSettings(draft); toast('Defaults saved') }}>Save defaults</Btn></div>

          <h4 className="sub top">Sensor support</h4>
          <DataTable head={['Sensor', 'Bands', 'Status']} rows={meta.sensors.map((s) => [s.sensor, (s.bands || []).join(', '), s.verified ? <Pill key="p" tone="c">verified</Pill> : <Pill key="p">planned</Pill>])} />
          <h4 className="sub top">Reasoning providers</h4>
          <DataTable head={['Provider', 'Available']} rows={meta.providers.map((p) => [p.name, p.available ? <Pill key="p" tone="c">yes</Pill> : <Pill key="p">no</Pill>])} />
          <div className="hint">The deterministic pipeline is always authoritative; providers only rephrase supplied evidence.</div>
        </Card>

        <div className="stack">
          <Card title="Benchmark (measured live)">
            <Btn size="sm" arrow={false} variant="primary" onClick={run} disabled={running}>{running ? <><Spinner /> Running…</> : 'Run benchmark'}</Btn>
            <div className="hint">Runs the full pipeline plus fixed queries on the bundled demo pair and reports real timings from this host. Nothing is shown until measured.</div>
            {error && <div className="err">{error}</div>}
            {bench ? <Bench b={bench} /> : <Empty>No benchmark run yet.</Empty>}
          </Card>
          <Card title="About">
            <KV rows={[
              ['Product', 'SatQuery AI'],
              ['Version', `${v.version || '—'} (pipeline ${v.pipeline_version || '—'}, build ${v.build || '—'})`],
              ['Algorithms', <code key="a">{JSON.stringify(v.algorithms || {})}</code>],
              ['Mode', 'Fully offline · no API keys · deterministic (seed 42)'],
            ]} />
          </Card>
        </div>
      </div>
    </div>
  )
}

function Bench({ b }) {
  return (
    <>
      <DataTable head={['Stage', 'ms']} align={['left', 'right']} rows={[...Object.entries(b.stages_ms || {}).map(([k, val]) => [k, val]), [<b key="t">total</b>, <b key="v">{b.total_ms}</b>]]} />
      <h4 className="sub top">Query latency</h4>
      <DataTable head={['Query', 'ms']} align={['left', 'right']} rows={Object.entries(b.query_latency_ms || {}).map(([k, val]) => [k, `${val} ms`])} />
      <div className="hint">Image {b.image.width}×{b.image.height} → {b.image.analysis_width}×{b.image.analysis_height} ({b.image.pixels} px) · peak RSS {b.memory.peak_rss_mb} MB · {b.sample}{b.sample2 ? ` + ${b.sample2}` : ''}</div>
    </>
  )
}
