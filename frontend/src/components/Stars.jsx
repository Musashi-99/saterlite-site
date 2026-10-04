import { useEffect, useRef } from 'react'

export default function Stars() {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current, x = c.getContext('2d')
    let S = [], raf
    const size = () => {
      c.width = innerWidth; c.height = innerHeight
      S = Array.from({ length: 240 }, () => ({ x: Math.random() * c.width, y: Math.random() * c.height, r: Math.random() * 1.2, p: Math.random() * 6 }))
    }
    const frame = t => {
      x.clearRect(0, 0, c.width, c.height)
      for (const s of S) {
        x.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t / 1500 + s.p))
        x.fillStyle = '#cfe0ff'; x.beginPath(); x.arc(s.x, s.y, s.r, 0, 7); x.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    size(); addEventListener('resize', size); raf = requestAnimationFrame(frame)
    return () => { removeEventListener('resize', size); cancelAnimationFrame(raf) }
  }, [])
  return <canvas id="stars" ref={ref} />
}
