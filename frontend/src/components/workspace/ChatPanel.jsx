import { useEffect, useRef, useState } from 'react'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Md } from '../../lib/format.jsx'
import { Modal, Pill, Spinner } from '../common/ui'

const DEFAULT_SUGG = ['Describe this scene', 'How much of the area is water?', 'Where is the built-up area?', 'How many water bodies are there?', 'Are there any ships?', 'Count the roads', 'What is the vegetation cover?', 'What is the NDVI here?', 'Show the evidence behind this result']
const CHANGE_SUGG = ['What changed between the two dates?', 'Did vegetation decrease?', 'Has the built-up area expanded?', 'Compare the land cover between the two dates']

export default function ChatPanel() {
  const { data, messages, ask, asking, explain, setExplain, toast } = useWorkspace()
  const [q, setQ] = useState('')
  const [zoom, setZoom] = useState(null)
  const endRef = useRef(null)
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }) }, [messages, asking])

  const sugg = ((data?.change ? CHANGE_SUGG : []).concat(DEFAULT_SUGG)).slice(0, 9)
  const send = (text) => { const t = (text ?? q).trim(); if (!t || !data || asking) return; setQ(''); ask(t) }

  return (
    <aside className="chatpanel" aria-label="Query assistant">
      <div className="chat-h">
        <h3>Query Assistant</h3>
        <label className="explain">
          <input type="checkbox" checked={explain} onChange={(e) => { setExplain(e.target.checked); toast(e.target.checked ? 'Explain mode on — queries return full pipeline traces' : 'Explain mode off') }} />
          Explain mode
        </label>
      </div>
      <div className="chat">
        {!messages.length && <div className="empty">Analyze a scene, then ask anything.<br />Every answer is grounded in measured evidence.</div>}
        {messages.map((m) => m.role === 'me'
          ? <div key={m.id} className="msg me">{m.text}</div>
          : <AiMessage key={m.id} m={m} onZoom={setZoom} />)}
        {asking && <div className="msg ai"><Spinner /> reasoning over scene evidence…</div>}
        <div ref={endRef} />
      </div>
      {data && (
        <div className="sugg">{sugg.map((s) => <button key={s} className="sg" onClick={() => send(s)} disabled={asking}>{s}</button>)}</div>
      )}
      <form className="askbar" onSubmit={(e) => { e.preventDefault(); send() }}>
        <input type="text" value={q} onChange={(e) => setQ(e.target.value)} disabled={!data} placeholder={data ? 'e.g. How much of this scene is water?' : 'Analyze a scene to start asking'} aria-label="Ask a question" />
        <button className="btn sm primary" type="submit" disabled={!data || asking || !q.trim()}>Ask</button>
      </form>
      {zoom && <Modal onClose={() => setZoom(null)}><img src={zoom} alt="Query overlay" /></Modal>}
    </aside>
  )
}

function AiMessage({ m, onZoom }) {
  const x = m.meta || {}
  const ev = x.evidence_v2?.length ? x.evidence_v2 : x.evidence
  return (
    <div className="msg ai">
      <div className="mdtext"><Md text={m.text} /></div>
      <div className="meta">
        {x.intent && <Pill tone="i">intent: {x.intent}</Pill>}
        {x.plan && <><Pill>target: {x.plan.target || ''}</Pill><Pill>op: {x.plan.operation || ''}</Pill></>}
        {x.entities?.length > 0 && <Pill>entities: {x.entities.join(', ')}</Pill>}
        {x.objects?.length > 0 && <Pill>objects: {x.objects.join(', ')}</Pill>}
        {x.confidence != null && <Pill tone={x.confidence >= 0.7 ? 'c' : x.confidence >= 0.5 ? '' : 'w'}>confidence {(x.confidence * 100).toFixed(0)}%</Pill>}
        {x.ms != null && <Pill>{x.ms} ms</Pill>}
      </div>
      {x.plan?.tools?.length > 0 && (
        <details className="ev"><summary>Plan — interpretation → tools → evidence</summary>
          <div className="evrow"><span className="k">tools</span> {x.plan.tools.join(', ')}<div className="m">required evidence: {(x.plan.required_evidence || []).join(', ')}</div></div>
        </details>
      )}
      {x.trace && (
        <details className="ev"><summary>Agent registry trace — task: {x.trace.task || ''}{x.trace.compat && !x.trace.compat.ok ? ' ⚠️ compat issue' : ''}</summary>
          {(x.trace.models || []).map((mo, i) => (
            <div key={i} className="evrow"><span className="k">{mo.name} v{mo.version}</span> {mo.tool} · {mo.type}/{mo.modality}<div className="m">{JSON.stringify(mo.params)}</div></div>
          ))}
          {(x.trace.compat?.issues || []).map((is, i) => <div key={i} className="evrow"><span className="k">⚠️ {is.tool}</span> {is.reason}</div>)}
          <div className="evrow"><span className="k">params</span> {JSON.stringify(x.trace.params)}</div>
        </details>
      )}
      {x.steps && (
        <details className="ev" open><summary>Pipeline trace — what the system did</summary>
          {x.steps.map((s, i) => <div key={i} className="evrow"><span className="k">step {i + 1}</span> {s}</div>)}
        </details>
      )}
      {x.reasoning && !x.reasoning.refused && (
        <details className="ev"><summary>Grounded interpretation (cites evidence IDs)</summary><div className="evrow"><Md text={x.reasoning.text || ''} /></div></details>
      )}
      {ev?.length > 0 && (
        <details className="ev"><summary>Evidence — how this was computed</summary>
          {ev.map((e, i) => {
            let v = e.value ?? ''
            if (typeof v === 'object') v = JSON.stringify(v).slice(0, 200)
            return (
              <div key={i} className="evrow">
                <span className="k">{e.evidence_id ? `[${e.evidence_id}] ` : ''}{e.note || e.metric || e.type || ''}</span> {String(v)}{e.unit ? ' ' + e.unit : ''}
                <div className="m">{e.method || ''}</div>
              </div>
            )
          })}
        </details>
      )}
      {m.overlay && <img className="ovthumb" src={m.overlay} alt="Query overlay" onClick={() => onZoom(m.overlay)} />}
    </div>
  )
}
