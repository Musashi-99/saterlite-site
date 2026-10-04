import { useWorkspace } from '../../context/WorkspaceContext'
import { Card, DataTable, NoSession, Pill } from '../../components/common/ui'
import Viewer from '../../components/workspace/Viewer'
import Legend from '../../components/workspace/Legend'

export default function Landcover() {
  const { data } = useWorkspace()
  if (!data) return <div className="page"><h1 className="ptitle">Land cover</h1><NoSession /></div>
  const q = data.quality || {}
  const tone = q.label === 'HIGH' ? 'c' : q.label === 'MODERATE' ? 'i' : 'w'
  return (
    <div className="page">
      <h1 className="ptitle">Land cover</h1>
      <Viewer />
      <Card title="Land-cover intelligence" aside={<Pill tone={tone}>{q.label || '—'}</Pill>}>
        <Legend items={data.legend} digits={3} />
        <div className="hint">Classes are <b>algorithmically inferred</b> (k-means + physics rules), not ground-truth validated. Quality rules: {(q.rules || []).join('; ') || 'none fired'}. Mean confidence {q.mean_confidence ?? '—'}.</div>
        <h4 className="sub top">Cluster signatures</h4>
        <DataTable head={['#', 'Assigned', 'Fraction', 'Conf', 'Top scores']} align={['left', 'left', 'right', 'right', 'left']}
          rows={(data.clusters || []).map((c) => [c.cluster, c.assigned_label, `${(c.fraction * 100).toFixed(1)}%`, c.confidence, <code key={c.cluster}>{Object.entries(c.scores || {}).map(([k, v]) => `${k}:${v}`).join(' ')}</code>])} />
      </Card>
    </div>
  )
}
