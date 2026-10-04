import { useEffect, useRef, useState } from 'react'

export function useReveal(threshold = 0.15) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect() }
    }, { threshold })
    io.observe(el)
    return () => io.disconnect()
  }, [threshold])
  return [ref, shown]
}

export default function Reveal({ as: Tag = 'div', className = '', delay = 0, children, ...rest }) {
  const [ref, shown] = useReveal()
  return (
    <Tag ref={ref} className={`rv ${shown ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms`, ...rest.style }} {...rest}>
      {children}
    </Tag>
  )
}

export function Count({ to, suffix = '', decimals = 0, ms = 1500 }) {
  const [ref, shown] = useReveal(0.4)
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!shown) return
    let raf, t0
    const step = (t) => {
      t0 = t0 ?? t
      const p = Math.min((t - t0) / ms, 1)
      setV(to * (1 - Math.pow(1 - p, 3)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [shown, to, ms])
  return <span ref={ref}>{v.toFixed(decimals)}{suffix}</span>
}
