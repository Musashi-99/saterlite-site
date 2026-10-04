import Btn from './Btn'

const links = [['About', '#about'], ['Platform', '#platform'], ['Industries', '#industries'], ['Resources', '#resources']]

export default function Header() {
  return (
    <header>
      <a className="logo" href="#top"><i />VEYRA</a>
      <nav>{links.map(([l, h], i) => <a key={l} className={i === 0 ? 'on' : ''} href={h}>{l}</a>)}</nav>
      <Btn>Request a demo</Btn>
    </header>
  )
}
