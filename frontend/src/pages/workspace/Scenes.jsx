import { useNavigate } from 'react-router-dom'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Btn, Card, Empty } from '../../components/common/ui'

export default function Scenes() {
  const { meta, runSample, busy } = useWorkspace()
  const nav = useNavigate()
  const open = async (...names) => { try { await runSample(...names); nav('/app/analyze') } catch { /* toasted */ } }

  return (
    <div className="page">
      <h1 className="ptitle">Scene library</h1>
      <Card title={`${meta.samples.length} bundled scenes`}>
        <div className="btnrow bottom">
          <Btn to="/app/analyze" size="sm" arrow={false}>⬆ Upload imagery</Btn>
          <Btn size="sm" arrow={false} variant="primary" onClick={() => open('delta_t1.png', 'delta_t2.png')} disabled={busy}>Load bi-temporal demo pair →</Btn>
        </div>
        {meta.samples.length ? (
          <div className="sampgrid">
            {meta.samples.map((s) => (
              <button key={s.name} className="samp" onClick={() => open(s.name)} disabled={busy}>
                <img src={s.url} alt={s.title} loading="lazy" />
                <div><b>{s.title}</b><br />{s.width || '?'}×{s.height || '?'} px{s.size_bytes ? ` · ${(s.size_bytes / 1e6).toFixed(1)} MB` : ''}</div>
              </button>
            ))}
          </div>
        ) : <Empty>No samples bundled.</Empty>}
      </Card>
    </div>
  )
}
