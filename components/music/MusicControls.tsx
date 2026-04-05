import { Music, AlertCircle, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Toggle from '@/components/ui/Toggle'
import ContentIntentSimple from '@/components/shared/ContentIntentSimple'
import ModelSelector, { type MusicModel } from './ModelSelector'

type TabMode = 'create' | 'custom'

const GENRE_PILLS = [
  'Corporate', 'Uplifting', 'Cinematic', 'Electronic', 'Acoustic', 'Hip Hop',
]

interface Props {
  tab:             TabMode
  onTabChange:     (t: TabMode) => void
  description:     string
  onDescription:   (v: string) => void
  style:           string
  onStyle:         (v: string) => void
  lyrics:          string
  onLyrics:        (v: string) => void
  customStyle:     string
  onCustomStyle:   (v: string) => void
  instrumental:    boolean
  onInstrumental:  (v: boolean) => void
  model:           MusicModel
  onModel:         (m: MusicModel) => void
  intentOpen:      boolean
  onIntentOpen:    (v: boolean) => void
  selectedTopics:  string[]
  onToggleTopic:   (id: string) => void
  selectedPurpose: string
  onPurposeChange: (id: string) => void
  selectedCta:     string
  onCtaChange:     (id: string) => void
  canGenerate:     boolean
  loading:         boolean
  error:           string | null
  onGenerate:      () => void
}

export default function MusicControls({
  tab, onTabChange, description, onDescription, style, onStyle,
  lyrics, onLyrics, customStyle, onCustomStyle,
  instrumental, onInstrumental, model, onModel,
  intentOpen, onIntentOpen, selectedTopics, onToggleTopic,
  selectedPurpose, onPurposeChange, selectedCta, onCtaChange,
  canGenerate, loading, error, onGenerate,
}: Props) {
  return (
    <div className="w-[400px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden p-5 border-r border-gray-100 bg-white">
      <div className="space-y-4 pb-4">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Music size={16} className="text-brand-teal" />
            <h2 className="text-sm font-semibold text-brand-navy">Music Studio</h2>
          </div>
          <p className="text-[11px] text-gray-400">Generate AI music for your videos with Suno</p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50 gap-0.5">
          {(['create', 'custom'] as TabMode[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => onTabChange(t)}
              className={cn(
                'flex-1 py-1.5 rounded-md text-xs font-semibold transition-all capitalize',
                tab === t ? 'bg-white text-brand-azure shadow-sm' : 'text-gray-500 hover:text-brand-navy',
              )}
            >
              {t === 'create' ? 'Create' : 'Custom'}
            </button>
          ))}
        </div>

        <ContentIntentSimple
          open={intentOpen} onOpenChange={onIntentOpen}
          selectedTopics={selectedTopics} onToggleTopic={onToggleTopic}
          selectedPurpose={selectedPurpose} onPurposeChange={onPurposeChange}
          selectedCta={selectedCta} onCtaChange={onCtaChange}
        />

        {tab === 'create' && (
          <>
            <div className="bg-gray-50 rounded-card p-4">
              <Textarea
                label="Song Description"
                placeholder="An upbeat corporate background track for a business presentation, professional and motivating..."
                value={description}
                onChange={(e) => onDescription(e.target.value)}
                rows={4}
                maxLength={500}
                currentLength={description.length}
              />
            </div>
            <div className="bg-gray-50 rounded-card p-4">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Genre / Style</p>
              <div className="flex flex-wrap gap-1.5">
                {GENRE_PILLS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => onStyle(style === g ? '' : g)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                      style === g
                        ? 'bg-brand-azure text-white border-brand-azure'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === 'custom' && (
          <>
            {!instrumental && (
              <div className="bg-gray-50 rounded-card p-4">
                <Textarea
                  label="Lyrics"
                  placeholder="Enter your lyrics here..."
                  value={lyrics}
                  onChange={(e) => onLyrics(e.target.value)}
                  rows={5}
                  maxLength={500}
                  currentLength={lyrics.length}
                />
              </div>
            )}
            <div className="bg-gray-50 rounded-card p-4">
              <Textarea
                label="Style / Genre"
                placeholder="e.g. upbeat pop, acoustic guitar, lo-fi hip hop"
                value={customStyle}
                onChange={(e) => onCustomStyle(e.target.value)}
                rows={2}
                maxLength={100}
                currentLength={customStyle.length}
              />
            </div>
          </>
        )}

        {/* Instrumental toggle */}
        <div className="bg-gray-50 rounded-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-gray-700">Instrumental</p>
              <p className="text-[10px] text-gray-400">No vocals — music only</p>
            </div>
            <Toggle checked={instrumental} onChange={onInstrumental} color="bg-brand-teal" />
          </div>
        </div>

        <ModelSelector model={model} onChange={onModel} />

        <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
          <Zap size={11} className="text-brand-teal" />
          <span>{model} · {instrumental ? 'Instrumental' : 'With vocals'} · Suno</span>
        </div>

        <Button className="w-full" size="lg" disabled={!canGenerate || loading} loading={loading} onClick={onGenerate}>
          Generate Music
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
