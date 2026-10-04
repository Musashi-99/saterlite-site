import { useEffect } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Card, DataTable, Empty, NoSession } from '../../components/common/ui'
import Viewer from '../../components/workspace/Viewer'

export default function Change() {
  const { data, setLayer } = useWorkspace()
  const ch = data?.change
  useEffect(() => { if (ch && data.images.change) setLayer('change') }, [ch, data?.session]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <div className="page"><h1 className="ptitle">Change detection</h1><NoSession /></div>
  if (!ch) return <div className="page"><h1 className="ptitle">Change detection</h1><Card><Empty><b className="big">No change data.</b><p>This session has a single date. Load a T2 scene to run bi-temporal change detection.</p></Empty></Card></div>

  const deltas = Object.entries(ch.deltas || {})
  return (
    <div className="page">
      <h1 className="ptitle">Change detection</h1>
      <Viewer />
      <Card title="Change summary">
        <div className="sumrow"><span className={`sev ${ch.severity || 'MEDIUM'}`}>{ch.severity || '—'}</span><span className="sumtxt"><b>{(ch.changed_fraction * 100).toFixed(2)}%</b> of scene changed</span></div>
        <div className="hint">Registration: {ch.registration} · Histogram-matched: {ch.quality?.histogram_matched ? 'yes' : 'no'}</div>
        <div className="grid2 top">
          <div><h4 className="sub">Dominant transitions</h4>
            <DataTable head={['From → To', 'Area']} align={['left', 'right']} empty="None above threshold."
              rows={(ch.transitions || []).slice(0, 8).map((t) => [`${t.from_label} → ${t.to_label}`, `${t.area_km2} km²`])} /></div>
          <div><h4 className="sub">Hotspots</h4>
            <DataTable head={['#', 'BBox', 'Area', 'Sev']} align={['left', 'left', 'right', 'left']} empty="None."
              rows={(ch.hotspots || []).map((h, i) => [`H${i + 1}`, <code key={i}>{h.bbox.join(',')}</code>, `${h.area_km2} km²`, h.severity])} /></div>
        </div>
        <h4 className="sub top">Per-class deltas (T2 − T1, km²)</h4>
        <DataTable head={deltas.map(([k]) => k)} rows={deltas.length ? [deltas.map(([, v]) => v)] : []} />
      </Card>
    </div>
  )
}
