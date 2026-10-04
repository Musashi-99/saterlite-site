import { useEffect, useRef } from 'react'

// Tiny seeded PRNG so the art is identical on every render / resize.
function rng(seed) {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 }
}
const gauss = (r) => (r() + r() + r() + r() - 2) / 2

function draw(canvas, variant) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
  const { clientWidth: cw, clientHeight: ch } = canvas
  const w = (canvas.width = Math.round(cw * dpr))
  const h = (canvas.height = Math.round(ch * dpr))
  const ctx = canvas.getContext('2d')
  const r = rng(variant === 'hero' ? 7 : 21)

  // space
  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#03050b'); sky.addColorStop(1, '#070d1c')
  ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h)

  if (variant === 'hero') {
    // milky-way haze
    const g = ctx.createRadialGradient(w * 0.55, h * 0.12, 0, w * 0.55, h * 0.12, w * 0.5)
    g.addColorStop(0, 'rgba(190,150,110,.22)'); g.addColorStop(0.5, 'rgba(90,100,160,.12)'); g.addColorStop(1, 'transparent')
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h)
    for (let i = 0; i < 520; i++) {
      ctx.globalAlpha = 0.25 + r() * 0.75
      ctx.fillStyle = r() > 0.85 ? '#ffd9b0' : '#cfe0ff'
      ctx.beginPath(); ctx.arc(r() * w, r() * h * 0.7, (0.4 + r() * 1.1) * dpr, 0, 7); ctx.fill()
    }
    ctx.globalAlpha = 1
  }

  // earth limb: a huge circle whose centre is below the canvas
  const limbY = variant === 'hero' ? h * 0.52 : h * 0.1
  const R = w * (variant === 'hero' ? 1.25 : 2.1)
  const cx = w / 2, cy = limbY + R

  // atmosphere glow
  const atm = ctx.createRadialGradient(cx, cy, R * 0.97, cx, cy, R * 1.045)
  atm.addColorStop(0, 'rgba(70,150,255,.95)'); atm.addColorStop(0.18, 'rgba(60,130,255,.55)')
  atm.addColorStop(0.5, 'rgba(40,90,200,.18)'); atm.addColorStop(1, 'transparent')
  ctx.fillStyle = atm; ctx.fillRect(0, 0, w, h)

  // body
  ctx.save()
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip()
  const body = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R)
  body.addColorStop(0, '#02040a'); body.addColorStop(0.85, '#050c1f'); body.addColorStop(1, '#0d2a5c')
  ctx.fillStyle = body; ctx.fillRect(0, 0, w, h)

  // city lights in clusters
  const clusters = variant === 'hero' ? 70 : 90
  for (let c = 0; c < clusters; c++) {
    const ccx = r() * w
    const ccy = limbY + (0.05 + Math.pow(r(), 0.7) * 0.95) * (h - limbY)
    const spread = (14 + r() * 70) * dpr
    const n = 50 + r() * 220
    const warm = r() > 0.25
    for (let i = 0; i < n; i++) {
      const x = ccx + gauss(r) * spread * 1.6
      const y = ccy + gauss(r) * spread
      // fade lights towards the limb (foreshortening)
      const depth = Math.min(1, Math.max(0, (y - limbY) / (h * 0.25)))
      ctx.globalAlpha = (0.25 + r() * 0.75) * (0.35 + depth * 0.65)
      ctx.fillStyle = warm ? (r() > 0.7 ? '#fff1c9' : '#ffb560') : '#9ec8ff'
      ctx.beginPath(); ctx.arc(x, y, (0.5 + r() * (0.5 + depth * 1.3)) * dpr, 0, 7); ctx.fill()
    }
  }
  ctx.globalAlpha = 1
  ctx.restore()

  // bright rim line
  ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI * 1.15, Math.PI * 1.85)
  ctx.strokeStyle = 'rgba(150,200,255,.85)'; ctx.lineWidth = 1.5 * dpr; ctx.stroke()
}

/** Resolution-independent Earth. Redraws crisply at any size / pixel ratio. */
export default function EarthCanvas({ variant = 'hero', className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const c = ref.current
    const go = () => draw(c, variant)
    go()
    const ro = new ResizeObserver(go)
    ro.observe(c)
    return () => ro.disconnect()
  }, [variant])
  return <canvas ref={ref} className={`earth-canvas ${className}`} aria-hidden />
}
