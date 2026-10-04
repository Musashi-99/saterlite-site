import { useNavigate } from 'react-router-dom'
import SmartImage from '../common/SmartImage'
import EarthCanvas from './EarthCanvas'
import { Btn } from '../common/ui'
import { ASSETS } from '../../lib/assets'
import { useWorkspace } from '../../context/WorkspaceContext'

export default function Hero() {
  const { meta, runSample, busy } = useWorkspace()
  const nav = useNavigate()
  const v = meta.version
  const demo = async () => {
    nav('/app/overview')
    try { await runSample('delta_t1.png', 'delta_t2.png') } catch { /* toast already shown */ }
  }

  return (
    <section className="hero" id="top">
      <div className="hero-bg">
        {/* Procedural Earth is always painted underneath; a ≥2400px photo, if supplied, covers it. */}
        <EarthCanvas variant="hero" />
        <SmartImage src={ASSETS.hero.src} minWidth={ASSETS.hero.minWidth} position="center 62%" className="hero-photo" priority />
      </div>
      <div className="hero-shade" />

      <h1>Operational Earth<br />Intelligence</h1>

      <SmartImage src={ASSETS.satellite.src} minWidth={ASSETS.satellite.minWidth} className="sat" alt="Earth-observation satellite" priority
        fallback={<SatelliteFallback />} />

      <div className="hero-copy">
        <p>Turning satellite data into actionable intelligence for complex decisions.</p>
        <div className="btnrow">
          <Btn to="/app/analyze" variant="primary">Analyze a scene</Btn>
          <Btn onClick={demo} disabled={busy}>Explore demo</Btn>
        </div>
      </div>

      <div className="hud" aria-label="System status">
        <h6>SYSTEM <span className={meta.online ? 'ok' : 'off'}>● {meta.online == null ? 'CHECKING' : meta.online ? 'ONLINE' : 'OFFLINE'}</span></h6>
        <dl>
          <dt>Version</dt><dd>{v ? `v${v.version}` : '—'}</dd>
          <dt>Sensors</dt><dd>{meta.sensors.length || '—'} supported</dd>
          <dt>Sessions</dt><dd>{meta.health?.sessions ?? '—'} active</dd>
        </dl>
      </div>
      <a className="scroll" href="#about">Scroll to explore<i /></a>
    </section>
  )
}

function SatelliteFallback() {
  return (
    <svg className="sat sat-svg" viewBox="0 0 400 300" role="img" aria-label="Satellite">
      <g stroke="#9ec8ff" strokeWidth="1.5" fill="#1b3d82">
        <path d="M10 70 L150 40 L170 110 L30 140Z" /><path d="M250 190 L390 160 L370 230 L230 260Z" />
      </g>
      <rect x="150" y="100" width="100" height="100" rx="14" fill="#c9d3e6" stroke="#fff" />
      <circle cx="200" cy="150" r="22" fill="#0a1020" stroke="#6fb4ff" strokeWidth="3" />
    </svg>
  )
}
