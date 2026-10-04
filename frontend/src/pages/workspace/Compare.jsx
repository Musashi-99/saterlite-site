import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Btn, Card, Empty, NoSession, Pill, Spinner } from '../../components/common/ui'
import { Md } from '../../lib/format.jsx'

export default function Compare() {
  const { data, session } = useWorkspace()
  const [pos, setPos] = useState(50)
  const [stat, setStat] = useState(null)

  useEffect(() => {
    if (!session || !data?.images?.t2) return
    setStat(null)
    api.query(session, 'Compare the land cover between the two dates')
      .then((r) => setStat({ answer: r.answer, intent: r.intent }))
      .catch((e) => setStat({ error: e.message }))
  }, [session, data?.images?.t2])

  if (!data) return <div className="page"><h1 className="ptitle">Compare</h1><NoSession /></div>
  if (!data.images.t2) {
    return (
      <div className="page"><h1 className="ptitle">Compare</h1>
        <Card><Empty><b className="big">Single-date session.</b><p>Load a second date (T2) to enable before/after comparison.</p>
          <div className="btnrow center"><Btn to="/app/analyze" size="sm" arrow={false} variant="primary">Go to Analyze</Btn></div></Empty></Card>
      </div>
    )
  }
  return (
    <div className="page">
      <h1 className="ptitle">Compare</h1>
      <Card title="Before / after — drag the slider">
        <div className="cmp">
          <img src={data.images.original} alt="T1" />
          <img className="top" src={data.images.t2} alt="T2" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} />
          <span className="dl" style={{ left: 12 }}>T1</span><span className="dl" style={{ right: 12 }}>T2</span>
          <span className="handle" style={{ left: `${pos}%` }} />
        </div>
        <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(+e.target.value)} className="wide" aria-label="Comparison position" />
      </Card>
      <Card title="Side-by-side class areas">
        {!stat ? <div><Spinner /> computing…</div> : stat.error ? <div className="err">{stat.error}</div> : (
          <><div className="mdtext"><Md text={stat.answer} /></div><div className="meta"><Pill tone="i">intent: {stat.intent}</Pill></div></>
        )}
      </Card>
    </div>
  )
}
