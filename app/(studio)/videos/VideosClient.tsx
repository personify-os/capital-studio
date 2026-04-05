'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Film, Download, Calendar, PenSquare } from 'lucide-react'
import { useGenerate } from '@/hooks/useGenerate'
import VideosControls, { type VideoModel, type Duration, type AspectRatio } from '@/components/videos/VideosControls'
import VideoThumb from '@/components/videos/VideoThumb'
import { TOPIC_TIERS, PURPOSES, CTA_OPTIONS, buildIntentString } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'
import type { VideoGenerateInput } from '@/lib/schemas/generate'

interface VideoAsset { id: string; url: string }
interface GenerateResponse { asset: VideoAsset }
interface RecentVideo { id: string; s3Url: string; metadata: any; createdAt: string }

export default function VideosClient({ recentVideos: initial }: { recentVideos: RecentVideo[] }) {
  const router = useRouter()
  const [prompt,          setPrompt]          = useState('')
  const [model,           setModel]           = useState<VideoModel>('kling-2.1')
  const [duration,        setDuration]        = useState<Duration>('5')
  const [aspectRatio,     setAspectRatio]     = useState<AspectRatio>('16:9')
  const [brandId,         setBrandId]         = useState<BrandId>('lhcapital')
  const [recentVideos,    setRecentVideos]    = useState(initial)
  const [intentOpen,      setIntentOpen]      = useState(true)
  const [selectedTopics,  setSelectedTopics]  = useState<string[]>([])
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [selectedCta,     setSelectedCta]     = useState('')
  const [enhancing,       setEnhancing]       = useState(false)
  const [enhanceError,    setEnhanceError]    = useState<string | null>(null)

  const { data, loading, error, generate } = useGenerate<VideoGenerateInput, GenerateResponse>({
    endpoint:  '/api/v1/generate/video',
    onSuccess: (res) => {
      setRecentVideos((prev) => [
        { id: res.asset.id, s3Url: res.asset.url, metadata: { model, prompt }, createdAt: new Date().toISOString() },
        ...prev,
      ].slice(0, 12))
    },
  })

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return
    const topicLabels  = selectedTopics.map((id) => TOPIC_TIERS.find((t) => t.id === id)?.label ?? id)
    const purposeLabel = PURPOSES.find((p) => p.id === selectedPurpose)?.label ?? selectedPurpose
    const ctaLabel     = CTA_OPTIONS.find((c) => c.id === selectedCta)?.label ?? ''
    const intent       = buildIntentString(topicLabels, purposeLabel, ctaLabel)
    const fullPrompt   = intent ? `${prompt.trim()}\n\nContent intent: ${intent}` : prompt.trim()
    generate({ prompt: fullPrompt, model, duration, aspectRatio, brandId })
  }, [prompt, model, duration, aspectRatio, brandId, selectedTopics, selectedPurpose, selectedCta, generate])

  async function handleEnhance() {
    if (!prompt.trim()) return
    setEnhancing(true); setEnhanceError(null)
    try {
      const res  = await fetch('/api/v1/generate/enhance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: prompt.trim(), type: 'video', brandId }) })
      const json = await res.json()
      if (!res.ok) { setEnhanceError(json.message ?? 'Enhancement failed'); return }
      if (json.prompt) setPrompt(json.prompt)
    } catch {
      setEnhanceError('Enhancement failed — please try again')
    } finally {
      setEnhancing(false)
    }
  }

  return (
    <div className="flex bg-app-bg">
      <VideosControls
        brandId={brandId}         onBrandChange={setBrandId}
        prompt={prompt}           onPrompt={setPrompt}
        model={model}             onModel={setModel}
        duration={duration}       onDuration={setDuration}
        aspectRatio={aspectRatio} onAspectRatio={setAspectRatio}
        enhancing={enhancing}     onEnhance={handleEnhance}
        intentOpen={intentOpen}   onIntentOpen={setIntentOpen}
        selectedTopics={selectedTopics}
        onToggleTopic={(id) => setSelectedTopics((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
        selectedPurpose={selectedPurpose} onPurposeChange={setSelectedPurpose}
        selectedCta={selectedCta} onCtaChange={setSelectedCta}
        loading={loading} error={enhanceError ?? error} onGenerate={handleGenerate}
      />

      <div className="flex-1 p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-[3px] border-brand-azure border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-brand-navy">Generating video…</p>
            <p className="text-xs text-gray-400">Using {model} — usually 30–90 seconds</p>
          </div>
        )}

        {!loading && data?.asset && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Generated</p>
              <div className="flex items-center gap-3">
                {prompt.trim() && (
                  <button type="button" onClick={() => { localStorage.setItem('writerDraft', JSON.stringify({ referenceContent: prompt.trim() })); router.push('/writer') }}
                    className="flex items-center gap-1.5 text-xs text-brand-teal hover:underline">
                    <PenSquare size={12} /> Write Caption
                  </button>
                )}
                <button type="button" onClick={() => { localStorage.setItem('schedulerDraft', JSON.stringify({ imageUrl: data.asset.url })); router.push('/scheduler') }}
                  className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline">
                  <Calendar size={12} /> Schedule
                </button>
                <a href={data.asset.url} download className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline">
                  <Download size={12} /> Download
                </a>
              </div>
            </div>
            <video src={data.asset.url} controls className="w-full rounded-card shadow-card-hover max-h-[500px] bg-black" />
          </div>
        )}

        {!loading && !data && recentVideos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-azure/10 flex items-center justify-center mb-4">
              <Film size={26} className="text-brand-azure" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">Generated videos appear here</p>
            <p className="text-sm text-gray-400 max-w-xs">Enter a prompt on the left and click Generate to create new videos.</p>
          </div>
        )}

        {recentVideos.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Your Videos</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recentVideos.map((v) => <VideoThumb key={v.id} video={v} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
