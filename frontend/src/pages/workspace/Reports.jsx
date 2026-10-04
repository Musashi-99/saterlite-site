import { useMemo, useState } from 'react'
import { api } from '../../api/client'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Btn, Card, Empty, NoSession, Spinner } from '../../components/common/ui'
import { downloadBlob } from '../../lib/format.jsx'

export default function Reports() {
  const { data, session, evidence, toast } = useWorkspace()
  const [tab, setTab] = useState('html')
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [frame, setFrame] = useState(null)

  // JSON report = full analysis payload minus the (huge) base64 images, plus evidence + query log.
  const json = useMemo(() => {
    if (!data) return ''
    const { images, ...rest } = data
    return JSON.stringify({ ...rest, image_layers: Object.keys(images || {}), evidence: evidence.evidence, queries: evidence.queries }, null, 2)
  }, [data, evidence])

  if (!data) return <div className="page"><h1 className="ptitle">Reports</h1><NoSession /></div>

  const generate = async () => {
    setLoading(true); setError('')
    try { setHtml(await api.report(session)) } catch (e) { setError(e.message) }
    setLoading(false)
  }
  const copy = async () => { try { await navigator.clipboard.writeText(json); toast('JSON copied') } catch { toast('Copy blocked by browser') } }

  return (
    <div className="page">
      <h1 className="ptitle">Reports &amp; JSON</h1>
      <div className="tabs">
        <button className={`tab ${tab === 'html' ? 'on' : ''}`} onClick={() => setTab('html')}>HTML report</button>
        <button className={`tab ${tab === 'json' ? 'on' : ''}`} onClick={() => setTab('json')}>JSON report</button>
      </div>

      {tab === 'html' ? (
        <Card title="Report generator">
          <div className="btnrow">
            <Btn size="sm" arrow={false} variant="primary" onClick={generate} disabled={loading}>{loading ? <><Spinner /> Generating…</> : 'Generate report'}</Btn>
            <Btn size="sm" arrow={false} onClick={() => downloadBlob(html, `satquery-${session}.html`, 'text/html')} disabled={!html}>Download HTML</Btn>
            <Btn size="sm" arrow={false} onClick={() => frame?.contentWindow.print()} disabled={!html}>Print / PDF</Btn>
          </div>
          <div className="hint">The report distinguishes MEASURED / INFERRED / UNAVAILABLE / LIMITATION and includes methodology, evidence and reproducibility data.</div>
          {error && <div className="err">{error}</div>}
          {html ? <iframe ref={setFrame} title="Generated report" className="repframe" srcDoc={html} /> : <Empty>No report generated yet.</Empty>}
        </Card>
      ) : (
        <Card title="JSON report" aside={
          <div className="btnrow">
            <Btn size="sm" arrow={false} onClick={copy}>Copy</Btn>
            <Btn size="sm" arrow={false} variant="primary" onClick={() => downloadBlob(json, `satquery-${session}.json`, 'application/json')}>Download .json</Btn>
          </div>}>
          <div className="hint nomt">Machine-readable result for session <code>{session}</code>: scene, legend, clusters, change, counts, quality, stages, evidence and query log. Image layers are listed by name, not embedded.</div>
          <pre className="jsonview" tabIndex={0}>{json}</pre>
        </Card>
      )}
    </div>
  )
}
