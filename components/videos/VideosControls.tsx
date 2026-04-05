import { AlertCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import ContentIntentSimple from '@/components/shared/ContentIntentSimple'
import type { BrandId } from '@/lib/brands'

type VideoModel  = 'kling-3.0' | 'kling-2.1' | 'veo-3' | 'minimax' | 'hunyuan' | 'wan'
type Duration    = '5' | '10'
type AspectRatio = '16:9' | '9:16' | '1:1'

export const MODELS: { id: VideoModel; name: string; note: string; badge?: string }[] = [
  { id: 'kling-3.0', name: 'Kling 3.0',      note: 'Latest · best quality',  badge: 'NEW' },
  { id: 'kling-2.1', name: 'Kling 2.1',      note: 'Cinematic quality',      badge: 'TOP' },
  { id: 'veo-3',     name: 'Veo 3',          note: 'Google DeepMind',        badge: 'NEW' },
  { id: 'minimax',   name: 'MiniMax Video',   note: 'Vivid & dynamic' },
  { id: 'hunyuan',   name: 'HunyuanVideo',    note: 'Detail-rich scenes' },
  { id: 'wan',       name: 'Wan T2V',         note: 'Fast generation' },
]

export type { VideoModel, Duration, AspectRatio }

interface Props {
  brandId:         BrandId
  onBrandChange:   (id: BrandId) => void
  prompt:          string
  onPrompt:        (v: string) => void
  model:           VideoModel
  onModel:         (m: VideoModel) => void
  duration:        Duration
  onDuration:      (d: Duration) => void
  aspectRatio:     AspectRatio
  onAspectRatio:   (a: AspectRatio) => void
  enhancing:       boolean
  onEnhance:       () => void
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

export default function VideosControls({
  brandId, onBrandChange, prompt, onPrompt, model, onModel,
  duration, onDuration, aspectRatio, onAspectRatio, enhancing, onEnhance,
  intentOpen, onIntentOpen, selectedTopics, onToggleTopic,
  selectedPurpose, onPurposeChange, selectedCta, onCtaChange,
  loading, error, onGenerate,
}: Props) {
  const wordCount = prompt.trim().split(/\s+/).filter(Boolean).length

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
          <Textarea label="What would you like to create?"
            placeholder="Describe the video — e.g. 'A confident business executive presenting employee benefits solutions in a modern boardroom, cinematic lighting'"
            value={prompt} onChange={(e) => onPrompt(e.target.value)} rows={4} maxLength={1000} currentLength={prompt.length} />
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
            <div>
              <p className="text-xs font-medium text-gray-700">Prompt Enhancer</p>
              <p className="text-[10px] text-gray-400">AI refines your video description</p>
            </div>
            <button
              type="button"
              disabled={wordCount < 3 || enhancing}
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

        <div className="bg-gray-50 rounded-card p-4 space-y-3">
          <div>
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Duration</p>
            <div className="flex gap-1.5 flex-wrap">
              {([['5', '5s'], ['10', '10s']] as [Duration, string][]).map(([d, label]) => (
                <button key={d} type="button" onClick={() => onDuration(d)}
                  className={cn('flex-1 min-w-[48px] py-1.5 rounded-lg text-xs font-semibold border transition-colors',
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
          <span>{duration}s · {aspectRatio} · {model}</span>
        </div>

        <Button className="w-full" size="lg" disabled={!prompt.trim() || loading} loading={loading} onClick={onGenerate}>
          Generate Video
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
