import Reveal from './Reveal'

export default function Story() {
  return (
    <section id="resources"><div className="wrap story">
      <Reveal className="vid">
        <h3>Melting Patterns,<br />Real Solutions</h3>
        <small>How satellite data helps communities stay one step ahead of climate change.</small>
        <span className="play">▶</span>
      </Reveal>
      <Reveal>
        <h2 style={{ fontSize: 30 }}>A more resilient planet<br />within reach</h2>
        <div className="tags"><span>• A safer tomorrow</span><span>• Real-time insights</span><span>• Long-term impact</span></div>
        <p>From climate monitoring to infrastructure planning, our data empowers smarter decisions across industries and continents.</p>
        <a href="#" style={{ fontSize: 11 }}>Explore use cases ›</a>
      </Reveal>
    </div></section>
  )
}
