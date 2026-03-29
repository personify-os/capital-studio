'use client'

import { useState, useCallback, useRef } from 'react'
import { Layers, AlertCircle, Download, Upload, Link as LinkIcon, ChevronDown, ChevronUp } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useGenerate } from '@/hooks/useGenerate'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import { GRAPHIC_TEMPLATES, type GraphicTemplate } from './templates'
import { TOPIC_PILLS, PURPOSE_PILLS, CTA_PILLS, buildIntentString } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GenerateResponse { asset: { id: string; html: string } }

interface RecentGraphic {
  id:          string
  htmlContent: string | null
  metadata:    any
  createdAt:   string
}

// ─── Template Thumbnails ──────────────────────────────────────────────────────

function TemplateThumbnail({ id, active }: { id: string; active: boolean }) {
  const base = active ? 'bg-brand-navy' : 'bg-gray-800'
  const bar1 = active ? 'bg-white/90' : 'bg-white/70'
  const bar2 = active ? 'bg-white/40' : 'bg-white/30'
  const half = active ? 'bg-brand-azure' : 'bg-gray-600'
  const btn  = active ? 'bg-brand-orange' : 'bg-gray-500'

  if (id === 'stat-callout') return (
    <div className={`w-full h-full ${base} flex flex-col items-center justify-center gap-1.5 p-2`}>
      <div className={`${bar1} h-6 w-3/5 rounded`} />
      <div className={`${bar2} h-2 w-2/5 rounded`} />
    </div>
  )
  if (id === 'quote-card') return (
    <div className={`w-full h-full ${half} flex flex-col items-center justify-center gap-1 p-2`}>
      <div className="text-white/60 text-2xl font-serif leading-none mb-0.5">"</div>
      <div className={`${bar1} h-1.5 w-4/5 rounded`} />
      <div className={`${bar1} h-1.5 w-3/5 rounded`} />
      <div className={`${bar2} h-1 w-2/5 rounded mt-1`} />
    </div>
  )
  if (id === 'tip-card') return (
    <div className="w-full h-full bg-white flex flex-col justify-center gap-1.5 p-2">
      <div className="flex items-center gap-1">
        <div className={`w-4 h-4 rounded-full ${half} flex-shrink-0`} />
        <div className="h-2 w-3/5 rounded bg-gray-800/60" />
      </div>
      <div className="h-1.5 w-full rounded bg-gray-300" />
      <div className="h-1.5 w-4/5 rounded bg-gray-200" />
    </div>
  )
  if (id === 'announcement') return (
    <div className={`w-full h-full ${base} flex flex-col justify-between p-2`}>
      <div className={`${bar1} h-3 w-4/5 rounded`} />
      <div className={`${bar2} h-1.5 w-3/5 rounded`} />
      <div className={`${btn} h-3.5 w-2/5 rounded`} />
    </div>
  )
  if (id === 'comparison') return (
    <div className="w-full h-full flex gap-0.5">
      <div className="flex-1 bg-gray-600 flex flex-col justify-center gap-1 p-1.5">
        <div className="h-1.5 w-full rounded bg-white/30" />
        <div className="h-1 w-3/4 rounded bg-white/20" />
        <div className="h-1 w-3/4 rounded bg-white/20" />
      </div>
      <div className={`flex-1 ${half} flex flex-col justify-center gap-1 p-1.5`}>
        <div className="h-1.5 w-full rounded bg-white/70" />
        <div className="h-1 w-3/4 rounded bg-white/50" />
        <div className="h-1 w-3/4 rounded bg-white/50" />
      </div>
    </div>
  )
  if (id === 'benefit-list') return (
    <div className="w-full h-full bg-white flex flex-col justify-center gap-1 p-2">
      <div className="h-2 w-4/5 rounded bg-gray-700 mb-1" />
      {[1,2,3].map((i) => (
        <div key={i} className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-sm ${active ? 'bg-brand-azure' : 'bg-gray-400'} flex-shrink-0`} />
          <div className="h-1.5 flex-1 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  )
  if (id === 'savings-calculator') return (
    <div className={`w-full h-full ${base} flex flex-col items-center justify-center gap-1 p-2`}>
      <div className={`${bar2} h-1.5 w-3/5 rounded`} />
      <div className={`${bar1} h-5 w-2/3 rounded`} />
      <div className={`${bar2} h-1 w-2/5 rounded`} />
    </div>
  )
  if (id === 'irs-code-explainer') return (
    <div className={`w-full h-full ${base} flex flex-col items-center justify-center gap-1.5 p-2`}>
      <div className={`${bar1} h-5 w-2/5 rounded font-mono text-center`} />
      <div className={`${bar2} h-1.5 w-4/5 rounded`} />
      <div className={`${bar2} h-1.5 w-3/5 rounded`} />
    </div>
  )
  if (id === 'case-study-card') return (
    <div className={`w-full h-full ${half} flex flex-col justify-between p-2`}>
      <div className="h-1.5 w-3/4 rounded bg-white/70" />
      <div className="space-y-0.5">
        {[1,2,3].map((i) => (
          <div key={i} className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/60 flex-shrink-0" />
            <div className="h-1 flex-1 rounded bg-white/40" />
          </div>
        ))}
      </div>
      <div className="h-3 w-3/5 rounded bg-white/90" />
    </div>
  )
  if (id === 'email-header') return (
    <div className={`w-full h-full ${base} flex items-center justify-between px-2`}>
      <div className="w-6 h-6 rounded bg-white/30" />
      <div className="flex flex-col items-end gap-1">
        <div className="h-2 w-12 rounded bg-white/70" />
        <div className="h-1 w-8 rounded bg-white/30" />
      </div>
    </div>
  )
  if (id === 'cta-banner') return (
    <div className={`w-full h-full ${btn} flex flex-col items-center justify-center gap-1.5 p-2`}>
      <div className="h-2.5 w-4/5 rounded bg-white/90" />
      <div className="h-1.5 w-3/5 rounded bg-white/50" />
      <div className="h-3 w-2/5 rounded bg-white mt-1" />
    </div>
  )
  if (id === 'linkedin-ad') return (
    <div className="w-full h-full bg-gray-700 flex flex-col justify-end">
      <div className="bg-black/60 p-1.5">
        <div className="h-1.5 w-4/5 rounded bg-white/90 mb-1" />
        <div className="h-1 w-2/5 rounded bg-white/50" />
      </div>
    </div>
  )
  if (id === 'story-ad') return (
    <div className={`w-full h-full bg-gradient-to-b from-brand-navy to-brand-azure flex flex-col items-center justify-center gap-1.5 p-2`}>
      <div className="h-3 w-4/5 rounded bg-white/90" />
      <div className="h-1.5 w-3/5 rounded bg-white/50" />
      <div className="h-3.5 w-2/5 rounded bg-white/90 mt-1" />
    </div>
  )
  // Fallback
  return (
    <div className={`w-full h-full ${base} flex items-center justify-center`}>
      <div className={`w-8 h-8 rounded-lg ${bar2}`} />
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GraphicsClient({ recentGraphics: initial }: { recentGraphics: RecentGraphic[] }) {
  const [brandId,        setBrandId]        = useState<BrandId>('lhcapital')
  const [template,       setTemplate]       = useState<GraphicTemplate>(GRAPHIC_TEMPLATES[0])
  const [headline,       setHeadline]       = useState('')
  const [subtext,        setSubtext]        = useState('')
  const [cta,            setCta]            = useState('')
  const [topic,          setTopic]          = useState('')
  const [photoUrl,       setPhotoUrl]       = useState('')
  const [recent,         setRecent]         = useState(initial)
  const [category,       setCategory]       = useState<string>('all')
  const [uploading,      setUploading]      = useState(false)
  const [intentOpen,     setIntentOpen]     = useState(true)
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [selectedPurpose,setSelectedPurpose]= useState('')
  const [selectedCta,    setSelectedCta]    = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const { data, loading, error, generate } = useGenerate<object, GenerateResponse>({
    endpoint:  '/api/v1/generate/graphic',
    onSuccess: (res) => {
      setRecent((prev) => [
        { id: res.asset.id, htmlContent: res.asset.html, metadata: { templateId: template.id, brandId }, createdAt: new Date().toISOString() },
        ...prev,
      ].slice(0, 12))
    },
  })

  const handleGenerate = useCallback(() => {
    if (!headline.trim()) return
    const intent    = buildIntentString(selectedTopics, selectedPurpose, selectedCta)
    const fullTopic = [topic.trim(), intent].filter(Boolean).join(' · ')
    generate({
      templateId: template.id,
      brandId,
      headline:   headline.trim(),
      subtext:    subtext.trim() || undefined,
      cta:        cta.trim() || undefined,
      topic:      fullTopic || undefined,
      photoUrl:   photoUrl.trim() || undefined,
    })
  }, [template, brandId, headline, subtext, cta, topic, photoUrl, selectedTopics, selectedPurpose, selectedCta, generate])

  function toggleTopic(t: string) {
    setSelectedTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', 'photo')
      const res  = await fetch('/api/v1/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (json.url) setPhotoUrl(json.url)
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const categories = ['all', ...Array.from(new Set(GRAPHIC_TEMPLATES.map((t) => t.category)))]
  const filtered   = category === 'all' ? GRAPHIC_TEMPLATES : GRAPHIC_TEMPLATES.filter((t) => t.category === category)

  return (
    <div className="flex bg-app-bg">
      {/* ── Left: content fields ───────────────────────────────────── */}
      <div className="w-[400px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden p-5 border-r border-gray-100 bg-white">
        <div className="space-y-4 pb-4">

          {/* Content Intent */}
          <div className="bg-gray-50 rounded-card p-4">
            <button type="button" onClick={() => setIntentOpen((v) => !v)} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Content Intent</span>
                <span className="text-[9px] text-gray-400">— helps AI create targeted content</span>
              </div>
              {intentOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
            </button>

            {intentOpen && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Topic</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPIC_PILLS.map((t) => (
                      <button key={t} type="button" onClick={() => toggleTopic(t)}
                        className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                          selectedTopics.includes(t) ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure'
                        )}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Purpose</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PURPOSE_PILLS.map((p) => (
                      <button key={p.label} type="button" onClick={() => setSelectedPurpose((v) => v === p.label ? '' : p.label)}
                        className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                          selectedPurpose === p.label ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure'
                        )}>{p.emoji} {p.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Call to Action <span className="normal-case font-normal text-gray-400">(optional)</span></p>
                  <div className="flex flex-wrap gap-1.5">
                    {CTA_PILLS.map((c) => (
                      <button key={c} type="button" onClick={() => setSelectedCta((v) => v === c ? '' : c)}
                        className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                          selectedCta === c ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure'
                        )}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Brand */}
          <div className="bg-gray-50 rounded-card p-4">
            <BrandSelector value={brandId} onChange={setBrandId} />
          </div>

          {/* Copy fields */}
          <div className="bg-gray-50 rounded-card p-4 space-y-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Copy</p>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Headline <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={100}
                placeholder="e.g. Save $550 per employee, per year"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
              />
            </div>

            {template.fields.includes('subtext') && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Supporting Text</label>
                <textarea
                  value={subtext}
                  onChange={(e) => setSubtext(e.target.value)}
                  maxLength={200}
                  rows={2}
                  placeholder="Additional context or explanation"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
                />
              </div>
            )}

            {template.fields.includes('cta') && (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Call to Action</label>
                <input
                  type="text"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                  maxLength={60}
                  placeholder="e.g. Book a Free Assessment"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Topic / Context <span className="text-gray-400">(optional)</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                maxLength={100}
                placeholder="e.g. SIMRP tax savings for mid-size companies"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
              />
            </div>
          </div>

          {/* Photo */}
          <div className="bg-gray-50 rounded-card p-4 space-y-2.5">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Photo <span className="normal-case text-gray-400 font-normal">(optional)</span></p>

            <div className="flex items-center gap-2">
              <LinkIcon size={12} className="text-gray-400 flex-shrink-0" />
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Paste photo URL…"
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400">or</span>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-brand-azure hover:text-brand-azure transition-colors disabled:opacity-50"
              >
                <Upload size={11} />
                {uploading ? 'Uploading…' : 'Upload photo'}
              </button>
              {photoUrl && (
                <button
                  type="button"
                  onClick={() => setPhotoUrl('')}
                  className="text-[10px] text-red-400 hover:underline ml-auto"
                >
                  Clear
                </button>
              )}
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

            {photoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoUrl} alt="Preview" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
            )}
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!headline.trim() || loading}
            loading={loading}
            onClick={handleGenerate}
          >
            Generate Graphic
          </Button>

          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: template gallery + preview ──────────────────────── */}
      <div className="flex-1 overflow-y-auto">

        {/* Template gallery */}
        <div className="p-6 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
              Templates
              {template && <span className="ml-2 text-brand-azure normal-case font-normal">— {template.name}</span>}
            </p>
            <div className="flex gap-1.5 flex-wrap justify-end">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide border transition-colors',
                    category === cat
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t)}
                className={cn(
                  'p-3 rounded-card border-2 text-left transition-all hover:shadow-card',
                  template.id === t.id
                    ? 'border-brand-azure bg-brand-azure/5 shadow-card'
                    : 'border-gray-200 hover:border-brand-light bg-white',
                )}
              >
                <div className="w-full aspect-video rounded-lg mb-2 overflow-hidden">
                  <TemplateThumbnail id={t.id} active={template.id === t.id} />
                </div>
                <p className={cn('text-xs font-semibold leading-tight', template.id === t.id ? 'text-brand-azure' : 'text-brand-navy')}>
                  {t.name}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Generated preview / history */}
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-8 h-8 border-[3px] border-brand-azure border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-brand-navy">Generating graphic…</p>
              <p className="text-xs text-gray-400">Claude is designing your branded graphic</p>
            </div>
          )}

          {!loading && data?.asset && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Generated</p>
                <button
                  type="button"
                  onClick={() => {
                    const blob = new Blob([data.asset.html], { type: 'text/html' })
                    const a    = document.createElement('a')
                    a.href     = URL.createObjectURL(blob)
                    a.download = `graphic-${Date.now()}.html`
                    a.click()
                  }}
                  className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline"
                >
                  <Download size={12} /> Download HTML
                </button>
              </div>
              <div className="rounded-card overflow-hidden shadow-card-hover border border-gray-100">
                <iframe
                  srcDoc={data.asset.html}
                  className="w-full border-0"
                  style={{ height: '600px' }}
                  title="Generated graphic"
                />
              </div>
            </div>
          )}

          {!loading && !data && recent.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
                <Layers size={26} className="text-brand-teal" />
              </div>
              <p className="font-semibold text-brand-navy mb-1">Select a template and write your headline</p>
              <p className="text-sm text-gray-400 max-w-xs">
                Your generated graphic will appear here.
              </p>
            </div>
          )}

          {recent.length > 0 && (
            <>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Recent Graphics</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {recent.map((g) => g.htmlContent && (
                  <div key={g.id} className="rounded-card overflow-hidden shadow-card bg-gray-100 aspect-square relative group">
                    <iframe
                      srcDoc={g.htmlContent}
                      className="w-full h-full border-0 pointer-events-none"
                      style={{ transform: 'scale(0.25)', transformOrigin: 'top left', width: '400%', height: '400%' }}
                      title="Graphic"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white/60 text-[9px]">{formatRelativeTime(g.createdAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
