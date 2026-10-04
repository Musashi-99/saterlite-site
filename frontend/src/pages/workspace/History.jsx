import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Btn, Card, Empty, KV, Modal, Spinner } from '../../components/common/ui'
import { downloadBlob } from '../../lib/format.jsx'

export default function History() {
  const { reproduce, toast } = useWorkspace()
  const nav = useNavigate()
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const load = useCallback(() => {
    api.history().then((r) => setRows(r.data.records || [])).catch((e) => setError(e.message))
  }, [])
  useEffect(load, [load])

  const act = async (a, id) => {
    try {
      if (a === 'dup') { await api.historyDuplicate(id); toast('Duplicated'); load() }
      if (a === 'del') { await api.historyDelete(id); setConfirm(null); toast('Deleted'); load() }
      if (a === 'exp') { const r = (await api.historyRecord(id)).data.record; downloadBlob(JSON.stringify(r, null, 1), `${id}.json`, 'application/json') }
      if (a === 'open') setOpen((await api.historyRecord(id)).data.record)
      if (a === 'rep') { await reproduce(id); nav('/app/analyze') }
    } catch (e) { toast(`${a} failed: ${e.message}`) }
  }

  return (
    <div className="page">
      <h1 className="ptitle">Analysis history</h1>
      <Card title="Saved analyses">
        {error && <div className="err">{error}</div>}
        {!rows && !error && <div><Spinner /> loading…</div>}
        {rows && !rows.length && <Empty>No saved analyses yet. Every analysis is recorded here automatically.</Empty>}
        {rows?.length > 0 && (
          <div className="tscroll">
            <table className="t">
              <thead><tr><th>Label</th><th>Time</th><th className="r">Duration</th><th className="r">Q/E</th><th>Pipeline</th><th>Actions</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.analysis_id}>
                    <td><b>{r.label || r.analysis_id}</b><br /><code>{r.analysis_id}</code></td>
                    <td>{new Date(r.timestamp * 1000).toLocaleString()}</td>
                    <td className="r">{r.duration_ms} ms</td>
                    <td className="r">{r.n_queries}/{r.n_evidence}</td>
                    <td><code>{r.versions?.pipeline || '—'}</code></td>
                    <td className="acts">
                      {[['open', 'Open'], ['dup', 'Duplicate'], ['exp', 'Export'], ['rep', 'Reproduce']].map(([a, l]) => (
                        <button key={a} className="vbtn" onClick={() => act(a, r.analysis_id)}>{l}</button>
                      ))}
                      <button className="vbtn danger" onClick={() => setConfirm(r.analysis_id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="hint">Records store parameters, checksums, results and evidence — not pixels. “Reproduce” re-runs the deterministic pipeline from stored inputs.</div>
      </Card>

      {open && (
        <Modal onClose={() => setOpen(null)}>
          <Card title={`Record ${open.analysis_id || ''}`}>
            <KV rows={[
              ['Label', open.label || ''],
              ['Time', new Date(open.timestamp * 1000).toLocaleString()],
              ['Params', <code key="p">{JSON.stringify(open.params || {})}</code>],
              ['Results', <code key="r">{JSON.stringify(open.results || {}).slice(0, 400)}</code>],
              ['Evidence', `${(open.evidence || []).length} items · Queries: ${(open.queries || []).length}`],
            ]} />
            <div className="btnrow top"><Btn size="sm" arrow={false} onClick={() => setOpen(null)}>Close</Btn></div>
            <div className="hint">Full record available via Export. Pixel sessions expire; use Reproduce to rebuild.</div>
          </Card>
        </Modal>
      )}
      {confirm && (
        <Modal onClose={() => setConfirm(null)}>
          <Card title="Delete record?">
            <p>Record <code>{confirm}</code> will be permanently deleted.</p>
            <div className="btnrow top">
              <Btn size="sm" arrow={false} variant="primary" onClick={() => act('del', confirm)}>Delete</Btn>
              <Btn size="sm" arrow={false} onClick={() => setConfirm(null)}>Cancel</Btn>
            </div>
          </Card>
        </Modal>
      )}
    </div>
  )
}
