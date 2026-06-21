'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { UploadCloud, Loader2, Sparkles, FileSpreadsheet, ArrowRight, AlertCircle, CheckCircle2, X, CalendarPlus, ImageIcon } from 'lucide-react'
import BrandSelector from '@/components/shared/BrandSelector'
import { useDefaultBrand } from '@/components/shared/DefaultBrandProvider'
import type { BrandId } from '@/lib/brands'
import PlanResultCard, { type PlanResult, type ImageState } from './PlanResultCard'
import type { PlanRow } from '@/lib/plan-parse'
import {
  CAPTION_MODELS, IMAGE_STYLES, DEFAULT_CAPTION_MODEL, DEFAULT_IMAGE_STYLE,
  type CaptionModelId, type ImageStyleId, type ContentDefaults,
} from '@/lib/content-plan-options'

const ACCEPT = '.xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv'

// Image generation is rate-limited to 10/min per user (cost guard). Batch image
// runs pace their starts just under that so they never hit a 429.
const GEN_RATE_PER_MIN = 10
const GEN_INTERVAL_MS  = Math.ceil(60_000 / GEN_RATE_PER_MIN) + 400  // ~6.4s between starts
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
const fmtEta = (n: number) => {
  const secs = Math.ceil((n * GEN_INTERVAL_MS) / 1000)
  return secs < 90 ? `~${secs}s` : `~${Math.ceil(secs / 60)} min`
}

// Brand colors described by NAME (never hex) so the design model uses the palette
// without rendering color codes as text on the graphic.
const BRAND_PALETTE: Record<string, string> = {
  lhcapital: 'deep navy background with bright azure-blue and a warm orange accent',
  simrp:     'slate-blue background with teal accents',
  espa:      'deep navy background with emerald-green and a warm orange accent',
  personal:  'deep navy background with a fresh green accent',
}

