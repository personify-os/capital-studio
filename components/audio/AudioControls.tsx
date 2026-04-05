import { AlertCircle, Zap, Sparkles, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import ContentIntentSimple from '@/components/shared/ContentIntentSimple'
import ContentPillarSelector from '@/components/writer/ContentPillarSelector'
import type { BrandId } from '@/lib/brands'
import type { ContentPillar } from '@/components/writer/types'
import type { ScriptDuration } from './types'

const SCRIPT_DURATIONS: { value: ScriptDuration; label: string }[] = [
  { value: '30',  label: '30s' }, { value: '60',  label: '60s' },
  { value: '90',  label: '90s' }, { value: '120', label: '2 min' },
]

export const VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel',  note: 'Professional female, calm & clear' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh',    note: 'Professional male, authoritative' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi',    note: 'Confident female, strong delivery' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni',  note: 'Conversational male, warm tone' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli',    note: 'Friendly female, upbeat energy' },
]

interface Props {
  brandId:         BrandId
  onBrandChange:   (id: BrandId) => void
  script:          string
  onScript:        (v: string) => void
  voiceId:         string
  onVoiceId:       (id: string) => void
  scriptTopic:     string
  onScriptTopic:   (v: string) => void
  scriptDuration:  ScriptDuration
  onScriptDuration:(d: ScriptDuration) => void
  scriptOpen:      boolean
  onScriptOpen:    (v: boolean) => void
  scriptLoading:    boolean
  scriptError:      string | null
  onGenerateScript: () => void
  scriptPillar:     ContentPillar | ''
  onScriptPillar:   (v: ContentPillar | '') => void
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

export default function AudioControls({
  brandId, onBrandChange, script, onScript, voiceId, onVoiceId,
  scriptTopic, onScriptTopic, scriptDuration, onScriptDuration,
  scriptOpen, onScriptOpen, scriptLoading, scriptError, onGenerateScript,
  scriptPillar, onScriptPillar,
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

        {/* AI Script Writer */}
        <div className="bg-gray-50 rounded-card p-4">
          <button type="button" onClick={() => onScriptOpen(!scriptOpen)} className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Sparkles size={12} className="text-brand-teal" />
              <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">AI Script Writer</span>
              <span className="text-[9px] text-gray-400">— generate from a topic</span>
            </div>
            {scriptOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
          </button>
          {scriptOpen && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Topic</label>
                <input type="text" value={scriptTopic} onChange={(e) => onScriptTopic(e.target.value)}
                  placeholder="e.g. How the SIMRP saves $550 per employee per year"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Target Length</label>
                <div className="flex gap-1.5">
                  {SCRIPT_DURATIONS.map((d) => (
                    <button key={d.value} type="button" onClick={() => onScriptDuration(d.value)}
                      className={cn('flex-1 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors',
                        scriptDuration === d.value ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure',
                      )}>{d.label}</button>
                  ))}
                </div>
              </div>
              <ContentPillarSelector value={scriptPillar} onChange={onScriptPillar} />
              <button type="button" disabled={!scriptTopic.trim() || scriptLoading} onClick={onGenerateScript}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-brand-teal text-white text-xs font-semibold hover:bg-brand-navy transition-colors disabled:opacity-50">
                {scriptLoading
                  ? <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />Writing script…</>
                  : <><Sparkles size={12} />Generate Script</>
                }
              </button>
              {script && <p className="text-[10px] text-brand-teal font-medium">Script generated — edit below as needed</p>}
              {scriptError && <p className="text-[10px] text-red-500">{scriptError}</p>}
            </div>
          )}
        </div>

        <div className="bg-gray-50 rounded-card p-4">
          <Textarea label="Script" placeholder="Enter the text you want read aloud…"
            value={script} onChange={(e) => onScript(e.target.value)} rows={6} maxLength={5000} currentLength={script.length} />
          <p className="text-[10px] text-gray-400 mt-2">~{Math.ceil(script.split(/\s+/).filter(Boolean).length / 140)} min read · {script.length} chars</p>
        </div>

        <div className="bg-gray-50 rounded-card p-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Voice</p>
          <div className="space-y-1.5">
            {VOICES.map((v) => (
              <button key={v.id} type="button" onClick={() => onVoiceId(v.id)}
                className={cn('w-full text-left px-3 py-2.5 rounded-lg border-2 transition-all',
                  voiceId === v.id ? 'border-brand-azure bg-brand-azure/5' : 'border-gray-200 hover:border-brand-light',
                )}>
                <p className={cn('text-xs font-semibold', voiceId === v.id ? 'text-brand-azure' : 'text-brand-navy')}>{v.name}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{v.note}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
          <Zap size={11} className="text-brand-teal" />
          <span>{VOICES.find((v) => v.id === voiceId)?.name ?? 'Voice'} · ElevenLabs</span>
        </div>

        <Button className="w-full" size="lg" disabled={!script.trim() || loading} loading={loading} onClick={onGenerate}>
          Generate Voiceover
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
