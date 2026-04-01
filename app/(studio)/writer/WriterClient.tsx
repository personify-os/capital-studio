'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PenSquare, AlertCircle, Copy, Check, Sparkles, Link, FileText, X, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import ContentIntentPanel from './ContentIntentPanel'
import StructuredDataEntry from './StructuredDataEntry'
import { EMPTY_INTENT, getGenerationMode } from '@/lib/content-intent'
import type { ContentIntent } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'

// ─── Types ────────────────────────────────────────────────────────────────────

type ContentType = 'caption' | 'series'
type Platform    = 'instagram' | 'facebook' | 'linkedin' | 'x' | 'youtube' | 'tiktok' | 'threads'
type Tone        = 'professional' | 'casual' | 'inspirational' | 'educational'
type SeriesCount = 3 | 5 | 10

interface CaptionResponse { caption?: string; captions?: string[] }

interface PlatformResult { platform: Platform; captions: string[] }

const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin',  label: 'LinkedIn' },
  { value: 'facebook',  label: 'Facebook' },
  { value: 'x',         label: 'X (Twitter)' },
  { value: 'youtube',   label: 'YouTube' },
  { value: 'tiktok',    label: 'TikTok' },
  { value: 'threads',   label: 'Threads' },
]

const PLATFORM_LABEL = Object.fromEntries(PLATFORMS.map((p) => [p.value, p.label])) as Record<Platform, string>

