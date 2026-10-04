export default function Trusted() {
  return (
    <div className="trusted">
      <span>TRUSTED BY</span>
      {['SPACEX', 'NASA', 'planet', 'AIRBUS', 'esa'].map(n => <span key={n}>{n}</span>)}
    </div>
  )
}
