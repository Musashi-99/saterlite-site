import { useRef, useState } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Btn, Card, Empty, KV, Spinner } from '../../components/common/ui'
import Viewer from '../../components/workspace/Viewer'
import Legend from '../../components/workspace/Legend'

function DropZone({ label, file, onFile }) {
  const input = useRef(null)
  const [preview, setPreview] = useState(null)
  const [over, setOver] = useState(false)
  const set = (f) => {
    if (!f) return
    onFile(f)
    const r = new FileReader()
    r.onload = (e) => setPreview(e.target.result)
    r.readAsDataURL(f)
  }
  return (
    <>
      <div className={`drop ${over ? 'over' : ''}`} role="button" tabIndex={0}
        onClick={() => input.current.click()} onKeyDown={(e) => e.key === 'Enter' && input.current.click()}
        onDragOver={(e) => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); set(e.dataTransfer.files[0]) }}>
        <b>{file ? file.name : label}</b>
        <span>PNG / JPG / TIFF · drop or click to browse</span>
      </div>
      <input ref={input} type="file" accept="image/*,.tif,.tiff" hidden onChange={(e) => set(e.target.files[0])} />
      {preview && <img className="thumb" src={preview} alt="Preview" />}
    </>
  )
}

export default function Analyze() {
  const { data, settings, setSettings, meta, runUpload, busy } = useWorkspace()
  const [file1, setFile1] = useState(null)
  const [file2, setFile2] = useState(null)
  const [error, setError] = useState('')
  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }))
  const sar = settings.mode === 'optical-sar'

  const submit = async () => {
    if (!file1) return
    setError('')
    try { await runUpload({ file: file1, file2 }) } catch (e) { setError(e.message) }
  }

  return (
    <div className="page">
      <h1 className="ptitle">Analyze a scene</h1>
      <div className="grid2">
        <Card title="Scene input">
          <DropZone label="Drop scene (T1 / optical)" file={file1} onFile={setFile1} />
          <label className="f" htmlFor="mode">Mode</label>
          <select id="mode" value={settings.mode} onChange={(e) => set('mode', e.target.value)}>
            <option value="auto">Auto (single, or bi-temporal if 2nd image given)</option>
            <option value="bitemporal">Bi-temporal (T1 vs T2, change detection)</option>
            <option value="optical-sar">Optical-SAR pair (cross-modal fusion)</option>
          </select>
          <label className="f">{sar ? 'SAR image (co-registered, same area)' : 'Optional — second date (T2)'}</label>
          <DropZone label={sar ? 'Drop SAR image' : 'Drop scene (T2)'} file={file2} onFile={setFile2} />
          <div className="row2">
            <div><label className="f" htmlFor="gsd">GSD (m/px)</label><input id="gsd" type="number" min="0.1" step="0.1" value={settings.gsd} onChange={(e) => set('gsd', parseFloat(e.target.value) || 10)} /></div>
            <div><label className="f" htmlFor="k">Clusters (k)</label><input id="k" type="number" min="4" max="10" value={settings.k} onChange={(e) => set('k', parseInt(e.target.value) || 7)} /></div>
          </div>
          <div className="row2">
            <div>
              <label className="f" htmlFor="ad">Adaptive k</label>
              <select id="ad" value={settings.adaptive ? '1' : ''} onChange={(e) => set('adaptive', e.target.value === '1')}>
                <option value="">Fixed k</option><option value="1">Adaptive (scene-driven)</option>
              </select>
            </div>
            <div>
              <label className="f" htmlFor="sn">Sensor hint</label>
              <select id="sn" value={settings.sensor} onChange={(e) => set('sensor', e.target.value)}>
                <option value="">Auto (generic)</option>
                {meta.sensors.map((s) => <option key={s.sensor} value={s.sensor}>{s.sensor}{s.verified ? ' ✓ verified' : ' (planned)'}</option>)}
              </select>
            </div>
          </div>
          <div className="hint">GSD sets the ground scale of every area &amp; length figure. Sentinel-2 ≈ 10 m, LISS-IV ≈ 5.8 m, Cartosat-2 ≈ 0.65 m.</div>
          <div className="btnrow top"><Btn variant="primary" arrow={false} onClick={submit} disabled={!file1 || busy} style={{ flex: 1 }}>{busy ? <><Spinner /> Analysing…</> : 'Analyze scene'}</Btn></div>
          {error && <div className="err">{error}</div>}
        </Card>
        <IngestionColumn />
      </div>
      {data && <Viewer />}
    </div>
  )
}

function IngestionColumn() {
  const { data: d } = useWorkspace()
  if (!d) return <Card title="Ingestion report"><Empty>Run an analysis to see the ingestion report, stage timings and composition.</Empty></Card>
  const g = d.ingestion || {}
  return (
    <div className="stack">
      <Card title="Ingestion report">
        <KV rows={[
          ['Source', g.filename || d.scene.name],
          ['Format', `${g.format || '—'} · ${g.bit_depth || '—'}`],
          ['Dimensions', `${g.width || d.scene.width}×${g.height || d.scene.height} px → analysis ${d.scene.analysis_width}×${d.scene.analysis_height}`],
          ['Bands', `${g.bands || 3} (${(g.band_names || []).join(', ') || 'red, green, blue'}) · NIR: ${d.scene.has_nir ? 'present' : 'absent'}`],
          ['CRS', g.crs || 'Metadata unavailable'],
          ['Geotransform', g.geotransform || 'Metadata unavailable'],
          ['Nodata', g.nodata || 'Metadata unavailable'],
          ['Resolution', g.resolution_note || ''],
          ['Coverage', g.coverage_note || ''],
          ['Sensor map', `${g.sensor_mapping || 'generic_rgb'}${g.sensor_verified ? ' ✓' : ''}`],
          ['Checksum', <code key="c">{(g.checksum_sha256 || '').slice(0, 16)}…</code>],
        ]} />
        {(d.warnings || []).map((w, i) => <div key={i} className="hint">⚠ {w}</div>)}
      </Card>
      <Card title={`Composition & stages (${d.ms} ms)`}>
        <Legend items={d.legend} />
        <div className="hint">Stages: {Object.entries(d.stages || {}).map(([k, v]) => `${k} ${v} ms`).join(' · ')} · k used: {d.k_used}{d.adaptive_k ? ' (adaptive)' : ''} · quality: <b>{d.quality?.label || '—'}</b></div>
      </Card>
    </div>
  )
}
