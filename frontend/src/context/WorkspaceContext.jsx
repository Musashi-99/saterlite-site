import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { api, analysisForm } from '../api/client'

const Ctx = createContext(null)
export const useWorkspace = () => useContext(Ctx)

const DEFAULTS = { gsd: 10, k: 7, adaptive: false, sensor: '', mode: 'auto' }

export function WorkspaceProvider({ children }) {
  const [meta, setMeta] = useState({ version: null, samples: [], providers: [], sensors: [], health: null, online: null })
  const [settings, setSettings] = useState(DEFAULTS)
  const [data, setData] = useState(null) // full /api/analyze response
  const [layer, setLayer] = useState('original')
  const [evidence, setEvidence] = useState({ evidence: [], queries: [] })
  const [messages, setMessages] = useState([])
  const [explain, setExplain] = useState(false)
  const [busy, setBusy] = useState(false)
  const [asking, setAsking] = useState(false)
  const [toasts, setToasts] = useState([])
  const toastId = useRef(0)

  const toast = useCallback((text) => {
    const id = ++toastId.current
    setToasts((t) => [...t, { id, text }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600)
  }, [])

  const loadMeta = useCallback(async () => {
    const pick = async (fn, sel, fallback) => {
      try { return sel(await fn()) } catch { return fallback }
    }
    const [version, samples, providers, sensors, health] = await Promise.all([
      pick(api.version, (r) => r.data, null),
      pick(api.samples, (r) => r.samples || [], []),
      pick(api.providers, (r) => r.data.providers || [], []),
      pick(api.sensors, (r) => r.data.sensors || [], []),
      pick(api.health, (r) => r, null),
    ])
    setMeta({ version, samples, providers, sensors, health, online: !!(version || health) })
  }, [])

  useEffect(() => { loadMeta() }, [loadMeta])

  const refreshEvidence = useCallback(async (session) => {
    if (!session) return
    try {
      const r = (await api.evidence(session)).data
      setEvidence({ evidence: r.evidence || [], queries: r.queries || [] })
    } catch { /* evidence is optional */ }
  }, [])

  const onNewSession = useCallback((d) => {
    setData(d)
    setLayer(d.images?.fusion ? 'fusion' : d.images?.landcover ? 'landcover' : 'original')
    setEvidence({ evidence: [], queries: [] })
    const top = (d.legend || []).slice(0, 3).map((l) => `${l.label} ${(l.fraction * 100).toFixed(1)}%`).join(', ')
    const c = d.counts || {}
    let text = `**Scene ingested and analysed in ${d.ms} ms.**\n\nFootprint **${d.scene.area_km2.toFixed(2)} km²** at ${d.scene.gsd} m GSD. Dominant cover: ${top}.\n\nDetected: ${c.water_regions ?? 0} water bodies, ${c.vessels ?? 0} probable vessels, ${c.linear ?? 0} linear structures, ${c.bright_targets ?? 0} bright targets.`
    if (d.change) text += `\n\n**Bi-temporal pair loaded** — ${(d.change.changed_fraction * 100).toFixed(1)}% changed (severity ${d.change.severity}). Ask what changed.`
    if (d.sar) text += `\n\n**Optical-SAR pair loaded** — SAR water proxy ${(d.sar.water_fraction * 100).toFixed(1)}%, built-up proxy ${(d.sar.built_fraction * 100).toFixed(1)}%.`
    text += '\n\nAsk a question below, or pick a suggestion.'
    setMessages([{ id: 'brief', role: 'ai', text, meta: { intent: 'auto-brief' } }])
    refreshEvidence(d.session)
  }, [refreshEvidence])

  const run = useCallback(async (call, label) => {
    setBusy(true)
    if (label) toast(label)
    try {
      const d = await call()
      onNewSession(d)
      return d
    } finally {
      setBusy(false)
    }
  }, [onNewSession, toast])

  const runSample = useCallback((sample, sample2) =>
    run(() => api.analyzeSample(analysisForm({ sample, sample2, settings })), `Analyzing ${sample}${sample2 ? ' + ' + sample2 : ''}…`)
      .catch((e) => { toast('Analysis failed: ' + e.message); throw e }),
  [run, settings, toast])

  const runUpload = useCallback((args) =>
    run(() => (args.sample
      ? api.analyzeSample(analysisForm({ ...args, settings }))
      : api.analyze(analysisForm({ ...args, settings, mode: settings.mode }))), null),
  [run, settings])

  const reproduce = useCallback((id) =>
    run(() => api.historyReproduce(id), `Reproducing ${id}…`).then((d) => { toast('Reproduced from ' + id); return d }),
  [run, toast])

  const ask = useCallback(async (query) => {
    const q = query.trim()
    if (!q || !data) return
    const id = Date.now()
    setMessages((m) => [...m, { id, role: 'me', text: q }])
    setAsking(true)
    try {
      let msg
      if (explain) {
        const r = (await api.explain(data.session, q)).data
        msg = { text: r.answer, overlay: r.overlay_image, meta: { intent: r.intent, plan: r.plan, steps: r.steps, reasoning: r.reasoning, evidence_v2: r.evidence_v2, confidence: r.confidence, ms: r.ms, trace: r.trace } }
      } else {
        const r = await api.query(data.session, q)
        msg = { text: r.answer, overlay: r.overlay_image, meta: { intent: r.intent, plan: r.plan, entities: r.entities, objects: r.objects, evidence: r.evidence, evidence_v2: r.evidence_v2, confidence: r.confidence, ms: r.ms, trace: r.trace } }
      }
      setMessages((m) => [...m, { id: id + 1, role: 'ai', ...msg }])
      if (msg.overlay) {
        setData((d) => ({ ...d, images: { ...d.images, answer: msg.overlay } }))
        setLayer('answer')
      }
      refreshEvidence(data.session)
    } catch (e) {
      setMessages((m) => [...m, { id: id + 1, role: 'ai', text: '⚠️ ' + e.message, meta: { intent: 'error' } }])
    } finally {
      setAsking(false)
    }
  }, [data, explain, refreshEvidence])

  const value = useMemo(() => ({
    meta, loadMeta, settings, setSettings, data, layer, setLayer, evidence, refreshEvidence,
    messages, explain, setExplain, busy, asking, ask, runSample, runUpload, reproduce,
    toast, toasts, session: data?.session || null,
  }), [meta, loadMeta, settings, data, layer, evidence, refreshEvidence, messages, explain, busy, asking, ask, runSample, runUpload, reproduce, toast, toasts])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
