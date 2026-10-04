import { useEffect, useRef, useState } from 'react'

/**
 * Image that never looks blurry: it renders at natural resolution (no CSS scale-up),
 * and if the file is missing or below `minWidth` it swaps to `fallback`.
 */
export default function SmartImage({ src, alt = '', minWidth = 0, fallback = null, className = '', style, priority = false, position = 'center' }) {
  const [state, setState] = useState('loading') // loading | ok | bad
  const ref = useRef(null)
  const onLoad = (e) => {
    const w = e.currentTarget.naturalWidth
    if (minWidth && w < minWidth) {
      console.warn(`[SmartImage] ${src} is ${w}px wide, needs ≥${minWidth}px — using fallback.`)
      setState('bad')
    } else setState('ok')
  }
  // Cached images can finish loading before onLoad is attached - check on mount.
  useEffect(() => {
    const el = ref.current
    if (el && el.complete) { if (el.naturalWidth) onLoad({ currentTarget: el }); else setState('bad') }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])
  return (
    <>
      {state !== 'bad' && (
        <img
          ref={ref}
          src={src}
          alt={alt}
          className={className}
          style={{ ...style, objectFit: 'cover', objectPosition: position, opacity: state === 'ok' ? 1 : 0, transition: 'opacity .6s' }}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={priority ? 'high' : undefined}
          onLoad={onLoad}
          onError={() => setState('bad')}
        />
      )}
      {state === 'bad' && fallback}
    </>
  )
}
