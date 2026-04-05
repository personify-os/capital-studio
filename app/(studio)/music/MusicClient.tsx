'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Music, Download, PenSquare, Calendar } from 'lucide-react'
import { useGenerate } from '@/hooks/useGenerate'
import MusicControls from '@/components/music/MusicControls'
import TrackRow, { type RecentTrack } from '@/components/music/TrackRow'
import { type MusicModel } from '@/components/music/ModelSelector'
import type { MusicGenerateInput } from '@/lib/schemas/generate'
import { TOPIC_TIERS, PURPOSES, CTA_OPTIONS, buildIntentString } from '@/lib/content-intent'

type TabMode = 'create' | 'custom'

interface MusicAsset { id: string; url: string; title?: string }
interface GenerateResponse { asset: MusicAsset }

export default function MusicClient({ recentTracks: initial }: { recentTracks: RecentTrack[] }) {
  const router = useRouter()
  const [tab,          setTab]          = useState<TabMode>('create')
  const [description,  setDescription]  = useState('')
  const [style,        setStyle]        = useState('')
  const [lyrics,       setLyrics]       = useState('')
  const [customStyle,  setCustomStyle]  = useState('')
  const [instrumental,    setInstrumental]    = useState(false)
  const [model,           setModel]           = useState<MusicModel>('chirp-v4')
  const [recentTracks,    setRecentTracks]    = useState(initial)
  const [intentOpen,      setIntentOpen]      = useState(false)
  const [selectedTopics,  setSelectedTopics]  = useState<string[]>([])
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [selectedCta,     setSelectedCta]     = useState('')

  const musicTracks = recentTracks

  const { data, loading, error, generate } = useGenerate<MusicGenerateInput, GenerateResponse>({
    endpoint:  '/api/v1/generate/music',
    onSuccess: (res) => {
      setRecentTracks((prev) => [
        {
          id:        res.asset.id,
          s3Url:     res.asset.url,
          metadata:  { source: 'music', title: res.asset.title, model, description: tab === 'create' ? description : undefined, style: tab === 'create' ? style : customStyle, instrumental },
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 20))
    },
  })

  const handleGenerate = useCallback(() => {
    const topicLabels  = selectedTopics.map((id) => TOPIC_TIERS.find((t) => t.id === id)?.label ?? id)
    const purposeLabel = PURPOSES.find((p) => p.id === selectedPurpose)?.label ?? selectedPurpose
    const ctaLabel     = CTA_OPTIONS.find((c) => c.id === selectedCta)?.label ?? ''
    const intent       = buildIntentString(topicLabels, purposeLabel, ctaLabel)

    if (tab === 'create') {
      if (!description.trim()) return
      const baseDesc = description.trim()
      const fullDesc = intent ? `${baseDesc}\n\nContent intent: ${intent}` : baseDesc
      generate({ description: fullDesc, style: style || undefined, instrumental, model })
    } else {
      const desc = instrumental ? (customStyle.trim() || 'Instrumental track') : (lyrics.trim() || 'Background music')
      const fullDesc = intent ? `${desc}\n\nContent intent: ${intent}` : desc
      generate({ description: fullDesc, style: customStyle.trim() || undefined, instrumental, model })
    }
  }, [tab, description, style, lyrics, customStyle, instrumental, model, selectedTopics, selectedPurpose, selectedCta, generate])

  const canGenerate = tab === 'create'
    ? description.trim().length > 0
    : (instrumental || lyrics.trim().length > 0)

  return (
    <div className="flex bg-app-bg">
      <MusicControls
        tab={tab}             onTabChange={setTab}
        description={description}   onDescription={setDescription}
        style={style}         onStyle={setStyle}
        lyrics={lyrics}       onLyrics={setLyrics}
        customStyle={customStyle}   onCustomStyle={setCustomStyle}
        instrumental={instrumental} onInstrumental={setInstrumental}
        model={model}         onModel={setModel}
        intentOpen={intentOpen}     onIntentOpen={setIntentOpen}
        selectedTopics={selectedTopics}
        onToggleTopic={(id) => setSelectedTopics((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
        selectedPurpose={selectedPurpose} onPurposeChange={setSelectedPurpose}
        selectedCta={selectedCta}         onCtaChange={setSelectedCta}
        canGenerate={canGenerate}
        loading={loading}
        error={error}
        onGenerate={handleGenerate}
      />

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
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const ref = tab === 'create' ? description.trim() : (customStyle.trim() || lyrics.trim())
                    if (!ref) return
                    localStorage.setItem('writerDraft', JSON.stringify({ referenceContent: `Music track: ${ref}` }))
                    router.push('/writer')
                  }}
                  className="flex items-center gap-1.5 text-xs text-brand-teal hover:underline"
                >
                  <PenSquare size={12} /> Write Caption
                </button>
                <button type="button" onClick={() => { localStorage.setItem('schedulerDraft', JSON.stringify({ caption: data.asset.title ?? description.trim() })); router.push('/scheduler') }}
                  className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline">
                  <Calendar size={12} /> Schedule
                </button>
                <a href={data.asset.url} download className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline">
                  <Download size={12} /> Download MP3
                </a>
              </div>
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
              {musicTracks.map((t) => <TrackRow key={t.id} track={t} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
