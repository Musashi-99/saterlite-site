import Reveal from './Reveal'
import Btn from './Btn'
import { useReveal, useCountUp } from '../hooks'

function Count({ n, suffix, decimals = 0 }) {
  const [ref, shown] = useReveal()
  const v = useCountUp(n, shown)
  return <span ref={ref}>{v.toFixed(decimals)}{suffix}</span>
}

export default function Intel() {
  return (
    <section id="platform"><div className="wrap intel">
      <Reveal>
        <h2>Intelligence that moves<br />the world forward</h2>
        <div className="stats">
          <div><Count n={99.7} suffix="%" decimals={1} /><small>Data delivery accuracy</small></div>
          <div>24/7<small>Global coverage monitoring</small></div>
          <div><Count n={150} suffix="+" /><small>Satellites connected</small></div>
          <div>AI<small>Powered insights</small></div>
        </div>
        <Btn>Explore platform</Btn>
      </Reveal>
      <Reveal className="map">
        <span className="co">41.8821° N<br />2.1734° E</span>
        <div className="alert">
          <b>COASTAL CHANGE DETECTED</b>
          <span style={{ color: 'var(--mute)' }}>+0.8 km² total gain</span>
          <svg viewBox="0 0 200 30"><path d="M0 26 Q30 24 50 20 T100 14 T150 8 T200 2" stroke="#6fb4ff" strokeWidth="1.5" fill="none" /></svg>
        </div>
        <div className="years">{[2020, 2022, 2024, 2025, 2026].map(y => <span key={y}>{y}</span>)}</div>
      </Reveal>
    </div></section>
  )
}
