'use client'

import { useState, useCallback } from 'react'
import { Layers, AlertCircle, Download, ChevronDown } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useGenerate } from '@/hooks/useGenerate'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { GRAPHIC_TEMPLATES, type GraphicTemplate } from './templates'
import type { BrandId } from '@/lib/brands'

// ─── Types ────────────────────────────────────────────────────────────────────

interface GenerateResponse { asset: { id: string; html: string } }

interface RecentGraphic {
  id:          string
  htmlContent: string | null
  metadata:    any
  createdAt:   string
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GraphicsClient({ recentGraphics: initial }: { recentGraphics: RecentGraphic[] }) {
  const [brandId,   setBrandId]   = useState<BrandId>('lhcapital')
  const [template,  setTemplate]  = useState<GraphicTemplate>(GRAPHIC_TEMPLATES[0])
  const [headline,  setHeadline]  = useState('')
  const [subtext,   setSubtext]   = useState('')
  const [cta,       setCta]       = useState('')
  const [topic,     setTopic]     = useState('')
  const [recent,    setRecent]    = useState(initial)
  const [category,  setCategory]  = useState<string>('all')

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
    generate({ templateId: template.id, brandId, headline: headline.trim(), subtext: subtext.trim() || undefined, cta: cta.trim() || undefined, topic: topic.trim() || undefined })
  }, [template, brandId, headline, subtext, cta, topic, generate])

  const categories = ['all', ...Array.from(new Set(GRAPHIC_TEMPLATES.map((t) => t.category)))]
  const filtered   = category === 'all' ? GRAPHIC_TEMPLATES : GRAPHIC_TEMPLATES.filter((t) => t.category === category)

  return (
    <div className="flex h-full min-h-screen bg-app-bg">
      {/* ── Left: controls ─────────────────────────────────────────── */}
      <div className="w-[400px] flex-shrink-0 h-full overflow-y-auto p-5 border-r border-gray-100 bg-white">
        <div className="space-y-5">

          {/* Brand */}
          <div className="bg-gray-50 rounded-card p-4">
            <BrandSelector value={brandId} onChange={setBrandId} />
          </div>

          {/* Template picker */}
          <div className="bg-gray-50 rounded-card p-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Template</p>

            {/* Category filter */}
            <div className="flex gap-1.5 mb-3 flex-wrap">
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

            <div className="space-y-1.5 max-h-56 overflow-y-auto scrollbar-hide">
              {filtered.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTemplate(t)}
                  className={cn(
                    'w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all',
                    template.id === t.id
                      ? 'border-brand-azure bg-brand-azure/5'
                      : 'border-gray-200 hover:border-[#689EB8]',
                  )}
                >
                  <p className={cn('text-xs font-semibold', template.id === t.id ? 'text-brand-azure' : 'text-[#041740]')}>
                    {t.name}
                  </p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{t.description}</p>
                </button>
              ))}
            </div>
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
              <label className="block text-xs font-medium text-gray-600 mb-1">Topic / Context <span className="text-gray-400">(optional)</span></label>
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

      {/* ── Right: preview + history ────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-[3px] border-brand-azure border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-[#041740]">Generating graphic…</p>
            <p className="text-xs text-gray-400">Claude is designing your branded graphic</p>
          </div>
        )}

        {!loading && data?.asset && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Generated</p>
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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
              <Layers size={26} className="text-brand-teal" />
            </div>
            <p className="font-semibold text-[#041740] mb-1">Generated graphics appear here</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Pick a template, write your headline, and click Generate.
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
  )
}
