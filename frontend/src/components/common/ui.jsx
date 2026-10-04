import { useEffect } from 'react'
import { Link } from 'react-router-dom'

/** Pill button with arrow. Pass `to` for router links, `href` for anchors, else it's a <button>. */
export function Btn({ to, href, onClick, children, arrow = true, variant = '', size = '', disabled, type = 'button', ...rest }) {
  const cls = `btn ${variant} ${size} ${arrow ? '' : 'plain'}`
  const inner = <>{children}{arrow && <span className="arr" aria-hidden>→</span>}</>
  if (to) return <Link to={to} className={cls} onClick={onClick} {...rest}>{inner}</Link>
  if (href) return <a href={href} className={cls} onClick={onClick} {...rest}>{inner}</a>
  return <button type={type} className={cls} onClick={onClick} disabled={disabled} {...rest}>{inner}</button>
}

export const Pill = ({ tone = '', children }) => <span className={`pill ${tone}`}>{children}</span>
export const Spinner = () => <span className="spin" role="status" aria-label="Loading" />

export function Card({ title, aside, children, className = '', flush = false }) {
  return (
    <div className={`wcard ${className}`}>
      {title && <header className="wcard-h"><h3>{title}</h3>{aside && <div className="aside">{aside}</div>}</header>}
      <div className={flush ? '' : 'wcard-b'}>{children}</div>
    </div>
  )
}

export const Empty = ({ children }) => <div className="empty">{children}</div>

export function KV({ rows }) {
  return (
    <dl className="kv">
      {rows.map(([k, v], i) => (<div key={i} className="kv-row"><dt>{k}</dt><dd>{v}</dd></div>))}
    </dl>
  )
}

export function DataTable({ head, rows, empty = 'None.', align = [] }) {
  return (
    <div className="tscroll">
      <table className="t">
        <thead><tr>{head.map((h, i) => <th key={i} style={{ textAlign: align[i] || 'left' }}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.length ? rows.map((r, i) => (
            <tr key={i}>{r.map((c, j) => <td key={j} style={{ textAlign: align[j] || 'left' }}>{c}</td>)}</tr>
          )) : <tr><td colSpan={head.length}>{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  )
}

export function Modal({ onClose, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])
  return (
    <div className="modal" role="dialog" aria-modal onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="box">{children}</div>
    </div>
  )
}

export function Toasts({ items }) {
  return <div className="toasts" aria-live="polite">{items.map((t) => <div key={t.id} className="toast">{t.text}</div>)}</div>
}

export function NoSession() {
  return (
    <div className="nosession">
    <Card>
      <Empty>
        <b className="big">No analysis yet.</b>
        <p>Analyze a scene first — upload imagery or pick a sample.</p>
        <div className="btnrow center">
          <Btn to="/app/analyze" size="sm" arrow={false} variant="primary">Go to Analyze</Btn>
        </div>
      </Empty>
    </Card>
    </div>
  )
}
