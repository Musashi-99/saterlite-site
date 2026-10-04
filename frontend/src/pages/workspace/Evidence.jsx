import { useEffect } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Card, DataTable, NoSession, Pill } from '../../components/common/ui'

export default function Evidence() {
  const { session, evidence, refreshEvidence } = useWorkspace()
  useEffect(() => { refreshEvidence(session) }, [session, refreshEvidence])
  if (!session) return <div className="page"><h1 className="ptitle">Evidence</h1><NoSession /></div>

  return (
    <div className="page">
      <h1 className="ptitle">Evidence graph</h1>
      <Card title={`${evidence.evidence.length} items`}>
        <DataTable head={['ID', 'Type', 'Item', 'Value', 'Method']}
          rows={evidence.evidence.map((e) => {
            let v = e.value
            if (typeof v === 'object') v = JSON.stringify(v).slice(0, 160)
            return [
              <code key="i">{e.evidence_id}</code>,
              <Pill key="t" tone={e.type === 'limitation' ? 'w' : 'i'}>{e.type}</Pill>,
              e.note || e.source,
              <span key="v"><code>{String(v)}</code>{e.unit ? ' ' + e.unit : ''}{e.confidence != null ? ` (${(e.confidence * 100).toFixed(0)}%)` : ''}</span>,
              e.method,
            ]
          })} />
      </Card>
      <Card title="Query log">
        <DataTable head={['Query', 'Intent', 'Conf', 'Latency']} align={['left', 'left', 'right', 'right']} empty="No queries yet."
          rows={evidence.queries.map((q) => [q.query, <code key="i">{q.intent}</code>, q.confidence ?? '—', `${q.ms} ms`])} />
      </Card>
    </div>
  )
}
