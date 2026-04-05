import { useCallback, useRef } from 'react'
import { AlertCircle, Zap, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import ContentIntentSimple from '@/components/shared/ContentIntentSimple'
import type { BrandId } from '@/lib/brands'

type Duration    = '5' | '10' | '30' | '60'
type AspectRatio = '16:9' | '9:16' | '1:1'

export type { Duration, AspectRatio }

interface Props {
  brandId:         BrandId
  onBrandChange:   (id: BrandId) => void
  imageUrl:        string
  onImageUrl:      (v: string) => void
  imageValid:      boolean
  onImageValid:    (v: boolean) => void
  prompt:          string
  onPrompt:        (v: string) => void
  duration:        Duration
  onDuration:      (d: Duration) => void
  aspectRatio:     AspectRatio
  onAspectRatio:   (a: AspectRatio) => void
  enhancing:       boolean
  onEnhance:       () => void
  uploading:       boolean
  onPhotoUpload:   (file: File) => void
  intentOpen:      boolean
  onIntentOpen:    (v: boolean) => void
  selectedTopics:  string[]
  onToggleTopic:   (id: string) => void
  selectedPurpose: string
  onPurposeChange: (id: string) => void
  selectedCta:     string
  onCtaChange:     (id: string) => void
  loading:         boolean
  error:           string | null
  onGenerate:      () => void
}

export default function MotionControls({
  brandId, onBrandChange, imageUrl, onImageUrl, imageValid, onImageValid,
  prompt, onPrompt, duration, onDuration, aspectRatio, onAspectRatio,
  enhancing, onEnhance, uploading, onPhotoUpload,
  intentOpen, onIntentOpen, selectedTopics, onToggleTopic,
  selectedPurpose, onPurposeChange, selectedCta, onCtaChange,
  loading, error, onGenerate,
}: Props) {
  const fileRef    = useRef<HTMLInputElement>(null)
  const wordCount  = prompt.trim().split(/\s+/).filter(Boolean).length
  const canGenerate = imageUrl.trim().length > 0 && imageValid && prompt.trim().length > 0

  const handleImageUrlChange = useCallback((val: string) => {
    onImageUrl(val)
    onImageValid(false)
    try { new URL(val); onImageValid(true) } catch { onImageValid(false) }
  }, [onImageUrl, onImageValid])

  return (
    <div className="w-[400px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden p-5 border-r border-gray-100 bg-white">
      <div className="space-y-4 pb-4">

        <ContentIntentSimple
          open={intentOpen} onOpenChange={onIntentOpen}
          selectedTopics={selectedTopics} onToggleTopic={onToggleTopic}
          selectedPurpose={selectedPurpose} onPurposeChange={onPurposeChange}
          selectedCta={selectedCta} onCtaChange={onCtaChange}
        />

        <div className="bg-gray-50 rounded-card p-4">
          <BrandSelector value={brandId} onChange={onBrandChange} />
        </div>

        <div className="bg-gray-50 rounded-card p-4 space-y-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Source Image</p>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Image URL</label>
            <input type="url" value={imageUrl} onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-azure/30 focus:border-brand-azure placeholder-gray-300 transition" />
            {imageUrl && !imageValid && <p className="text-[10px] text-red-500 mt-1">Enter a valid URL</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-[10px] text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex flex-col items-center justify-center gap-1.5 py-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand-azure hover:text-brand-azure transition-colors disabled:opacity-50"
          >
            {uploading
              ? <><div className="w-4 h-4 border-2 border-brand-azure/30 border-t-brand-azure rounded-full animate-spin" /><span className="text-xs">Uploading…</span></>
              : <><Upload size={16} /><span className="text-xs font-medium">Upload Image</span></>
            }
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhotoUpload(f) }} />
          {imageValid && imageUrl && (
            <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Source image preview" className="w-full object-cover max-h-48"
                onError={() => onImageValid(false)} />
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-card p-4">
          <Textarea label="Motion Description" placeholder="Describe the motion — camera movement, wind, water ripple, slow zoom in..."
            value={prompt} onChange={(e) => onPrompt(e.target.value)} rows={4} maxLength={500} currentLength={prompt.length} />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div>
              <p className="text-xs font-medium text-gray-700">Prompt Enhancer</p>
              <p className="text-[10px] text-gray-400">AI refines your motion description</p>
            </div>
            <button type="button" disabled={wordCount < 3 || enhancing}
              title={wordCount < 3 ? 'Enter at least 3 words to enhance' : undefined}
              onClick={onEnhance}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-brand-teal text-brand-teal hover:bg-brand-teal/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {enhancing
                ? <><span className="w-3 h-3 border-2 border-brand-teal/30 border-t-brand-teal rounded-full animate-spin" />Enhancing…</>
                : <><Zap size={12} />Enhance</>
              }
            </button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-card p-4 space-y-3">
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Duration</p>
            <div className="flex gap-2">
              {([['5', '5s'], ['10', '10s'], ['30', '30s'], ['60', '1 min']] as [Duration, string][]).map(([d, label]) => (
                <button key={d} type="button" onClick={() => onDuration(d)}
                  className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                    duration === d ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure',
                  )}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Aspect Ratio</p>
            <div className="flex gap-2">
              {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((a) => (
                <button key={a} type="button" onClick={() => onAspectRatio(a)}
                  className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                    aspectRatio === a ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure',
                  )}>{a}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
          <Zap size={11} className="text-brand-teal" />
          <span>{Number(duration) >= 60 ? `${Number(duration) / 60} min` : `${duration}s`} · {aspectRatio} · Kling AI</span>
        </div>

        <Button className="w-full" size="lg" disabled={!canGenerate || loading} loading={loading} onClick={onGenerate}>
          Animate Image
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
