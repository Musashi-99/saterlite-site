import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useWorkspace } from '../../context/WorkspaceContext'
import { Btn, Card, Empty, KV } from '../../components/common/ui'
import EarthCanvas from '../../components/landing/EarthCanvas'
import SmartImage from '../../components/common/SmartImage'
import { ASSETS } from '../../lib/assets'

const QUICK = [
  ['/app/analyze', '⬆', 'Analyze', 'Upload a scene or a T1/T2 pair'],
  ['/app/landcover', '▣', 'Land cover', 'Classes, areas, cluster signatures'],
  ['/app/change', '⚡', 'Change detection', 'Hotspots, transitions, severity'],
  ['/app/spectral', '≋', 'Spectral indices', 'NDVI, water & built-up indices'],
  ['/app/objects', '◎', 'Objects', 'Vessels, roads, water bodies'],
  ['/app/reports', '▤', 'Reports & JSON', 'Export HTML and machine-readable JSON'],
]

export default function Overview() {
  const { meta, data, session, runSample, loadMeta, busy } = useWorkspace()
  const nav = useNavigate()
  const [history, setHistory] = useState(null)

  useEffect(() => {
    loadMeta()
    api.history().then((r) => setHistory(r.data.records || [])).catch(() => setHistory([]))
  }, [loadMeta])

  const open = async (...names) => { try { await runSample(...names); nav('/app/analyze') } catch { /* toasted */ } }
  const v = meta.version
  const stats = [
    ['◈', v ? `v${v.version}` : '—', 'Product version', 'accent'],
    ['⇄', meta.health?.sessions ?? '—', 'Active sessions', 'green'],
    ['▦', data ? data.scene.name : 'None loaded', 'Current scene', 'amber'],
    ['◷', data ? `${data.ms} ms` : '—', 'Last analysis time', 'accent'],
  ]

  return (
    <div className="page">
      <section className="banner">
        <EarthCanvas variant="hero" />
        <SmartImage src={ASSETS.hero.src} minWidth={ASSETS.hero.minWidth} className="banner-photo" position="center 60%" priority />
        <div className="banner-shade" />
        <div className="banner-copy">
          <span className="eyebrow">{meta.online === false ? '● backend offline' : '● system online'}</span>
          <h1>Workspace overview</h1>
          <p>Ask questions of satellite imagery and get answers backed by measured evidence.</p>
          <div className="btnrow">
            <Btn to="/app/analyze" variant="primary">Analyze a scene</Btn>
            <Btn onClick={() => open('delta_t1.png', 'delta_t2.png')} disabled={busy}>Load demo pair</Btn>
          </div>
        </div>
        <SmartImage src={ASSETS.satellite.src} className="banner-sat" alt="" />
      </section>

      {meta.online === false && <div className="err">Backend unreachable. Start it with <code>python -m uvicorn app:app --port 8000</code> inside SatQuery-AI/, then reload.</div>}

      <div className="grid4">
        {stats.map(([ic, val, label, tone]) => (
          <div className={`stat ${tone}`} key={label}>
            <span className="ic">{ic}</span>
            <div className="v">{val}</div>
            <div className="l">{label}</div>
          </div>
        ))}
      </div>

      <div className="quick">
        {QUICK.map(([to, ic, t, d]) => (
          <Link key={to} to={to} className="qtile">
            <span className="qic">{ic}</span>
            <b>{t}</b>
            <small>{d}</small>
            <i aria-hidden>→</i>
          </Link>
        ))}
      </div>

      <div className="grid2">
        <Card title="Recent analyses" aside={<Link to="/app/history" className="more">View all ›</Link>}>
          {history == null ? <Empty>Loading…</Empty> : history.length ? history.slice(0, 5).map((r) => (
            <div className="listrow" key={r.analysis_id}>
              <b>{r.label || r.analysis_id}</b>
              <span>{new Date(r.timestamp * 1000).toLocaleString()} · {r.duration_ms} ms · {r.n_queries} queries · pipeline {r.versions?.pipeline || '—'}</span>
            </div>
          )) : <Empty>No analyses yet — history is empty.</Empty>}
        </Card>
        <Card title="Available scenes" aside={<Link to="/app/scenes" className="more">Library ›</Link>}>
          {meta.samples.length ? meta.samples.slice(0, 4).map((s) => (
            <button className="listrow link" key={s.name} onClick={() => open(s.name)} disabled={busy}>
              <span className="thumbwrap"><img src={s.url} alt="" loading="lazy" /></span>
              <b className="grow">{s.title}</b>
              <span>{s.width || ''}×{s.height || ''}</span>
            </button>
          )) : <Empty>No samples found.</Empty>}
          <div className="btnrow top"><Btn size="sm" arrow={false} variant="primary" onClick={() => open('delta_t1.png', 'delta_t2.png')} disabled={busy}>Load bi-temporal demo</Btn></div>
        </Card>
      </div>

      <Card title="Processing status">
        {data ? (
          <KV rows={[
            ['Session', <code key="s">{session}</code>],
            ['Stages', Object.entries(data.stages || {}).map(([k, val]) => `${k}: ${val} ms`).join(' · ') || '—'],
            ['Evidence', `${data.evidence_count || 0} items seeded`],
            ['Quality', data.quality?.label || '—'],
          ]} />
        ) : <Empty>Idle — no processing running. Analyze a scene to populate this dashboard.</Empty>}
      </Card>
    </div>
  )
}
