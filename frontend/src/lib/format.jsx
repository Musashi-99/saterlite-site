import { Fragment } from 'react'

// Minimal, XSS-safe markdown for backend answers: **bold**, `code`, "- " bullets, newlines.
export function Md({ text }) {
  const lines = String(text ?? '').split('\n')
  return lines.map((line, i) => {
    const bullet = /^- /.test(line)
    const body = bullet ? line.slice(2) : line
    const parts = body.split(/(\*\*.+?\*\*|`.+?`)/g).filter(Boolean).map((p, j) => {
      if (p.startsWith('**')) return <b key={j}>{p.slice(2, -2)}</b>
      if (p.startsWith('`')) return <code key={j}>{p.slice(1, -1)}</code>
      return <Fragment key={j}>{p}</Fragment>
    })
    return <Fragment key={i}>{bullet ? '• ' : ''}{parts}{i < lines.length - 1 && <br />}</Fragment>
  })
}

export const pct = (f, d = 1) => (f == null ? '—' : (f * 100).toFixed(d) + '%')

export function downloadBlob(content, filename, type) {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function downloadUrl(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
}
