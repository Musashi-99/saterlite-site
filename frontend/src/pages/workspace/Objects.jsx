import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Card, DataTable, NoSession, Spinner } from '../../components/common/ui'
import Viewer from '../../components/workspace/Viewer'

export default function Objects() {
  const { data, session, setLayer } = useWorkspace()
  const [obj, setObj] = useState(null)
  const [error, setError] = useState('')
  const [fam, setFam] = useState('')

  useEffect(() => {
    if (!session) return
    setObj(null); setError('')
    if (data.images.detections) setLayer('detections')
    api.objects(session).then((r) => { setObj(r.data); setFam(Object.keys(r.data.families || {})[0] || '') }).catch((e) => setError(e.message))
  }, [session]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <div className="page"><h1 className="ptitle">Objects</h1><NoSession /></div>
  const F = obj?.families || {}
  const f = F[fam] || {}
  const dets = f.detections || []
  const st = f.stats
  return (
    <div className="page">
      <h1 className="ptitle">Objects</h1>
      <Viewer />
      <Card title="Object intelligence">
        {error && <div className="err">{error}</div>}
        {!obj && !error && <div><Spinner /> loading…</div>}
        {obj && (
          <>
            <div className="hint nomt">{obj.confidence_note} Scores are heuristic, not calibrated probabilities.</div>
            <label className="f" htmlFor="fam">Family</label>
            <select id="fam" value={fam} onChange={(e) => setFam(e.target.value)}>
              {Object.keys(F).map((k) => <option key={k} value={k}>{k} ({(F[k].detections || []).length})</option>)}
            </select>
            {st && <div className="hint">n={st.n}{st.length_m ? ` · length ${st.length_m.min}–${st.length_m.max} m (median ${st.length_m.median})` : ''}{st.area_m2 ? ` · area median ${st.area_m2.median} m²` : ''}</div>}
            <DataTable head={['ID', 'BBox', 'Centroid', 'Area', 'Score', 'Method']} align={['left', 'left', 'left', 'right', 'right', 'left']} empty="None detected."
              rows={dets.slice(0, 60).map((r) => [<code key={r.id}>{r.id}</code>, <code key="b">{r.bbox.join(',')}</code>, r.centroid.join(', '), `${r.area_m2} m²`, r.confidence, r.source_method])} />
            {dets.length > 60 && <div className="hint">Showing 60 of {dets.length}.</div>}
          </>
        )}
      </Card>
    </div>
  )
}
