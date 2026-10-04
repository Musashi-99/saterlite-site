export default function Legend({ items, digits = 2 }) {
  return (items || []).map((l) => (
    <div key={l.label} className="lgrow">
      <span className="sw" style={{ background: l.color }} /> {l.label} — <b>{(l.fraction * 100).toFixed(1)}%</b> · {l.area_km2.toFixed(digits)} km²
      <div className="legendbar"><i style={{ width: `${(l.fraction * 100).toFixed(1)}%`, background: l.color }} /></div>
    </div>
  ))
}
