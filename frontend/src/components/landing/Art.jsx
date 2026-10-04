// Crisp SVG artwork used when a photo slot has no (or a too-small) image.
const base = { width: '100%', height: '100%', preserveAspectRatio: 'xMidYMid slice', style: { position: 'absolute', inset: 0 } }

const rng = (seed) => { let s = seed; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296 } }

// Top-down city: street grid, glowing blocks, radar ring.
export function GovArt() {
  const rnd = rng(11)
  const blocks = []
  for (let gx = 0; gx < 9; gx++) for (let gy = 0; gy < 11; gy++) {
    if (rnd() < 0.22) continue
    const lit = rnd() > 0.7
    blocks.push([20 + gx * 42, 50 + gy * 40, 30 + rnd() * 8, 26 + rnd() * 8, lit])
  }
  return (
    <svg viewBox="0 0 400 500" {...base} aria-hidden>
      <defs>
        <linearGradient id="gv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#14264a" /><stop offset="1" stopColor="#060a14" /></linearGradient>
        <radialGradient id="gvg" cx=".5" cy=".38" r=".55"><stop offset="0" stopColor="#6fb4ff" stopOpacity=".5" /><stop offset="1" stopColor="#6fb4ff" stopOpacity="0" /></radialGradient>
      </defs>
      <rect width="400" height="500" fill="url(#gv)" />
      {blocks.map(([x, y, w, h, lit], i) => <rect key={i} x={x} y={y} width={w} height={h} rx="2" fill={lit ? '#ffc46b' : '#8fb8ff'} fillOpacity={lit ? 0.55 : 0.14} stroke={lit ? '#ffd9a0' : '#9ec8ff'} strokeOpacity={lit ? 0.9 : 0.35} />)}
      <path d="M0 330 L400 190 M0 180 L400 360" stroke="#ffc46b" strokeOpacity=".55" strokeWidth="3" />
      <rect width="400" height="500" fill="url(#gvg)" />
      {[120, 78, 40].map((rad) => <circle key={rad} cx="200" cy="200" r={rad} fill="none" stroke="#6fb4ff" strokeOpacity=".75" strokeDasharray={rad === 78 ? '6 6' : undefined} />)}
      <path d="M200 200 L200 80" stroke="#6fb4ff" strokeWidth="2" /><circle cx="200" cy="200" r="5" fill="#fff" />
      <text x="214" y="96" fill="#cfe3ff" fontSize="11" fontFamily="monospace">AOI-07 · 12.4 km²</text>
    </svg>
  )
}

// Forest canopy with winding river and detected-change patches.
export function EnvArt() {
  const rnd = rng(5)
  const trees = Array.from({ length: 260 }, () => [rnd() * 400, rnd() * 500, 5 + rnd() * 9, rnd()])
  return (
    <svg viewBox="0 0 400 500" {...base} aria-hidden>
      <defs><linearGradient id="ev" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#0f3b2c" /><stop offset="1" stopColor="#04130f" /></linearGradient></defs>
      <rect width="400" height="500" fill="url(#ev)" />
      {trees.map(([x, y, rad, t], i) => <circle key={i} cx={x} cy={y} r={rad} fill={t > 0.6 ? '#2f9e6b' : t > 0.25 ? '#1f7a53' : '#145a3d'} fillOpacity=".75" />)}
      <path d="M-10 90 C120 130 60 230 190 270 S330 360 270 520" fill="none" stroke="#0a2a3d" strokeWidth="34" strokeLinecap="round" />
      <path d="M-10 90 C120 130 60 230 190 270 S330 360 270 520" fill="none" stroke="#3a9ad0" strokeWidth="18" strokeLinecap="round" strokeOpacity=".85" />
      {[[290, 120, 52], [90, 380, 40]].map(([x, y, w], i) => <g key={i}><rect x={x} y={y} width={w} height={w * 0.7} fill="#c98b4a" fillOpacity=".55" stroke="#ffc46b" strokeDasharray="4 3" /><text x={x} y={y - 6} fill="#ffd9a0" fontSize="10" fontFamily="monospace">Δ loss</text></g>)}
    </svg>
  )
}

