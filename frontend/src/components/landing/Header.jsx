import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Btn } from '../common/ui'
import { BRAND } from '../../lib/brand'

const links = [['About', 'about'], ['Platform', 'platform'], ['Industries', 'industries'], ['Resources', 'resources']]

export default function Header() {
  const [active, setActive] = useState('about')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    const spy = () => {
      let cur = links[0][1]
      links.forEach(([, id]) => {
        const el = document.getElementById(id)
        if (el && el.getBoundingClientRect().top <= window.innerHeight * 0.4) cur = id
      })
      setActive(cur)
    }
    spy()
    window.addEventListener('scroll', spy, { passive: true })
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('scroll', spy) }
  }, [])

  return (
    <header className={`lhead ${scrolled ? 'scrolled' : ''}`}>
      <Link className="logo" to="/" aria-label={BRAND.name}><i /><span>{BRAND.name}</span></Link>
      <nav aria-label="Primary">
        {links.map(([label, id]) => (
          <a key={id} href={`#${id}`} className={active === id ? 'on' : ''}>{label}</a>
        ))}
      </nav>
      <Btn to="/app/analyze">Open workspace</Btn>
    </header>
  )
}
