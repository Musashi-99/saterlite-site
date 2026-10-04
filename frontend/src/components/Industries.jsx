import Reveal from './Reveal'

const items = [
  ['c1', 'GOVERNMENT', 'Enhancing national security, urban planning, and infrastructure monitoring at scale.'],
  ['c2', 'ENVIRONMENTAL', 'Real-time monitoring of climate impact, biodiversity, and ecosystem changes.'],
  ['c3', 'ENERGY & RESOURCES', 'Optimizing resource extraction and tracking grid infrastructure efficiency.'],
  ['c4', 'MARITIME', 'Tracking vessel movements, coastal shifts, and oceanic conditions worldwide.'],
]

export default function Industries() {
  return (
    <section id="industries"><div className="wrap">
      <div className="head"><h2>Solving Earth's biggest challenges</h2><a href="#">View all industries ›</a></div>
      <div className="cards">
        {items.map(([c, t, d]) => (
          <Reveal as="a" href="#" key={t} className={`card ${c}`}>
            <span className="ic">↗</span><h5>{t}</h5><p>{d}</p>
          </Reveal>
        ))}
      </div>
    </div></section>
  )
}
