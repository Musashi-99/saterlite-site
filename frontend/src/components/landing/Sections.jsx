import { Link } from 'react-router-dom'
import Reveal, { Count } from '../common/Reveal'
import SmartImage from '../common/SmartImage'
import { Btn } from '../common/ui'
import EarthCanvas from './EarthCanvas'
import { GovArt, EnvArt, EnergyArt, MaritimeArt, MissionArt } from './Art'
import { ASSETS } from '../../lib/assets'
import { useWorkspace } from '../../context/WorkspaceContext'
import { BRAND } from '../../lib/brand'

export function Sensors() {
  const { meta } = useWorkspace()
  const names = meta.sensors.length ? meta.sensors.map((s) => s.sensor) : ['Sentinel-2', 'Landsat', 'LISS-IV', 'Cartosat-2', 'SAR']
  return (
    <div className="trusted" aria-label="Supported sensors">
      <span className="lab">WORKS WITH</span>
      {names.slice(0, 7).map((n) => <span key={n} className="nm">{n}</span>)}
    </div>
  )
}

export function Statement() {
  return (
    <section id="about"><div className="wrap">
      <Reveal as="p" className="statement">
        {BRAND.name} is an Earth intelligence platform. {BRAND.product} combines pixel-level satellite analytics with evidence-first AI so governments, enterprises and researchers can detect change, manage risk and protect key infrastructure — with every answer traceable to a measurement.
      </Reveal>
    </div></section>
  )
}

export function Platform() {
  return (
    <section id="platform"><div className="wrap intel">
      <Reveal>
        <h2>Intelligence that moves<br />the world forward</h2>
        <div className="stats">
          <div><b><Count to={100} suffix="%" /></b><small>Answers cite evidence IDs</small></div>
          <div><b>Offline</b><small>No API keys, no cloud calls</small></div>
          <div><b><Count to={42} /></b><small>Fixed seed — reproducible runs</small></div>
          <div><b>Δ</b><small>Bi-temporal change detection</small></div>
        </div>
        <Btn to="/app/analyze">Explore platform</Btn>
      </Reveal>
      <Reveal className="map" delay={150}>
        <SmartImage src={ASSETS.intelMap.src} minWidth={ASSETS.intelMap.minWidth} alt="Coastal satellite scene" className="fill"
          fallback={<div className="fill map-fallback" />} />
        <span className="co">41.8821° N<br />2.1734° E</span>
        <div className="alert">
          <b>COASTAL CHANGE DETECTED</b>
          <span>+0.8 km² total gain</span>
          <svg viewBox="0 0 200 30" aria-hidden><path d="M0 26 Q30 24 50 20 T100 14 T150 8 T200 2" stroke="#6fb4ff" strokeWidth="2" fill="none" /></svg>
        </div>
        <div className="years">{[2020, 2022, 2024, 2025, 2026].map((y) => <span key={y}>{y}</span>)}</div>
      </Reveal>
    </div></section>
  )
}

const INDUSTRIES = [
  { key: 'gov', title: 'GOVERNMENT', text: 'Enhancing national security, urban planning, and infrastructure monitoring at scale.', art: <GovArt /> },
  { key: 'env', title: 'ENVIRONMENTAL', text: 'Real-time monitoring of climate impact, biodiversity, and ecosystem changes.', art: <EnvArt /> },
  { key: 'energy', title: 'ENERGY & RESOURCES', text: 'Optimizing resource extraction and tracking grid infrastructure efficiency.', art: <EnergyArt /> },
  { key: 'maritime', title: 'MARITIME', text: 'Tracking vessel movements, coastal shifts, and oceanic conditions worldwide.', art: <MaritimeArt /> },
]
export function Industries() {
  return (
    <section id="industries"><div className="wrap">
      <div className="head">
        <Reveal as="h2">Solving Earth&apos;s biggest challenges</Reveal>
        <Link to="/app/scenes" className="more">View all scenes ›</Link>
      </div>
      <div className="cards big-cards">
        {INDUSTRIES.map((c, i) => (
          <Reveal as="div" key={c.key} delay={i * 90} className="card-wrap">
            <Link to="/app/scenes" className="icard">
              <SmartImage src={ASSETS[c.key].src} minWidth={ASSETS[c.key].minWidth} className="fill" position="center" fallback={c.art} />
              <span className="ic" aria-hidden>↗</span>
              <div className="ct"><h5>{c.title}</h5><p>{c.text}</p></div>
            </Link>
          </Reveal>
        ))}
      </div>
    </div></section>
  )
}

export function Story() {
  return (
    <section id="resources"><div className="wrap story">
      <Reveal className="vid">
        <SmartImage src={ASSETS.story.src} minWidth={ASSETS.story.minWidth} className="fill" alt="Glacier from orbit" position="center 40%" />
        <div className="vid-t">
          <h3>Melting Patterns,<br />Real Solutions</h3>
          <small>How satellite data helps communities stay one step ahead of climate change.</small>
        </div>
        <Link to="/app/change" className="play" aria-label="Open change detection">▶</Link>
      </Reveal>
      <Reveal delay={150}>
        <h2>A more resilient planet<br />within reach</h2>
        <div className="tags"><span>• A safer tomorrow</span><span>• Real-time insights</span><span>• Long-term impact</span></div>
        <p>From climate monitoring to infrastructure planning, our data empowers smarter decisions across industries and continents.</p>
        <Link to="/app/scenes" className="more">Explore use cases ›</Link>
      </Reveal>
    </div></section>
  )
}

export function Mission() {
  const { meta } = useWorkspace()
  const stats = [
    ['01 / sensor profiles', meta.sensors.length || '—'],
    ['02 / api keys required', '0'],
    ['03 / answers cite evidence', '100%'],
    ['04 / deterministic seed', '42'],
  ]
  return (
    <div className="mission">
      <div className="wm" aria-hidden>{BRAND.name}</div>
      <div className="lab">⇢ our mission ⇠</div>
      <Reveal as="h2" className="big">{BRAND.name} turns orbital sensing into planetary decisions.</Reveal>
      <p className="mono-p">Every figure is measured from pixels, every inference is labelled, every limitation is stated. Innovation is born where ideas know no boundaries.</p>
      <div className="dcards">
        {stats.map(([l, n]) => <div className="dc" key={l}><span>{l}</span><b>{n}</b></div>)}
      </div>
      <div className="astro">
        <SmartImage src={ASSETS.mission.src} minWidth={ASSETS.mission.minWidth} className="fill" fallback={<MissionArt />} />
      </div>
    </div>
  )
}

export function Footer() {
  return (
    <>
      <footer className="lfoot">
        <div className="fw">{BRAND.name}</div>
        <ul><li><a href="#about">About us</a></li><li><Link to="/app/analyze">Products</Link></li></ul>
        <ul><li><a href="#resources">Resources</a></li><li><Link to="/app/settings">Contact</Link></li></ul>
        <ul><li><Link to="/app/settings">Privacy policy</Link></li><li><Link to="/app/settings">Cookies</Link></li></ul>
      </footer>
    </>
  )
}
