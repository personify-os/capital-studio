'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Clapperboard, Download, Calendar, PenSquare } from 'lucide-react'
import { useGenerate } from '@/hooks/useGenerate'
import MotionControls, { type Duration, type AspectRatio } from '@/components/motion/MotionControls'
import MotionThumb from '@/components/motion/MotionThumb'
import { TOPIC_TIERS, PURPOSES, CTA_OPTIONS, buildIntentString } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'
import type { MotionGenerateInput } from '@/lib/schemas/generate'

interface MotionAsset { id: string; url: string }
interface GenerateResponse { asset: MotionAsset }
interface RecentVideo { id: string; s3Url: string; metadata: unknown; createdAt: string }

export default function MotionClient({ recentVideos: initial }: { recentVideos: RecentVideo[] }) {
  const router = useRouter()
  const [imageUrl,        setImageUrl]        = useState('')
  const [imageValid,      setImageValid]      = useState(false)
  const [prompt,          setPrompt]          = useState('')
  const [duration,        setDuration]        = useState<Duration>('5')
  const [aspectRatio,     setAspectRatio]     = useState<AspectRatio>('16:9')
  const [brandId,         setBrandId]         = useState<BrandId>('lhcapital')
  const [recentVideos,    setRecentVideos]    = useState(initial)
  const [enhancing,       setEnhancing]       = useState(false)
  const [enhanceError,    setEnhanceError]    = useState<string | null>(null)
  const [uploading,       setUploading]       = useState(false)
  const [uploadError,     setUploadError]     = useState<string | null>(null)
  const [intentOpen,      setIntentOpen]      = useState(false)
  const [selectedTopics,  setSelectedTopics]  = useState<string[]>([])
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [selectedCta,     setSelectedCta]     = useState('')

  const { data, loading, error, generate } = useGenerate<MotionGenerateInput, GenerateResponse>({
    endpoint:  '/api/v1/generate/motion',
    onSuccess: (res) => {
      setRecentVideos((prev) => [
        { id: res.asset.id, s3Url: res.asset.url, metadata: { imageUrl, prompt, source: 'motion' }, createdAt: new Date().toISOString() },
        ...prev,
      ].slice(0, 12))
    },
  })

  const handleGenerate = useCallback(() => {
    if (!imageUrl.trim() || !prompt.trim()) return
    const topicLabels  = selectedTopics.map((id) => TOPIC_TIERS.find((t) => t.id === id)?.label ?? id)
    const purposeLabel = PURPOSES.find((p) => p.id === selectedPurpose)?.label ?? selectedPurpose
    const ctaLabel     = CTA_OPTIONS.find((c) => c.id === selectedCta)?.label ?? ''
    const intent       = buildIntentString(topicLabels, purposeLabel, ctaLabel)
    const fullPrompt   = intent ? `${prompt.trim()}\n\nContent intent: ${intent}` : prompt.trim()
    generate({ imageUrl: imageUrl.trim(), prompt: fullPrompt, duration, aspectRatio, brandId })
  }, [imageUrl, prompt, duration, aspectRatio, brandId, selectedTopics, selectedPurpose, selectedCta, generate])

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

  async function handlePhotoUpload(file: File) {
    setUploading(true); setUploadError(null)
    try {
      const form = new FormData()
      form.append('file', file)
      const res  = await fetch('/api/v1/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) { setUploadError(json.message ?? 'Upload failed'); return }
      if (json.url) { setImageUrl(json.url); setImageValid(true) }
    } catch {
      setUploadError('Upload failed — please try again')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex bg-app-bg">
      <MotionControls
        brandId={brandId}         onBrandChange={setBrandId}
        imageUrl={imageUrl}       onImageUrl={setImageUrl}
        imageValid={imageValid}   onImageValid={setImageValid}
        prompt={prompt}           onPrompt={setPrompt}
        duration={duration}       onDuration={setDuration}
        aspectRatio={aspectRatio} onAspectRatio={setAspectRatio}
        enhancing={enhancing}     onEnhance={handleEnhance}
        uploading={uploading}     onPhotoUpload={handlePhotoUpload}
        intentOpen={intentOpen}   onIntentOpen={setIntentOpen}
        selectedTopics={selectedTopics}
        onToggleTopic={(id) => setSelectedTopics((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
        selectedPurpose={selectedPurpose} onPurposeChange={setSelectedPurpose}
        selectedCta={selectedCta}         onCtaChange={setSelectedCta}
        loading={loading} error={uploadError ?? enhanceError ?? error} onGenerate={handleGenerate}
      />

      <div className="flex-1 p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-[3px] border-brand-azure border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-brand-navy">Animating image…</p>
            <p className="text-xs text-gray-400">Kling AI — usually 30–90 seconds</p>
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
              <Clapperboard size={26} className="text-brand-azure" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">Animated videos appear here</p>
            <p className="text-sm text-gray-400 max-w-xs">Upload an image or paste a URL on the left, describe the motion, and click Animate.</p>
          </div>
        )}

        {recentVideos.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Recent Motion Videos</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recentVideos.map((v) => <MotionThumb key={v.id} video={v} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
