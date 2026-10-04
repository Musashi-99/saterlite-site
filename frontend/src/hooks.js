import { useEffect, useRef, useState } from 'react'

export function useReveal() {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setShown(true); io.disconnect() }
    }, { threshold: 0.2 })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [])
  return [ref, shown]
}

export function useCountUp(target, run, ms = 1400) {
  const [v, setV] = useState(0)
  useEffect(() => {
    if (!run) return
    let raf, t0
    const step = t => {
      t0 = t0 ?? t
      const p = Math.min((t - t0) / ms, 1)
      setV(target * p)
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, run, ms])
  return v
}