// Solar farm rows, spinning wind turbines and a low sun.
export function EnergyArt() {
  return (
    <svg viewBox="0 0 400 500" {...base} aria-hidden>
      <defs>
        <linearGradient id="en" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1b4a7a" /><stop offset=".55" stopColor="#e08a4a" /><stop offset=".56" stopColor="#0a1424" /><stop offset="1" stopColor="#050a14" /></linearGradient>
        <linearGradient id="enp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#2a5fb8" /><stop offset="1" stopColor="#0f2a5c" /></linearGradient>
      </defs>
      <rect width="400" height="500" fill="url(#en)" />
      <circle cx="300" cy="215" r="46" fill="#ffe2a8" fillOpacity=".95" />
      {[[70, 250, 1], [150, 235, 0.8], [330, 245, 0.9]].map(([x, y, k], i) => (
        <g key={i} transform={`translate(${x} ${y}) scale(${k})`} stroke="#eef4ff" strokeWidth="3" strokeLinecap="round">
          <path d="M0 0 V120" strokeWidth="4" />
          <g><path d="M0 0 L0 -62 M0 0 L54 31 M0 0 L-54 31" />
            <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur={`${9 + i * 3}s`} repeatCount="indefinite" /></g>
        </g>
      ))}
      {Array.from({ length: 6 }, (_, row) => Array.from({ length: 7 }, (_, col) => {
        const y = 300 + row * 32, w = 40 + row * 6, x = -20 + col * (w + 10) - row * 6
        return <path key={row + '-' + col} d={`M${x} ${y + 20} L${x + 12} ${y} H${x + w + 12} L${x + w} ${y + 20}Z`} fill="url(#enp)" stroke="#9ec8ff" strokeOpacity=".7" />
      }))}
    </svg>
  )
}

// Ocean with port, ships, wakes and AIS track.
export function MaritimeArt() {
  return (
    <svg viewBox="0 0 400 500" {...base} aria-hidden>
      <defs><linearGradient id="mt" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d4a78" /><stop offset="1" stopColor="#031225" /></linearGradient></defs>
      <rect width="400" height="500" fill="url(#mt)" />
      {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M0 ${40 + i * 30} Q100 ${28 + i * 30} 200 ${40 + i * 30} T400 ${40 + i * 30}`} stroke="#6fb4ff" strokeOpacity=".16" fill="none" />)}
      <path d="M260 0 L400 0 L400 210 L330 190 L300 120Z" fill="#2c3a2a" />
      {[[310, 40], [345, 70], [370, 110]].map(([x, y], i) => <rect key={i} x={x} y={y} width="26" height="10" fill={['#e05a4a', '#4aa0e0', '#e0b04a'][i]} />)}
      {[[90, 330, -20], [180, 220, 15], [250, 400, -35]].map(([x, y, rot], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
          <path d="M-5 0 L-120 -10 L-120 10Z" fill="#fff" fillOpacity=".18" />
          <path d="M-26 -9 H20 L32 0 L20 9 H-26Z" fill="#e9eef7" stroke="#fff" /><rect x="-18" y="-6" width="10" height="12" fill="#d84a3a" />
          <circle cx="0" cy="0" r="22" fill="none" stroke="#ffc46b" strokeOpacity=".8" strokeDasharray="3 3" />
        </g>
      ))}
      <path d="M40 470 C120 400 80 360 140 320 S230 250 190 230" stroke="#ffc46b" strokeWidth="2" strokeDasharray="6 5" fill="none" />
    </svg>
  )
}

export function MissionArt() {
  return (
    <svg viewBox="0 0 1200 400" {...base} aria-hidden>
      <defs><radialGradient id="ms" cx=".7" cy=".3" r=".8"><stop offset="0" stopColor="#555" /><stop offset=".6" stopColor="#151515" /><stop offset="1" stopColor="#050505" /></radialGradient></defs>
      <rect width="1200" height="400" fill="url(#ms)" />
      {Array.from({ length: 90 }, (_, i) => <circle key={i} cx={(i * 137) % 1200} cy={(i * 71) % 400} r={(i % 3) * 0.6 + 0.6} fill="#fff" fillOpacity={0.25 + (i % 5) * 0.12} />)}
    </svg>
  )
}
