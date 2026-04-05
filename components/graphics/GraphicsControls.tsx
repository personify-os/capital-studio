import { useRef } from 'react'
import { AlertCircle, Upload, Link as LinkIcon } from 'lucide-react'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import ContentIntentSimple from '@/components/shared/ContentIntentSimple'
import ContentPillarSelector from '@/components/writer/ContentPillarSelector'
import { type GraphicTemplate } from '@/app/(studio)/graphics/templates'
import type { BrandId } from '@/lib/brands'
import type { ContentPillar } from '@/components/writer/types'

interface Props {
  brandId:         BrandId
  onBrandChange:   (id: BrandId) => void
  template:        GraphicTemplate
  headline:        string
  onHeadline:      (v: string) => void
  subtext:         string
  onSubtext:       (v: string) => void
  cta:             string
  onCta:           (v: string) => void
  topic:           string
  onTopic:         (v: string) => void
  photoUrl:        string
  onPhotoUrl:      (v: string) => void
  onPhotoUpload:   (e: React.ChangeEvent<HTMLInputElement>) => void
  uploading:       boolean
  uploadError:     string | null
  intentOpen:      boolean
  onIntentOpen:    (v: boolean) => void
  selectedTopics:  string[]
  onToggleTopic:   (id: string) => void
  selectedPurpose: string
  onPurposeChange: (id: string) => void
  selectedCta:     string
  onCtaChange:     (id: string) => void
  contentPillar:   ContentPillar | ''
  onContentPillar: (v: ContentPillar | '') => void
  loading:         boolean
  error:           string | null
  onGenerate:      () => void
}

export default function GraphicsControls({
  brandId, onBrandChange, template, headline, onHeadline, subtext, onSubtext,
  cta, onCta, topic, onTopic, photoUrl, onPhotoUrl, onPhotoUpload, uploading, uploadError,
  intentOpen, onIntentOpen, selectedTopics, onToggleTopic,
  selectedPurpose, onPurposeChange, selectedCta, onCtaChange,
  contentPillar, onContentPillar,
  loading, error, onGenerate,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent'

  return (
    <div className="w-[400px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden p-5 border-r border-gray-100 bg-white">
      <div className="space-y-4 pb-4">

        <ContentIntentSimple
          open={intentOpen}       onOpenChange={onIntentOpen}
          selectedTopics={selectedTopics} onToggleTopic={onToggleTopic}
          selectedPurpose={selectedPurpose} onPurposeChange={onPurposeChange}
          selectedCta={selectedCta}         onCtaChange={onCtaChange}
        />

        {/* Brand */}
        <div className="bg-gray-50 rounded-card p-4">
          <BrandSelector value={brandId} onChange={onBrandChange} />
        </div>

        {/* Copy fields */}
        <div className="bg-gray-50 rounded-card p-4 space-y-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Copy</p>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Headline <span className="text-red-400">*</span></label>
            <input type="text" value={headline} onChange={(e) => onHeadline(e.target.value)} maxLength={100}
              placeholder="e.g. Save $550 per employee, per year" className={inputCls} />
          </div>
          {template.fields.includes('subtext') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Supporting Text</label>
              <textarea value={subtext} onChange={(e) => onSubtext(e.target.value)} maxLength={200} rows={2}
                placeholder="Additional context or explanation"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
            </div>
          )}
          {template.fields.includes('cta') && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Call to Action</label>
              <input type="text" value={cta} onChange={(e) => onCta(e.target.value)} maxLength={60}
                placeholder="e.g. Book a Free Assessment" className={inputCls} />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Topic / Context <span className="text-gray-400">(optional)</span></label>
            <input type="text" value={topic} onChange={(e) => onTopic(e.target.value)} maxLength={100}
              placeholder="e.g. SIMRP tax savings for mid-size companies" className={inputCls} />
          </div>
        </div>

        {/* Photo */}
        <div className="bg-gray-50 rounded-card p-4 space-y-2.5">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Photo <span className="normal-case text-gray-400 font-normal">(optional)</span></p>
          <div className="flex items-center gap-2">
            <LinkIcon size={12} className="text-gray-400 flex-shrink-0" />
            <input type="url" value={photoUrl} onChange={(e) => onPhotoUrl(e.target.value)} placeholder="Paste photo URL…"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400">or</span>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-dashed border-gray-300 rounded-lg text-xs text-gray-500 hover:border-brand-azure hover:text-brand-azure transition-colors disabled:opacity-50">
              <Upload size={11} />
              {uploading ? 'Uploading…' : 'Upload photo'}
            </button>
            {photoUrl && (
              <button type="button" onClick={() => onPhotoUrl('')} className="text-[10px] text-red-400 hover:underline ml-auto">Clear</button>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhotoUpload} />
          {uploadError && <p className="text-[10px] text-red-500">{uploadError}</p>}
          {photoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photoUrl} alt="Preview" className="w-full h-24 object-cover rounded-lg border border-gray-200" />
          )}
        </div>

        <ContentPillarSelector value={contentPillar} onChange={onContentPillar} />

        <Button className="w-full" size="lg" disabled={!headline.trim() || loading} loading={loading} onClick={onGenerate}>
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
  )
}