const TONES: { value: Tone; label: string }[] = [
  { value: 'professional',  label: 'Professional' },
  { value: 'educational',   label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'casual',        label: 'Casual' },
]

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, color = 'bg-brand-azure' }: { checked: boolean; onChange: (v: boolean) => void; color?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative flex-shrink-0 w-9 h-5 rounded-full transition-colors',
        checked ? color : 'bg-gray-300',
      )}
    >
      <span className={cn(
        'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-[left] duration-200',
        checked ? 'left-4' : 'left-0.5',
      )} />
    </button>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WriterClient() {
  const router = useRouter()
  const [contentType,      setContentType]      = useState<ContentType>('caption')
  const [brandId,          setBrandId]          = useState<BrandId>('lhcapital')
  const [intent,           setIntent]           = useState<ContentIntent>(EMPTY_INTENT)
  const [topic,            setTopic]            = useState('')
  const [platforms,        setPlatforms]        = useState<Platform[]>([])
  const [tone,             setTone]             = useState<Tone>('professional')
  const [seriesCount,      setSeriesCount]      = useState<SeriesCount>(3)
  const [includeHashtags,  setIncludeHashtags]  = useState(true)
  const [referenceContent, setReferenceContent] = useState('')
  const [referenceUrl,     setReferenceUrl]     = useState('')
  const [fileName,         setFileName]         = useState('')
  const [copied,           setCopied]           = useState<string | number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)
  const [results, setResults] = useState<PlatformResult[]>([])

  // Clear post details when switching between structured and freeform modes
  const prevMode = useRef(getGenerationMode(intent.tier2Id))
  useEffect(() => {
    const mode = getGenerationMode(intent.tier2Id)
    if (mode !== prevMode.current) {
      setTopic('')
      prevMode.current = mode
    }
  }, [intent.tier2Id])

  function togglePlatform(p: Platform) {
    setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      setReferenceContent(text?.slice(0, 4000) ?? '')
    }
    reader.readAsText(file)
  }

  function clearFile() {
    setFileName('')
    setReferenceContent('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleGenerate = useCallback(async () => {
    if (platforms.length === 0) return
    setLoading(true)
    setError(null)
    setResults([])

    const makePayload = (platform: Platform) => ({
      platform,
      tone,
      topic:              topic.trim() || undefined,
      brandId,
      includeHashtags,
      seriesCount:        contentType === 'series' ? seriesCount : 1,
      referenceContent:   referenceContent.trim() || undefined,
      referenceUrl:       referenceUrl.trim() || undefined,
      intentTier1Id:      intent.tier1Id      ?? undefined,
      intentTier2Id:      intent.tier2Id      ?? undefined,
      intentPurposeId:    intent.purposeId    ?? undefined,
      intentCtaId:        intent.ctaId        ?? undefined,
      intentCustomCta:    intent.customCta    ?? undefined,
      intentCtaPlacement: intent.ctaPlacement ?? undefined,
    })

    try {
      const responses = await Promise.all(
        platforms.map(async (p) => {
          const res = await fetch('/api/v1/generate/caption', {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(makePayload(p)),
          })
          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body.message ?? 'Generation failed.')
          }
          const data: CaptionResponse = await res.json()
          return { platform: p, captions: data.captions ?? (data.caption ? [data.caption] : []) }
        })
      )
      setResults(responses)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }, [topic, platforms, tone, brandId, includeHashtags, contentType, seriesCount, referenceContent, referenceUrl, intent])

  function copy(text: string, key: string | number) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function sendToScheduler(text: string, platform: Platform) {
    localStorage.setItem('schedulerDraft', JSON.stringify({ caption: text, platform }))
    router.push('/scheduler')
  }

  const canGenerate = platforms.length > 0 && (topic.trim().length > 0 || !!intent.tier1Id)

  return (
    <div className="flex bg-app-bg">
      {/* ── Left: controls ─────────────────────────────────────────── */}
      <div className="w-[380px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-5 border-r border-gray-100 bg-white">
        <div className="space-y-5">

          {/* Content type */}
          <div className="bg-gray-50 rounded-card p-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Content Type</p>
            <div className="flex gap-2">
              {(['caption', 'series'] as ContentType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setContentType(t)}
                  className={cn(
                    'flex-1 py-2 rounded-lg text-xs font-semibold border-2 capitalize transition-all',
                    contentType === t
                      ? 'border-brand-azure bg-brand-azure text-white'
                      : 'border-gray-200 text-gray-600 hover:border-brand-azure hover:text-brand-azure',
                  )}
                >
                  {t === 'series' ? 'Content Series' : 'Single Caption'}
                </button>
              ))}
            </div>
            {contentType === 'series' && (
              <div className="flex gap-2 mt-3">
                <p className="text-xs text-gray-500 self-center mr-1">Series of:</p>
                {([3, 5, 10] as SeriesCount[]).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setSeriesCount(n)}
                    className={cn(
                      'w-10 h-8 rounded-lg text-sm font-semibold border-2 transition-colors',
                      seriesCount === n
                        ? 'bg-brand-navy text-white border-brand-navy'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy',
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Brand */}
          <div className="bg-gray-50 rounded-card p-4">
            <BrandSelector value={brandId} onChange={setBrandId} />
          </div>

          {/* Content Intent */}
          <ContentIntentPanel value={intent} onChange={setIntent} />

          {/* Post Details — structured form or freeform textarea */}
          {getGenerationMode(intent.tier2Id) === 'structured' && intent.tier2Id ? (
            <StructuredDataEntry tier2Id={intent.tier2Id} onChange={setTopic} />
          ) : (
            <div className="bg-gray-50 rounded-card p-4">
              <Textarea
                label="Post Details"
                placeholder="Add any specific details, talking points, or context… (optional)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                maxLength={500}
                currentLength={topic.length}
              />
            </div>
          )}

          {/* Tone */}
          <div className="bg-gray-50 rounded-card p-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Tone</p>
            <div className="flex flex-wrap gap-2">
              {TONES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTone(t.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    tone === t.value
                      ? 'bg-brand-azure text-white border-brand-azure'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Reference Content + URL / File */}
          <div className="bg-gray-50 rounded-card p-4 space-y-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              Content Reference <span className="normal-case font-normal text-gray-400">(optional)</span>
            </p>

            {/* URL */}
            <div>
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                <Link size={9} className="inline mr-1" />URL
              </label>
              <input
                type="url"
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-azure/30 focus:border-brand-azure placeholder-gray-300 transition"
              />
            </div>

            {/* File upload */}
            <div>
              <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                <FileText size={9} className="inline mr-1" />Upload File
              </label>
              {fileName ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-brand-azure/5 border border-brand-azure/20 rounded-lg">
                  <FileText size={12} className="text-brand-azure flex-shrink-0" />
                  <span className="text-xs text-brand-azure flex-1 truncate">{fileName}</span>
                  <button type="button" onClick={clearFile} className="text-gray-400 hover:text-gray-600">
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="w-full px-3 py-2 text-xs border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-azure hover:text-brand-azure transition-colors text-left"
                >
                  Click to upload a text file…
                </button>
              )}
              <input ref={fileRef} type="file" accept=".txt,.md,.csv,.doc,.docx" className="hidden" onChange={handleFileChange} />
            </div>

            {/* Paste content */}
            {!fileName && (
              <Textarea
                label="Or paste content"
                placeholder="Paste any reference text, notes, or talking points here…"
                value={referenceContent}
                onChange={(e) => setReferenceContent(e.target.value)}
                rows={3}
                maxLength={4000}
                currentLength={referenceContent.length}
              />
            )}
          </div>

          {/* Platform */}
          <div className="bg-gray-50 rounded-card p-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Platform</p>
            <p className="text-[10px] text-gray-400 mb-3">Select one or more</p>
            <div className="grid grid-cols-2 gap-1.5">
              {PLATFORMS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => togglePlatform(p.value)}
                  className={cn(
                    'py-2 px-3 rounded-lg text-xs font-medium border-2 text-left transition-all',
                    platforms.includes(p.value)
                      ? 'border-brand-azure bg-brand-azure/5 text-brand-azure'
                      : 'border-gray-200 text-gray-600 hover:border-brand-light',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Hashtags toggle */}
          <div className="bg-gray-50 rounded-card p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium text-gray-700">Include hashtags</span>
              <Toggle checked={includeHashtags} onChange={setIncludeHashtags} />
            </div>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!canGenerate || loading}
            loading={loading}
            onClick={handleGenerate}
          >
            <Sparkles size={14} />
            Generate {contentType === 'series' ? `${seriesCount}-Part Series` : 'Caption'}
          </Button>

          {!canGenerate && !loading && platforms.length === 0 && (
            <p className="text-[11px] text-center text-gray-400">Select at least one platform to generate</p>
          )}

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: results ──────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-[3px] border-brand-azure border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-brand-navy">Writing your content…</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-8 max-w-2xl">
            {results.map(({ platform, captions }) => {
              const platformKey = platform
              const isSeries = captions.length > 1
              return (
                <div key={platform}>
                  {/* Platform header — only shown when multiple platforms */}
                  {results.length > 1 && (
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        {PLATFORM_LABEL[platform]}
                      </p>
                      {isSeries && (
                        <button
                          type="button"
                          onClick={() => copy(captions.join('\n\n---\n\n'), `${platformKey}-all`)}
                          className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline"
                        >
                          {copied === `${platformKey}-all` ? <><Check size={11} />Copied all</> : <><Copy size={11} />Copy all</>}
                        </button>
                      )}
                    </div>
                  )}
                  {/* Single-platform series header */}
                  {results.length === 1 && (
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                        {isSeries ? `${captions.length}-Part Series` : 'Caption'}
                      </p>
                      {isSeries && (
                        <button
                          type="button"
                          onClick={() => copy(captions.join('\n\n---\n\n'), 'all')}
                          className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline"
                        >
                          {copied === 'all' ? <><Check size={11} />Copied all</> : <><Copy size={11} />Copy all</>}
                        </button>
                      )}
                    </div>
                  )}
                  <div className="space-y-4">
                    {captions.map((caption, i) => (
                      <div key={i} className="bg-white rounded-card shadow-card p-4">
                        {isSeries && (
                          <p className="text-[10px] font-semibold text-brand-azure uppercase tracking-widest mb-2">
                            Post {i + 1}
                          </p>
                        )}
                        <p className="text-sm text-brand-navy whitespace-pre-wrap leading-relaxed mb-3">{caption}</p>
                        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => copy(caption, `${platformKey}-${i}`)}
                            className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-brand-azure bg-gray-50 border border-gray-200 px-2 py-1 rounded transition-colors"
                          >
                            {copied === `${platformKey}-${i}` ? <><Check size={10} />Copied</> : <><Copy size={10} />Copy</>}
                          </button>
                          <button
                            type="button"
                            onClick={() => sendToScheduler(caption, platform)}
                            className="flex items-center gap-1 text-[10px] font-medium text-brand-azure hover:text-brand-navy bg-brand-azure/5 border border-brand-azure/20 px-2 py-1 rounded transition-colors ml-auto"
                          >
                            <Calendar size={10} />Schedule
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mb-4">
              <PenSquare size={26} className="text-brand-orange" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">Your content appears here</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Pick a topic or enter details above, select a platform, and generate.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
