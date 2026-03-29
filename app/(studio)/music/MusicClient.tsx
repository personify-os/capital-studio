'use client'

import { useState, useCallback } from 'react'
import { Music, AlertCircle, Download, Zap } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useGenerate } from '@/hooks/useGenerate'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'

// ─── Types ────────────────────────────────────────────────────────────────────

type MusicModel = 'chirp-v4' | 'chirp-v3-5' | 'chirp-v3'
type TabMode    = 'create' | 'custom'

interface MusicAsset { id: string; url: string; title?: string }
interface GenerateResponse { asset: MusicAsset }
interface RecentTrack { id: string; s3Url: string; metadata: any; createdAt: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const GENRE_PILLS = [
  'Corporate', 'Uplifting', 'Cinematic', 'Electronic', 'Acoustic', 'Hip Hop',
]

const MODELS: { id: MusicModel; badge?: string; name: string; note: string }[] = [
  { id: 'chirp-v4',   badge: 'Latest', name: 'V4',   note: 'Superior musical expression, up to 4 min' },
  { id: 'chirp-v3-5', name: 'V3.5',   note: 'Enhanced quality, up to 8 min' },
  { id: 'chirp-v3',   name: 'V3',     note: 'Broader capabilities, up to 8 min' },
]

// ─── Toggle Switch ─────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative flex-shrink-0 w-9 h-5 rounded-full transition-colors',
        checked ? 'bg-brand-teal' : 'bg-gray-300',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
          checked ? 'translate-x-4' : 'translate-x-0.5',
        )}
      />
    </button>
  )
}

// ─── Model Selector ────────────────────────────────────────────────────────────

