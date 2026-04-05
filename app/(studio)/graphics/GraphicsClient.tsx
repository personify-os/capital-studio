'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Layers, Download, Calendar, PenSquare } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { useGenerate } from '@/hooks/useGenerate'
import GraphicsControls from '@/components/graphics/GraphicsControls'
import TemplateGallery from '@/components/graphics/TemplateGallery'
import { GRAPHIC_TEMPLATES, type GraphicTemplate } from './templates'
import { TOPIC_TIERS, PURPOSES, CTA_OPTIONS, buildIntentString } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'
import type { ContentPillar } from '@/components/writer/types'

interface GenerateResponse { asset: { id: string; html: string } }

interface RecentGraphic {
  id:          string
  htmlContent: string | null
  metadata:    unknown
  createdAt:   string
}

export default function GraphicsClient({ recentGraphics: initial }: { recentGraphics: RecentGraphic[] }) {
  const router = useRouter()
  const [brandId,         setBrandId]         = useState<BrandId>('lhcapital')
  const [template,        setTemplate]        = useState<GraphicTemplate>(GRAPHIC_TEMPLATES[0])
  const [headline,        setHeadline]        = useState('')
  const [subtext,         setSubtext]         = useState('')
  const [cta,             setCta]             = useState('')
  const [topic,           setTopic]           = useState('')
  const [photoUrl,        setPhotoUrl]        = useState('')
  const [recent,          setRecent]          = useState(initial)
  const [category,        setCategory]        = useState<string>('all')
  const [uploading,       setUploading]       = useState(false)
  const [uploadError,     setUploadError]     = useState<string | null>(null)
  const [intentOpen,      setIntentOpen]      = useState(true)
  const [selectedTopics,  setSelectedTopics]  = useState<string[]>([])
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [selectedCta,     setSelectedCta]     = useState('')
  const [contentPillar,   setContentPillar]   = useState<ContentPillar | ''>('')

  useEffect(() => {
    try {
      const raw = localStorage.getItem('graphicsDraft')
      if (!raw) return
      localStorage.removeItem('graphicsDraft')
      const draft = JSON.parse(raw) as {
        templateId?: string; brandId?: string; headline?: string; subtext?: string
        cta?: string; topic?: string; contentPillar?: string
      }
      if (draft.brandId)       setBrandId(draft.brandId as BrandId)
      if (draft.headline)      setHeadline(draft.headline)
      if (draft.subtext)       setSubtext(draft.subtext)
      if (draft.cta)           setCta(draft.cta)
      if (draft.topic)         setTopic(draft.topic)
      if (draft.contentPillar) setContentPillar(draft.contentPillar as ContentPillar)
      if (draft.templateId) {
        const t = GRAPHIC_TEMPLATES.find((t) => t.id === draft.templateId)
        if (t) setTemplate(t)
      }
    } catch { /* ignore malformed draft */ }
  }, [])

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
    const topicLabels  = selectedTopics.map((id) => TOPIC_TIERS.find((t) => t.id === id)?.label ?? id)
    const purposeLabel = PURPOSES.find((p) => p.id === selectedPurpose)?.label ?? selectedPurpose
    const ctaLabel     = CTA_OPTIONS.find((c) => c.id === selectedCta)?.label ?? selectedCta
    const intent       = buildIntentString(topicLabels, purposeLabel, ctaLabel)
    const fullTopic    = [topic.trim(), intent].filter(Boolean).join(' · ')
    generate({
      templateId:     template.id,
      templateFormat: template.format,
      brandId,
      headline:       headline.trim(),
      subtext:        subtext.trim()    || undefined,
      cta:            cta.trim()        || undefined,
      topic:          fullTopic         || undefined,
      photoUrl:       photoUrl.trim()   || undefined,
      contentPillar:  contentPillar     || undefined,
    })
  }, [template, brandId, headline, subtext, cta, topic, photoUrl, selectedTopics, selectedPurpose, selectedCta, generate])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true); setUploadError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', 'photo')
      const res  = await fetch('/api/v1/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) { setUploadError(json.message ?? 'Upload failed'); return }
      if (json.url) setPhotoUrl(json.url)
    } catch {
      setUploadError('Upload failed — please try again')
    } finally {
      setUploading(false)
    }
  }

  function sendToScheduler() {
    localStorage.setItem('schedulerDraft', JSON.stringify({ caption: [headline.trim(), subtext.trim()].filter(Boolean).join('\n\n') }))
    router.push('/scheduler')
  }

  function sendToWriter() {
    localStorage.setItem('writerDraft', JSON.stringify({ referenceContent: [headline, subtext, cta, topic].filter(Boolean).join('\n') }))
    router.push('/writer')
  }

  const categories = ['all', ...Array.from(new Set(GRAPHIC_TEMPLATES.map((t) => t.category)))]
  const filtered   = category === 'all' ? GRAPHIC_TEMPLATES : GRAPHIC_TEMPLATES.filter((t) => t.category === category)

  return (
    <div className="flex bg-app-bg">
      <GraphicsControls
        brandId={brandId}           onBrandChange={setBrandId}
        template={template}
        headline={headline}         onHeadline={setHeadline}
        subtext={subtext}           onSubtext={setSubtext}
        cta={cta}                   onCta={setCta}
        topic={topic}               onTopic={setTopic}
        photoUrl={photoUrl}         onPhotoUrl={setPhotoUrl}
        onPhotoUpload={handleFileUpload}
        uploading={uploading}       uploadError={uploadError}
        intentOpen={intentOpen}     onIntentOpen={setIntentOpen}
        selectedTopics={selectedTopics}   onToggleTopic={(id) => setSelectedTopics((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
        selectedPurpose={selectedPurpose} onPurposeChange={setSelectedPurpose}
        selectedCta={selectedCta}         onCtaChange={setSelectedCta}
        contentPillar={contentPillar}     onContentPillar={setContentPillar}
        loading={loading}
        error={error}
        onGenerate={handleGenerate}
      />

      <div className="flex-1 overflow-y-auto">
        <TemplateGallery
          templates={filtered}
          selectedTemplate={template}
          onSelect={setTemplate}
          categories={categories}
          category={category}
          onCategoryChange={setCategory}
        />

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
                <div className="flex items-center gap-3">
                  <button type="button" onClick={sendToWriter} className="flex items-center gap-1.5 text-xs text-brand-teal hover:underline">
                    <PenSquare size={12} /> Write Caption
                  </button>
                  <button type="button" onClick={sendToScheduler} className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline">
                    <Calendar size={12} /> Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => { const blob = new Blob([data.asset.html], { type: 'text/html' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `graphic-${Date.now()}.html`; a.click() }}
                    className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline"
                  >
                    <Download size={12} /> Download HTML
                  </button>
                </div>
              </div>
              <div className="rounded-card overflow-hidden shadow-card-hover border border-gray-100">
                <iframe srcDoc={data.asset.html} className="w-full border-0" style={{ height: '600px' }} title="Generated graphic" />
              </div>
            </div>
          )}

          {!loading && !data && recent.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
                <Layers size={26} className="text-brand-teal" />
              </div>
              <p className="font-semibold text-brand-navy mb-1">Select a template and write your headline</p>
              <p className="text-sm text-gray-400 max-w-xs">Your generated graphic will appear here.</p>
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
