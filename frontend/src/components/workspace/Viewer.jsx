import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Card, KV, Pill, Spinner } from '../common/ui'
import { downloadUrl } from '../../lib/format.jsx'

const LAYER_LABEL = {
  original: 'Original', landcover: 'Land Cover', veg: 'Vegetation Index', detections: 'Detections', t2: 'T2 Scene',
  change: 'Change Map', sar: 'SAR Scene', fusion: 'Optical+SAR Fusion', uncertainty: 'Uncertainty', answer: 'Query Overlay',
}
const TOOLS = [['pan', '✥ Pan'], ['inspect', '⌖ Inspect'], ['measure', '📏 Measure'], ['box', '▢ Box area'], ['marker', '📍 Markers']]

const fmtLen = (m) => (m >= 1000 ? (m / 1000).toFixed(2) + ' km' : m.toFixed(1) + ' m')
const fmtArea = (a) => (a >= 1e6 ? (a / 1e6).toFixed(3) + ' km²' : a >= 1e4 ? (a / 1e4).toFixed(2) + ' ha' : a.toFixed(0) + ' m²')

export default function Viewer({ height = 520 }) {
  const { data, layer, setLayer, session } = useWorkspace()
  const stageRef = useRef(null)
  const [mode, setMode] = useState('pan')
  const [view, setView] = useState({ z: 1, tx: 0, ty: 0 })
  const [opacity, setOpacity] = useState(85)
  const [size, setSize] = useState({ w: 800, h: height })
  const [measure, setMeasure] = useState([])
  const [markers, setMarkers] = useState([])
  const [box, setBox] = useState(null)
  const [cursor, setCursor] = useState(null)
  const [readout, setReadout] = useState(null)
  const drag = useRef(null)

  const scene = data.scene
  const imgs = data.images || {}
  const iw = scene.analysis_width, ih = scene.analysis_height

  // contain-fit of the image inside the stage (canvas coordinates)
  const fit = Math.min(size.w / iw, size.h / ih)
  const ox = (size.w - iw * fit) / 2, oy = (size.h - ih * fit) / 2
  const toImg = (cx, cy) => ({ x: (cx - ox) / fit, y: (cy - oy) / fit })
  const toCanvas = (x, y) => ({ x: ox + x * fit, y: oy + y * fit })

  useEffect(() => {
    const el = stageRef.current
    const ro = new ResizeObserver(() => setSize({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    setSize({ w: el.clientWidth, h: el.clientHeight })
    return () => ro.disconnect()
  }, [])

  const zoomAt = useCallback((f, px, py) => {
    setView((v) => {
      const z = Math.min(12, Math.max(0.6, v.z * f))
      return { z, tx: px - (px - v.tx) * (z / v.z), ty: py - (py - v.ty) * (z / v.z) }
    })
  }, [])

  useEffect(() => { // non-passive wheel so the page doesn't scroll while zooming
    const el = stageRef.current
    const h = (e) => {
      e.preventDefault()
      const r = el.getBoundingClientRect()
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top)
    }
    el.addEventListener('wheel', h, { passive: false })
    return () => el.removeEventListener('wheel', h)
  }, [zoomAt])

  // pointer → image-space coords, undoing pan/zoom
  const pointerImg = (e) => {
    const r = stageRef.current.getBoundingClientRect()
    const cx = (e.clientX - r.left - view.tx) / view.z
    const cy = (e.clientY - r.top - view.ty) / view.z
    return toImg(cx, cy)
  }
  const inside = (p) => p.x >= 0 && p.y >= 0 && p.x < iw && p.y < ih
  const pxM = () => scene.gsd / (iw / scene.width) // metres per analysis pixel

  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty, moved: 0 }
    if (mode === 'box') { const p = pointerImg(e); setBox({ x0: p.x, y0: p.y, x1: p.x, y1: p.y }) }
  }
  const onMove = (e) => {
    const p = pointerImg(e)
    setCursor(inside(p) ? p : null)
    const d = drag.current
    if (!d) return
    d.moved += Math.abs(e.movementX) + Math.abs(e.movementY)
    if (mode === 'pan') setView((v) => ({ ...v, tx: d.tx + e.clientX - d.x, ty: d.ty + e.clientY - d.y }))
    if (mode === 'box') setBox((b) => b && { ...b, x1: p.x, y1: p.y })
  }
  const onUp = async (e) => {
    const d = drag.current
    drag.current = null
    if (!d) return
    if (mode === 'box' && box) {
      const w = Math.abs(box.x1 - box.x0), h = Math.abs(box.y1 - box.y0)
      const area = w * h * pxM() ** 2
      setReadout({ kind: 'box', rows: [['Box area', <b key="a">{fmtArea(area)}</b>], ['Size', `${w.toFixed(0)}×${h.toFixed(0)} px`], ['Basis', `${(pxM() ** 2).toFixed(1)} m²/px (GSD ${scene.gsd} m)`]] })
      setBox(null)
      return
    }
    if (d.moved > 5) return
    const p = pointerImg(e)
    if (!inside(p)) return
    const x = Math.round(p.x), y = Math.round(p.y)
    if (mode === 'inspect') {
      setReadout({ kind: 'loading' })
      try {
        const r = (await api.inspect(session, x, y)).data
        setReadout({ kind: 'pixel', r })
      } catch (err) { setReadout({ kind: 'error', msg: err.message }) }
    } else if (mode === 'measure') {
      if (measure.length >= 2) { setMeasure([[x, y]]); return }
      const next = [...measure, [x, y]]
      setMeasure(next)
      if (next.length === 2) {
        const [a, b] = next
        const dist = Math.hypot(b[0] - a[0], b[1] - a[1]) * pxM()
        setReadout({ kind: 'measure', rows: [['Measurement', <b key="m">{fmtLen(dist)}</b>], ['Between', `(${a}) and (${b})`], ['Basis', `image-space distance × GSD ${scene.gsd} m/px`]] })
      }
    } else if (mode === 'marker') setMarkers((m) => [...m, [x, y]])
  }

  const setTool = (m) => { setMode(m); setMeasure([]); setBox(null) }
  const reset = () => setView({ z: 1, tx: 0, ty: 0 })
  const layers = Object.keys(LAYER_LABEL).filter((k) => imgs[k])
  const showOverlay = layer !== 'original' && imgs[layer]
  const legend = (data.legend || []).slice(0, 7)
  const ch = data.change
  const snap = () => {
    const src = imgs[layer] || imgs.original
    const ext = /image\/png/.test(src) ? 'png' : 'jpg'
    downloadUrl(src, `satquery-${session}-${layer}.${ext}`)
  }

  const z = view.z
  return (
    <>
      <Card flush className="vwrap">
        <div className="vtools">
          {layers.map((k) => (
            <button key={k} className={`tab ${layer === k ? 'on' : ''}`} onClick={() => setLayer(k)}>{LAYER_LABEL[k]}</button>
          ))}
        </div>
        <div className="vtools sub">
          {TOOLS.map(([m, label]) => (
            <button key={m} className={`vbtn ${mode === m ? 'on' : ''}`} onClick={() => setTool(m)}>{label}</button>
          ))}
          <span className="grow" />
          <button className="vbtn" onClick={() => zoomAt(1.3, size.w / 2, size.h / 2)} aria-label="Zoom in">＋</button>
          <button className="vbtn" onClick={() => zoomAt(1 / 1.3, size.w / 2, size.h / 2)} aria-label="Zoom out">－</button>
          <button className="vbtn" onClick={reset}>Reset</button>
          <button className="vbtn" onClick={() => stageRef.current.requestFullscreen?.()} aria-label="Fullscreen">⛶</button>
          <button className="vbtn" onClick={snap}>📷 Snapshot</button>
          <label className="opac">Overlay <input type="range" min="0" max="100" value={opacity} onChange={(e) => setOpacity(+e.target.value)} /></label>
        </div>

        <div ref={stageRef} className={`vstage ${mode}`} style={{ height }}
          onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => setCursor(null)}>
          <div className="vcanvas" style={{ transform: `translate(${view.tx}px, ${view.ty}px) scale(${z})` }}>
            <img className="lyr" src={imgs.original} alt="Base scene" draggable={false} />
            {showOverlay && <img className="lyr" src={imgs[layer]} alt={LAYER_LABEL[layer]} draggable={false} style={{ opacity: opacity / 100 }} />}
            <svg className="svgov" width={size.w} height={size.h}>
              {measure.map(([x, y], i) => { const p = toCanvas(x, y); return <circle key={i} cx={p.x} cy={p.y} r={6 / z} fill="none" stroke="#6fb4ff" strokeWidth={2.5 / z} /> })}
              {measure.length === 2 && (() => { const a = toCanvas(...measure[0]), b = toCanvas(...measure[1]); return <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#6fb4ff" strokeWidth={2.5 / z} /> })()}
              {markers.map(([x, y], i) => { const p = toCanvas(x, y); return (
                <g key={i}><circle cx={p.x} cy={p.y} r={8 / z} fill="#ffb85c33" stroke="#ffb85c" strokeWidth={2.5 / z} /><text x={p.x + 11 / z} y={p.y - 9 / z} fill="#ffb85c" fontSize={14 / z} fontWeight="700">M{i + 1}</text></g>
              ) })}
              {box && (() => { const a = toCanvas(Math.min(box.x0, box.x1), Math.min(box.y0, box.y1)), b = toCanvas(Math.max(box.x0, box.x1), Math.max(box.y0, box.y1)); return <rect x={a.x} y={a.y} width={b.x - a.x} height={b.y - a.y} fill="#35e0a622" stroke="#35e0a6" strokeWidth={2.5 / z} /> })()}
            </svg>
          </div>

          {legend.length > 0 && layer !== 'original' && (
            <div className="vlegend">
              {legend.map((l) => (<div key={l.label} className="lr"><span className="sw" style={{ background: l.color }} />{l.label} {(l.fraction * 100).toFixed(1)}%</div>))}
            </div>
          )}
          <div className="vhud">
            <Pill tone={data.georeferenced ? 'c' : 'w'}>{data.georeferenced ? 'GEOREFERENCED' : 'IMAGE-SPACE ANALYSIS'}</Pill>
            {ch && <Pill tone="r">Δ {(ch.changed_fraction * 100).toFixed(1)}% · {ch.severity}</Pill>}
          </div>
          <div className="vcoords">{cursor ? `x ${cursor.x.toFixed(0)} · y ${cursor.y.toFixed(0)}` : '—'} · {z.toFixed(1)}×</div>
        </div>
      </Card>

      <Card title="Pixel Inspector / Measurements">
        <Readout readout={readout} markers={markers} clear={() => { setMarkers([]); setReadout(null) }} />
      </Card>
    </>
  )
}

function Readout({ readout, markers, clear }) {
  if (!readout && !markers.length) return <div className="hint nomt">Pick <b>Inspect</b> and click the image for per-pixel values, <b>Measure</b> for distance, <b>Box area</b> to drag an area, or <b>Markers</b> to drop pins. Values come from the live analysis session.</div>
  return (
    <>
      {readout?.kind === 'loading' && <div><Spinner /> reading pixel…</div>}
      {readout?.kind === 'error' && <div className="err nomt">{readout.msg}</div>}
      {readout?.kind === 'pixel' && (() => { const d = readout.r; return (
        <KV rows={[
          ['Pixel', <><b>({d.x}, {d.y})</b> {d.coordinate_space}</>],
          ['RGB', <><span className="swatch" style={{ background: `rgb(${d.rgb})` }} /> {d.rgb.join(', ')}</>],
          [d.veg_index.name, d.veg_index.value],
          [d.water_index.name, d.water_index.value],
          ['Class', <><b>{d.class_label}</b> <Pill>inferred</Pill></>],
          ['Uncertainty', d.uncertainty == null ? 'unavailable' : d.uncertainty],
          ...(d.change ? [['Change', d.change.changed ? <b style={{ color: 'var(--red)' }}>changed (mag {d.change.magnitude})</b> : `unchanged (mag ${d.change.magnitude})`]] : []),
          ['Pixel area', `${d.pixel_area_m2} m²`],
        ]} />) })()}
      {(readout?.kind === 'measure' || readout?.kind === 'box') && <KV rows={readout.rows} />}
      {markers.length > 0 && (
        <div className="hint">Markers: {markers.map((p, i) => `M${i + 1} (${p[0]}, ${p[1]})`).join(' · ')} — image-space coordinates. <button className="linkbtn" onClick={clear}>Clear markers</button></div>
      )}
    </>
  )
}