function ModelSelector({ model, onChange }: { model: MusicModel; onChange: (m: MusicModel) => void }) {
  return (
    <div className="bg-gray-50 rounded-card p-4">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Model</p>
      <div className="space-y-2">
        {MODELS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onChange(m.id)}
            className={cn(
              'relative w-full p-3 rounded-lg border-2 text-left transition-all',
              model === m.id
                ? 'border-brand-azure bg-brand-azure/5'
                : 'border-gray-200 hover:border-brand-light',
            )}
          >
            {m.badge && (
              <span className="absolute top-1.5 right-1.5 bg-brand-azure text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                {m.badge}
              </span>
            )}
            <p className={cn('text-xs font-semibold', model === m.id ? 'text-brand-azure' : 'text-brand-navy')}>
              {m.name}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">{m.note}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MusicClient({ recentTracks: initial }: { recentTracks: RecentTrack[] }) {
  const [tab,           setTab]           = useState<TabMode>('create')
  const [description,   setDescription]   = useState('')
  const [style,         setStyle]         = useState('')
  const [lyrics,        setLyrics]        = useState('')
  const [customStyle,   setCustomStyle]   = useState('')
  const [instrumental,  setInstrumental]  = useState(false)
  const [model,         setModel]         = useState<MusicModel>('chirp-v4')
  const [recentTracks,  setRecentTracks]  = useState(initial)

  const musicTracks = recentTracks.filter(
    (t) => (t.metadata as any)?.source === 'music',
  )

  const { data, loading, error, generate } = useGenerate<object, GenerateResponse>({
    endpoint:  '/api/v1/generate/music',
    onSuccess: (res) => {
      setRecentTracks((prev) => [
        {
          id:        res.asset.id,
          s3Url:     res.asset.url,
          metadata:  {
            source:       'music',
            title:        res.asset.title,
            model,
            description:  tab === 'create' ? description : undefined,
            style:        tab === 'create' ? style : customStyle,
            instrumental,
          },
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20))
    },
  })

  const handleGenerate = useCallback(() => {
    if (tab === 'create') {
      if (!description.trim()) return
      generate({ description: description.trim(), style: style || undefined, instrumental, model })
    } else {
      const desc = instrumental
        ? (customStyle.trim() || 'Instrumental track')
        : (lyrics.trim() || 'Background music')
      generate({
        description:  desc,
        style:        customStyle.trim() || undefined,
        instrumental,
        model,
      })
    }
  }, [tab, description, style, lyrics, customStyle, instrumental, model, generate])

  const canGenerate = tab === 'create'
    ? description.trim().length > 0
    : (instrumental || lyrics.trim().length > 0)

  return (
    <div className="flex bg-app-bg">

      {/* ── Left: controls ──────────────────────────────────────────── */}
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
                onClick={() => setTab(t)}
                className={cn(
                  'flex-1 py-1.5 rounded-md text-xs font-semibold transition-all capitalize',
                  tab === t
                    ? 'bg-white text-brand-azure shadow-sm'
                    : 'text-gray-500 hover:text-brand-navy',
                )}
              >
                {t === 'create' ? 'Create' : 'Custom'}
              </button>
            ))}
          </div>

          {tab === 'create' && (
            <>
              {/* Description */}
              <div className="bg-gray-50 rounded-card p-4">
                <Textarea
                  label="Song Description"
                  placeholder="An upbeat corporate background track for a business presentation, professional and motivating..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  maxLength={500}
                  currentLength={description.length}
                />
              </div>

              {/* Genre pills */}
              <div className="bg-gray-50 rounded-card p-4">
                <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Genre / Style</p>
                <div className="flex flex-wrap gap-1.5">
                  {GENRE_PILLS.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setStyle((prev) => prev === g ? '' : g)}
                      className={cn(
                        'px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
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
              {/* Lyrics */}
              {!instrumental && (
                <div className="bg-gray-50 rounded-card p-4">
                  <Textarea
                    label="Lyrics"
                    placeholder="Enter your lyrics here..."
                    value={lyrics}
                    onChange={(e) => setLyrics(e.target.value)}
                    rows={5}
                    maxLength={500}
                    currentLength={lyrics.length}
                  />
                </div>
              )}

              {/* Style / Genre */}
              <div className="bg-gray-50 rounded-card p-4">
                <Textarea
                  label="Style / Genre"
                  placeholder="e.g. upbeat pop, acoustic guitar, lo-fi hip hop"
                  value={customStyle}
                  onChange={(e) => setCustomStyle(e.target.value)}
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
              <Toggle checked={instrumental} onChange={setInstrumental} />
            </div>
          </div>

          {/* Model selector */}
          <ModelSelector model={model} onChange={setModel} />

          {/* Summary line */}
          <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
            <Zap size={11} className="text-brand-teal" />
            <span>{model} · {instrumental ? 'Instrumental' : 'With vocals'} · Suno</span>
          </div>

          <Button
            className="w-full"
            size="lg"
            disabled={!canGenerate || loading}
            loading={loading}
            onClick={handleGenerate}
          >
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

      {/* ── Right: results ──────────────────────────────────────────── */}
      <div className="flex-1 p-6">

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-[3px] border-brand-azure border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-brand-navy">Generating music…</p>
            <p className="text-xs text-gray-400">Suno is composing your track — usually 20–60 seconds</p>
          </div>
        )}

        {!loading && data?.asset && (
          <div className="mb-8 bg-white rounded-card shadow-card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Generated</p>
              <a
                href={data.asset.url}
                download
                className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline"
              >
                <Download size={12} /> Download MP3
              </a>
            </div>
            {data.asset.title && (
              <p className="text-sm font-semibold text-brand-navy mb-3">{data.asset.title}</p>
            )}
            <audio src={data.asset.url} controls className="w-full" />
          </div>
        )}

        {!loading && !data && musicTracks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-teal/10 flex items-center justify-center mb-4">
              <Music size={26} className="text-brand-teal" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">No songs yet</p>
            <p className="text-sm text-gray-400 max-w-xs">
              Describe the vibe or style on the left and click Generate to create your first track.
            </p>
          </div>
        )}

        {musicTracks.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
              Your Tracks
              <span className="ml-2 normal-case font-normal text-gray-300">({musicTracks.length})</span>
            </p>
            <div className="space-y-3 max-w-2xl">
              {musicTracks.map((t) => (
                <TrackRow key={t.id} track={t} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Track Row ────────────────────────────────────────────────────────────────

function TrackRow({ track }: { track: RecentTrack }) {
  const meta = track.metadata as {
    title?: string
    model?: string
    description?: string
    style?: string
    instrumental?: boolean
    source?: string
  } | null

  const displayTitle = meta?.title || meta?.description?.slice(0, 60) || 'Untitled Track'

  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-brand-navy truncate">{displayTitle}</p>
          <div className="flex items-center gap-2 mt-1">
            {meta?.model && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-badge bg-brand-azure/10 text-brand-azure text-[9px] font-semibold uppercase tracking-wide">
                {meta.model}
              </span>
            )}
            {meta?.instrumental && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-badge bg-gray-100 text-gray-500 text-[9px] font-medium">
                Instrumental
              </span>
            )}
            <span className="text-[10px] text-gray-400">{formatRelativeTime(track.createdAt)}</span>
          </div>
        </div>
        <a href={track.s3Url} download className="text-brand-azure hover:text-brand-navy flex-shrink-0">
          <Download size={14} />
        </a>
      </div>
      <audio src={track.s3Url} controls className="w-full h-8" style={{ height: '32px' }} />
    </div>
  )
}
