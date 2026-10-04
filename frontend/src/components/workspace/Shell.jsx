import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Toasts } from '../common/ui'
import ChatPanel from './ChatPanel'
import { BRAND } from '../../lib/brand'

const NAV = [
  ['Workspace', [['overview', '◉', 'Overview'], ['scenes', '▦', 'Scenes'], ['analyze', '⬆', 'Analyze']]],
  ['Intelligence', [['compare', '◐', 'Compare'], ['change', '⚡', 'Change Detection'], ['landcover', '▣', 'Land Cover'], ['spectral', '≋', 'Spectral Analysis'], ['objects', '◎', 'Objects'], ['evidence', '⧉', 'Evidence']]],
  ['Outputs', [['reports', '▤', 'Reports & JSON'], ['history', '↺', 'History'], ['settings', '⚙', 'Settings']]],
]

export default function Shell() {
  const { data, busy, meta, toasts } = useWorkspace()
  const [chatOpen, setChatOpen] = useState(false)

  const status = busy ? <><span className="spin" /> analysing</> : data ? `● analysed in ${data.ms} ms` : meta.online === false ? '● backend offline' : '● ready'
  return (
    <div className="ws">
      <header className="wtop">
        <Link to="/" className="wlogo"><span className="mark"><i /></span><span><b>{BRAND.name}</b><small>{BRAND.product} · Earth observation</small></span></Link>
        <div className="chips">
          <Link to="/" className="chip link">← Landing</Link>
          <span className={`chip ${data ? (data.georeferenced ? 'geo' : 'warn') : ''}`}>{data ? (data.georeferenced ? 'GEOREFERENCED' : 'IMAGE-SPACE') : 'no scene'}</span>
          <span className="chip">{data ? `session ${data.session}` : 'no session'}</span>
          <span className={`chip ${meta.online === false ? 'bad' : 'live'}`}>{status}</span>
          <button className="chip link chat-toggle" onClick={() => setChatOpen((o) => !o)}>{chatOpen ? 'Hide assistant' : '💬 Assistant'}</button>
        </div>
      </header>

      <div className={`wlayout ${chatOpen ? 'chat-open' : ''}`}>
        <nav className="wnav" aria-label="Workspace">
          {NAV.map(([group, items]) => (
            <div key={group}>
              <div className="nl">{group}</div>
              {items.map(([to, icon, label]) => (
                <NavLink key={to} to={`/app/${to}`} className={({ isActive }) => `nitem ${isActive ? 'on' : ''}`}><span className="ico" aria-hidden>{icon}</span>{label}</NavLink>
              ))}
            </div>
          ))}
        </nav>
        <main className="wmain"><Outlet /></main>
        <ChatPanel />
      </div>
      <Toasts items={toasts} />
    </div>
  )
}
