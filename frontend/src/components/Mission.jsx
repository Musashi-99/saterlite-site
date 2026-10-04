import Reveal from './Reveal'

const stats = [
  ['01 / system reliability', '98,7%'],
  ['02 / less power consumption', '-30%'],
  ['03 / countries receive data', '+60'],
  ['04 / engineers and analysts', '100+'],
]

export default function Mission() {
  return (
    <div className="mission">
      <div className="wm">VEYRA</div>
      <div className="lab">⇢ our mission ⇠</div>
      <Reveal as="h2" className="big">Veyra is a next-generation company turning orbital sensing into planetary decisions.</Reveal>
      <p className="mono-p">Our constellation is developed from the ground up, from orbital platforms to data transmission systems. Innovation is born where ideas know no boundaries.</p>
      <div className="dcards">{stats.map(([l, n]) => <div className="dc" key={l}><span>{l}</span><b>{n}</b></div>)}</div>
      <div className="astro" />
    </div>
  )
}
