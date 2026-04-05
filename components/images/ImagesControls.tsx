import { AlertCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Toggle from '@/components/ui/Toggle'
import ContentIntentSimple from '@/components/shared/ContentIntentSimple'
import type { BrandId } from '@/lib/brands'

type ModelId     = 'flux-pro' | 'fal-flux' | 'ideogram-v3' | 'recraft-v3' | 'imagen-4' | 'dall-e-3' | 'seedream-v3' | 'realistic-vision' | 'nano-banana-2' | 'nano-banana-pro' | 'gemini-flash' | 'gemini-flash-pro'
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5'

export const MODELS: { id: ModelId; name: string; note: string; badge?: string }[] = [
  { id: 'flux-pro',         name: 'Flux Pro 1.1',    note: 'Best overall quality',          badge: 'TOP' },
  { id: 'ideogram-v3',      name: 'Ideogram V3',     note: 'Best text-in-image',            badge: 'NEW' },
  { id: 'recraft-v3',       name: 'Recraft V3',      note: 'Vector & illustration',         badge: 'NEW' },
  { id: 'imagen-4',         name: 'Imagen 4',        note: "Google's photorealistic",       badge: 'NEW' },
  { id: 'nano-banana-2',    name: 'Nano Banana 2',   note: 'High-quality creative',         badge: 'NEW' },
  { id: 'nano-banana-pro',  name: 'Nano Banana Pro', note: 'Pro creative generation',       badge: 'NEW' },
  { id: 'gemini-flash',     name: 'Gemini Flash',    note: "Google's fast model",           badge: 'NEW' },
  { id: 'gemini-flash-pro', name: 'Gemini Flash Pro',note: "Google's pro model",            badge: 'NEW' },
  { id: 'realistic-vision', name: 'Realistic Vision',note: 'Photorealistic people & scenes' },
  { id: 'seedream-v3',      name: 'Seedream V3',     note: 'Fast 4K generation' },
  { id: 'fal-flux',         name: 'Flux Schnell',    note: 'Fastest generation' },
  { id: 'dall-e-3',         name: 'DALL-E 3',        note: "OpenAI's creative model" },
]

const ASPECTS: { value: AspectRatio; label: string }[] = [
  { value: '1:1',  label: 'Square 1:1' },
  { value: '16:9', label: 'Landscape 16:9' },
  { value: '9:16', label: 'Portrait 9:16' },
  { value: '4:5',  label: '4:5 Feed' },
]

interface Props {
  brandId:         BrandId
  onBrandChange:   (id: BrandId) => void
  prompt:          string
  onPrompt:        (v: string) => void
  model:           ModelId
  onModel:         (m: ModelId) => void
  aspect:          AspectRatio
  onAspect:        (a: AspectRatio) => void
  variations:      number
  onVariations:    (v: number) => void
  enhancePrompt:   boolean
  onEnhancePrompt: (v: boolean) => void
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

export type { ModelId, AspectRatio }

export default function ImagesControls({
  brandId, onBrandChange, prompt, onPrompt, model, onModel,
  aspect, onAspect, variations, onVariations, enhancePrompt, onEnhancePrompt,
  intentOpen, onIntentOpen, selectedTopics, onToggleTopic,
  selectedPurpose, onPurposeChange, selectedCta, onCtaChange,
  loading, error, onGenerate,
}: Props) {
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

        <div className="bg-gray-50 rounded-card p-4">
          <Textarea label="Prompt" placeholder="Describe the image — e.g. 'A professional executive reviewing employee benefits documents at a modern office, cinematic lighting'"
            value={prompt} onChange={(e) => onPrompt(e.target.value)} rows={4} maxLength={600} currentLength={prompt.length} />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div>
              <p className="text-xs font-medium text-gray-700">AI Prompt Enhancer</p>
              <p className="text-[10px] text-gray-400">Rewrites your prompt with cinematic lighting, composition, and brand style</p>
            </div>
            <Toggle checked={enhancePrompt} onChange={onEnhancePrompt} color="bg-brand-teal" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-card p-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Model</p>
          <div className="grid grid-cols-2 gap-2">
            {MODELS.map((m) => (
              <button key={m.id} type="button" onClick={() => onModel(m.id)}
                className={cn('relative p-3 rounded-lg border-2 text-left transition-all',
                  model === m.id ? 'border-brand-azure bg-brand-azure/5' : 'border-gray-200 hover:border-brand-light',
                )}>
                {m.badge && <span className="absolute top-1.5 right-1.5 bg-brand-azure text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{m.badge}</span>}
                <p className={cn('text-xs font-semibold', model === m.id ? 'text-brand-azure' : 'text-brand-navy')}>{m.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{m.note}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-card p-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Aspect Ratio</p>
          <div className="flex flex-wrap gap-2">
            {ASPECTS.map((a) => (
              <button key={a.value} type="button" onClick={() => onAspect(a.value)}
                className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  aspect === a.value ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
                )}>{a.label}</button>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-card p-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Variations</p>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((v) => (
              <button key={v} type="button" onClick={() => onVariations(v)}
                className={cn('w-10 h-9 rounded-lg text-sm font-semibold border transition-colors',
                  variations === v ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure',
                )}>{v}</button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
          <Zap size={11} className="text-brand-teal" />
          <span>{variations} image{variations > 1 ? 's' : ''} · {model}</span>
        </div>

        <Button className="w-full" size="lg" disabled={!prompt.trim() || loading} loading={loading} onClick={onGenerate}>
          Generate Image{variations > 1 ? 's' : ''}
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
