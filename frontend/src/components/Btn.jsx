export default function Btn({ children, href = '#' }) {
  return <a className="btn" href={href}>{children} <b>→</b></a>
}