// The post's essence = the polished opening line of the generated caption, not the
// raw plan hook. Skips markdown headers / bracketed directives.
function headlineFromBody(body: string | undefined, fallback: string): string {
  for (const raw of (body ?? '').split('\n')) {
    const l = raw.trim()
    if (!l || l.startsWith('#') || l.startsWith('---') || l.startsWith('[') || /^\*\*\[/.test(l)) continue
    // Strip markdown + all quotes (inner quotes garble the design model) and cap length.
    const clean = l.replace(/[*_`>#"'“”]/g, '').replace(/\s+/g, ' ').trim()
    if (clean.length >= 8) return clean.slice(0, 80)
  }
  return (fallback || '').slice(0, 90)
}

export default function PlanClient() {
  const [brandId,    setBrandId]    = useState<BrandId>(useDefaultBrand())
  const [rows,       setRows]       = useState<PlanRow[] | null>(null)
  const [fileName,   setFileName]   = useState('')
  const [parsing,    setParsing]    = useState(false)
  const [generating, setGenerating] = useState(false)
  const [results,    setResults]    = useState<PlanResult[] | null>(null)
  const [error,      setError]      = useState('')
  const [dragOver,   setDragOver]   = useState(false)
  const [startDate,  setStartDate]  = useState(() => new Date().toISOString().slice(0, 10))
  const [scheduling, setScheduling] = useState(false)
  const [scheduleMsg, setScheduleMsg] = useState<string | null>(null)
  const [images,     setImages]     = useState<Record<number, ImageState>>({})
  const [batchImg,   setBatchImg]   = useState(false)
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null)
  const [confirmBatch,  setConfirmBatch]  = useState<{ count: number } | null>(null)
  const [imageStyle,    setImageStyle]    = useState<ImageStyleId>(DEFAULT_IMAGE_STYLE)
  const [captionModel,  setCaptionModel]  = useState<CaptionModelId>(DEFAULT_CAPTION_MODEL)
  const [brandDefaults, setBrandDefaults] = useState<Record<string, ContentDefaults>>({})
  const fileRef = useRef<HTMLInputElement>(null)

  // Per-brand defaults are set once per account in Brand Vault. Load them, then
  // apply the selected brand's defaults whenever the brand changes (or on load).
  useEffect(() => {
    fetch('/api/v1/brands').then((r) => r.json()).then((j) => { if (j?.defaults) setBrandDefaults(j.defaults) }).catch(() => {})
  }, [])

  useEffect(() => {
    const d = brandDefaults[brandId]
    if (d?.captionModel) setCaptionModel(d.captionModel)
    if (d?.imageStyle)   setImageStyle(d.imageStyle)
  }, [brandId, brandDefaults])

  async function genImage(result: PlanResult, attempt = 0): Promise<void> {
    if (!result.ok) return
    setImages((p) => ({ ...p, [result.idx]: { state: 'loading' } }))
    const style = IMAGE_STYLES[imageStyle]
    let prompt: string
    if (style.mode === 'design') {
      // Designed editorial card — render the post's essence (polished caption opener)
      // as one headline. Text-capable models (Recraft/Ideogram) keep it legible.
      const headline = headlineFromBody(result.body, rows?.[result.idx]?.hook ?? result.theme ?? '')
      const palette  = BRAND_PALETTE[brandId] ?? 'professional modern color palette'
      prompt = `Minimalist flat editorial graphic design, solid ${palette}. NO decoration, NO illustrations, NO photo, NO poster mockup, NO real-world scene — a flat 2D digital graphic that fills the whole frame. ONE large bold modern sans-serif headline reading exactly: "${headline}". Generous negative space, strong typographic hierarchy, premium minimal design. Render ONLY this headline text — no other words, no hex codes, no labels, no logos, no stray numbers. Crisp, correctly spelled, legible.`
    } else {
      // Photographic visual to PAIR with the caption — explicitly text-free.
      const concept = [result.theme, result.audience].filter(Boolean).join(', ') || 'professional business and employee benefits'
      prompt = `Clean, modern, professional marketing photograph representing ${concept}. Photographic, well-lit, uncluttered, brand-appropriate. Absolutely no text, no words, no letters, no typography, no charts, no logos.`
    }
    try {
      const res  = await fetch('/api/v1/generate/image', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: style.model, aspectRatio: '1:1', variations: 1, brandId, appendBrandStyle: style.mode !== 'design' }),
      })
      if (res.status === 429 && attempt < 3) {
        const retryAfter = Number(res.headers.get('Retry-After')) || 20
        await sleep(Math.min(retryAfter, 65) * 1000)
        return genImage(result, attempt + 1)
      }
      const json = await res.json().catch(() => ({}))
      if (!res.ok || !json.assets?.[0]?.url) {
        const error = res.status === 429
          ? 'Rate limit — wait ~1 min, then retry (10 images/min).'
          : (json.message ?? 'Generation failed.')
        setImages((p) => ({ ...p, [result.idx]: { state: 'error', error } })); return
      }
      setImages((p) => ({ ...p, [result.idx]: { state: 'idle', url: json.assets[0].url as string } }))
    } catch { setImages((p) => ({ ...p, [result.idx]: { state: 'error', error: 'Network error — please retry.' } })) }
  }

  // Larger batches first confirm via an in-app notice (with ETA); smaller ones run directly.
  function genAllImages() {
    if (!results) return
    const pending = results.filter((r) => r.ok && !images[r.idx]?.url)
    if (!pending.length) return
    if (pending.length > GEN_RATE_PER_MIN) { setConfirmBatch({ count: pending.length }); return }
    runBatch(pending)
  }

  function startConfirmedBatch() {
    setConfirmBatch(null)
    if (!results) return
    const pending = results.filter((r) => r.ok && !images[r.idx]?.url)
    if (pending.length) runBatch(pending)
  }

  // Generate an image for every pending post — paced to stay under the 10/min
  // limit, with live progress and per-image 429 retry.
  async function runBatch(pending: PlanResult[]) {
    setBatchImg(true)
    setBatchProgress({ done: 0, total: pending.length })
    const tasks: Promise<void>[] = []
    for (let i = 0; i < pending.length; i++) {
      tasks.push(genImage(pending[i]).then(() => setBatchProgress((p) => (p ? { ...p, done: p.done + 1 } : p))))
      if (i < pending.length - 1) await sleep(GEN_INTERVAL_MS)   // pace starts under the limit
    }
    await Promise.all(tasks)
    setBatchImg(false)
    setBatchProgress(null)
  }

  async function scheduleDrafts() {
    if (!results) return
    const items = results.filter((r) => r.ok && r.body).map((r) => ({ assetId: r.assetId ?? undefined, day: r.day ?? undefined, platform: r.platform, body: r.body! }))
    if (!items.length) return
    setScheduling(true); setScheduleMsg(null)
    try {
      const res  = await fetch('/api/v1/plan/schedule', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, items }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setScheduleMsg(json.message ?? 'Failed to schedule drafts.'); return }
      const miss = json.missingPlatforms?.length ? ` (skipped ${json.skipped} — no connected account for ${json.missingPlatforms.join(', ')})` : ''
      setScheduleMsg(`Created ${json.created} draft post${json.created === 1 ? '' : 's'}${miss}.`)
    } catch { setScheduleMsg('Failed to schedule drafts.') } finally { setScheduling(false) }
  }

  async function handleFile(file: File) {
    setError(''); setResults(null); setRows(null); setParsing(true); setFileName(file.name)
    try {
      const body = new FormData(); body.append('file', file)
      const res  = await fetch('/api/v1/plan/parse', { method: 'POST', body })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.message ?? 'Could not read this plan.'); return }
      setRows(json.rows as PlanRow[])
    } catch { setError('Could not read this plan.') } finally { setParsing(false) }
  }

  async function generate() {
    if (!rows) return
    setGenerating(true); setError('')
    try {
      const res  = await fetch('/api/v1/plan/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, model: captionModel, rows }),
      })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) { setError(json.message ?? 'Generation failed.'); return }
      setResults(json.results as PlanResult[])
    } catch { setError('Generation failed.') } finally { setGenerating(false) }
  }

  function reset() { setRows(null); setResults(null); setFileName(''); setError(''); setImages({}); setScheduleMsg(null) }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* In-app batch-image notice (replaces the native confirm dialog) */}
      {confirmBatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmBatch(null)}>
          <div className="w-full max-w-sm bg-white rounded-card shadow-card-hover p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-2">
              <ImageIcon size={16} className="text-brand-azure" />
              <p className="font-semibold text-brand-navy text-sm">Generate {confirmBatch.count} images</p>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">
              Image generation is paced to the <strong>10/min</strong> limit, so this takes about <strong>{fmtEta(confirmBatch.count)}</strong>. <strong>Keep this page open</strong> while they generate — they&apos;ll fill in as they finish.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button type="button" onClick={() => setConfirmBatch(null)}
                className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
              <button type="button" onClick={startConfirmedBatch}
                className="px-4 py-2 text-xs font-semibold bg-brand-azure hover:bg-brand-navy text-white rounded-lg transition-colors">Start</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4 flex-wrap">
        <BrandSelector value={brandId} onChange={setBrandId} />
        <label className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Caption model</span>
          <select value={captionModel} onChange={(e) => setCaptionModel(e.target.value as CaptionModelId)}
            className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-azure/30">
            {CAPTION_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
      </div>

      {/* Drop zone */}
      {!rows && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f) }}
          onClick={() => fileRef.current?.click()}
          className={`cursor-pointer border-2 border-dashed rounded-card p-12 text-center transition-colors ${dragOver ? 'border-brand-azure bg-brand-azure/5' : 'border-gray-300 hover:border-brand-azure'}`}
        >
          {parsing ? (
            <div className="flex flex-col items-center gap-2 text-brand-azure">
              <Loader2 size={28} className="animate-spin" /><p className="text-sm font-medium">Reading {fileName}…</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-brand-azure/10 flex items-center justify-center"><UploadCloud size={26} className="text-brand-azure" /></div>
              <p className="font-semibold text-brand-navy">Drop a content plan to generate every post</p>
              <p className="text-sm text-gray-400">Excel (.xlsx) or CSV with columns like Day, Audience, Theme, Platform, Hook/Headline, Post Copy, CTA</p>
            </div>
          )}
          <input ref={fileRef} type="file" accept={ACCEPT} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />
        </div>
      )}

      {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={13} /> {error}</p>}

      {/* Parsed preview */}
      {rows && !results && (
        <div className="bg-white rounded-card shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-brand-navy flex items-center gap-2"><FileSpreadsheet size={15} className="text-brand-azure" />{fileName} · <span className="text-gray-400">{rows.length} posts</span></p>
            <button type="button" onClick={reset} className="text-gray-400 hover:text-gray-600"><X size={14} /></button>
          </div>
          <div className="max-h-72 overflow-y-auto border border-gray-100 rounded-lg">
            <table className="w-full text-[11px]">
              <thead className="bg-gray-50 text-gray-500 sticky top-0">
                <tr>{['Day', 'Audience', 'Theme', 'Platform', 'Hook'].map((h) => <th key={h} className="text-left font-semibold px-2 py-1.5">{h}</th>)}</tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} className="border-t border-gray-50">
                    <td className="px-2 py-1.5 text-gray-500">{r.day ?? '—'}</td>
                    <td className="px-2 py-1.5 text-gray-700">{r.audience ?? '—'}</td>
                    <td className="px-2 py-1.5 text-gray-700">{r.theme ?? '—'}</td>
                    <td className="px-2 py-1.5 text-gray-500">{r.platforms ?? '—'}</td>
                    <td className="px-2 py-1.5 text-gray-700 truncate max-w-[16rem]">{r.hook ?? r.copy ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={generate} disabled={generating}
            className="mt-4 flex items-center gap-2 bg-brand-azure text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-60">
            {generating ? <><Loader2 size={15} className="animate-spin" />Generating {rows.length} captions…</> : <><Sparkles size={15} />Generate {rows.length} captions</>}
          </button>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-4">
          <div className={`flex items-center justify-between gap-3 rounded-card px-3 py-2 ${results.every((r) => r.assetId) ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
            <p className={`flex items-center gap-1.5 text-xs font-medium ${results.every((r) => r.assetId) ? 'text-green-700' : 'text-amber-700'}`}>
              {results.every((r) => r.assetId) ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />} Generated {results.filter((r) => r.ok).length} of {results.length} — {results.every((r) => r.assetId) ? 'all' : `${results.filter((r) => r.assetId).length} of ${results.length}`} saved to your Library.
            </p>
            <div className="flex items-center gap-3">
              <select value={imageStyle} onChange={(e) => setImageStyle(e.target.value as ImageStyleId)} title="Image style / model"
                className="text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-azure/30">
                {(Object.keys(IMAGE_STYLES) as ImageStyleId[]).map((k) => (
                  <option key={k} value={k}>{IMAGE_STYLES[k].label}</option>
                ))}
              </select>
              <button type="button" onClick={genAllImages} disabled={batchImg}
                className="flex items-center gap-1 text-xs font-semibold text-brand-azure hover:underline disabled:opacity-60 whitespace-nowrap">
                {batchImg
                  ? <><Loader2 size={11} className="animate-spin" />{batchProgress ? `Generating ${batchProgress.done}/${batchProgress.total} · ${fmtEta(batchProgress.total - batchProgress.done)} left` : 'Generating images…'}</>
                  : <><ImageIcon size={11} />Generate all images</>}
              </button>
              <button type="button" onClick={reset} className="text-xs font-semibold text-gray-500 hover:text-gray-700">New plan</button>
              <Link href="/library?type=CAPTION" className="flex items-center gap-1 text-xs font-semibold text-green-700 hover:underline whitespace-nowrap">View Library <ArrowRight size={12} /></Link>
            </div>
          </div>

          {/* Schedule as drafts */}
          <div className="flex flex-wrap items-center gap-3 bg-white rounded-card shadow-card px-3 py-2.5">
            <CalendarPlus size={15} className="text-brand-azure flex-shrink-0" />
            <span className="text-xs text-gray-600">Schedule these as drafts starting</span>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-brand-azure/30" />
            <button type="button" onClick={scheduleDrafts} disabled={scheduling}
              className="flex items-center gap-1.5 text-xs font-semibold text-white bg-brand-azure hover:bg-brand-navy px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
              {scheduling ? <><Loader2 size={12} className="animate-spin" />Scheduling…</> : 'Schedule drafts'}
            </button>
            {scheduleMsg && (
              <span className="flex items-center gap-2 text-xs text-gray-600">
                {scheduleMsg}
                <Link href="/scheduler" className="font-semibold text-brand-azure hover:underline whitespace-nowrap">Open Scheduler <ArrowRight size={11} className="inline" /></Link>
              </span>
            )}
          </div>
          <p className="text-[11px] text-gray-400 -mt-1">Drafts are dated by each row’s Day number and won’t publish until you review and schedule them.</p>

          {results.map((r) => <PlanResultCard key={r.idx} result={r} image={images[r.idx]} onGenerateImage={() => genImage(r)} />)}
        </div>
      )}
    </div>
  )
}
