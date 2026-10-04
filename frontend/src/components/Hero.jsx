import { useEffect, useState } from 'react'
import Stars from './Stars'
import Btn from './Btn'

export default function Hero() {
  const [t, setT] = useState({ alt: 525, vel: 7.6 })
  useEffect(() => {
    const id = setInterval(() => setT({ alt: 525 + Math.random() * 0.6 - 0.3, vel: 7.6 + Math.random() * 0.04 }), 1800)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="hero" id="top">
      <div className="hero-bg" />
      <Stars />
      <h1>Operational Earth<br />Intelligence</h1>
      <img id="sat" src="/assets/satellite.png" alt="Satellite" />
      <div className="hero-copy">
        <p>Turning satellite data into actionable intelligence for complex decisions.</p>
        <Btn>Request a demo</Btn>
      </div>
      <div className="scroll">Scroll to explore</div>
      <div className="hud">
        <h6>SAT-7A <span>• ACTIVE</span></h6>
        <dl>
          <dt>Altitude</dt><dd>{t.alt.toFixed(0)} km</dd>
          <dt>Velocity</dt><dd>{t.vel.toFixed(2)} km/s</dd>
          <dt>Status</dt><dd>Nominal</dd>
        </dl>
      </div>
    </div>
  )
}
