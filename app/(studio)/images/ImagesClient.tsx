'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ImageIcon } from 'lucide-react'
import { useGenerate } from '@/hooks/useGenerate'
import ImagesControls, { type ModelId, type AspectRatio } from '@/components/images/ImagesControls'
import ImageCard from '@/components/images/ImageCard'
import RecentCard from '@/components/images/RecentCard'
import { TOPIC_TIERS, PURPOSES, CTA_OPTIONS, buildIntentString } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'

interface GeneratedAsset { id: string; url: string }
interface GenerateResponse { assets: GeneratedAsset[] }
interface RecentImage { id: string; s3Url: string; metadata: any; createdAt: string }

export default function ImagesClient({ recentImages: initial }: { recentImages: RecentImage[] }) {
  const router = useRouter()
  const [prompt,          setPrompt]          = useState('')
  const [model,           setModel]           = useState<ModelId>('flux-pro')
  const [aspect,          setAspect]          = useState<AspectRatio>('1:1')
  const [variations,      setVariations]      = useState(1)
  const [brandId,         setBrandId]         = useState<BrandId>('lhcapital')
  const [enhancePrompt,   setEnhancePrompt]   = useState(false)
  const [recentImages,    setRecentImages]    = useState(initial)
  const [copied,          setCopied]          = useState<string | null>(null)
  const [intentOpen,      setIntentOpen]      = useState(true)
  const [selectedTopics,  setSelectedTopics]  = useState<string[]>([])
  const [selectedPurpose, setSelectedPurpose] = useState('')
  const [selectedCta,     setSelectedCta]     = useState('')

  const { data, loading, error, generate } = useGenerate<object, GenerateResponse>({
    endpoint:  '/api/v1/generate/image',
    onSuccess: (res) => {
      const newItems: RecentImage[] = res.assets.map((a) => ({
        id: a.id, s3Url: a.url, metadata: { model, prompt, aspectRatio: aspect }, createdAt: new Date().toISOString(),
      }))
      setRecentImages((prev) => [...newItems, ...prev].slice(0, 20))
    },
  })

  const handleGenerate = useCallback(() => {
    if (!prompt.trim()) return
    const topicLabels  = selectedTopics.map((id) => TOPIC_TIERS.find((t) => t.id === id)?.label ?? id)
    const purposeLabel = PURPOSES.find((p) => p.id === selectedPurpose)?.label ?? selectedPurpose
    const ctaLabel     = CTA_OPTIONS.find((c) => c.id === selectedCta)?.label ?? ''
    const intent       = buildIntentString(topicLabels, purposeLabel, ctaLabel)
    const fullPrompt   = intent ? `${prompt.trim()}\n\nContent intent: ${intent}` : prompt.trim()
    generate({ prompt: fullPrompt, model, aspectRatio: aspect, variations, brandId, enhancePrompt })
  }, [prompt, model, aspect, variations, brandId, enhancePrompt, selectedTopics, selectedPurpose, selectedCta, generate])

  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url).then(() => { setCopied(id); setTimeout(() => setCopied(null), 2000) })
  }
  function sendToScheduler(url: string) { localStorage.setItem('schedulerDraft', JSON.stringify({ imageUrl: url })); router.push('/scheduler') }
  function sendToWriter(url: string)    { localStorage.setItem('writerDraft', JSON.stringify({ referenceImageUrl: url })); router.push('/writer') }

  const generated = data?.assets ?? []

  return (
    <div className="flex bg-app-bg">
      <ImagesControls
        brandId={brandId}           onBrandChange={setBrandId}
        prompt={prompt}             onPrompt={setPrompt}
        model={model}               onModel={setModel}
        aspect={aspect}             onAspect={setAspect}
        variations={variations}     onVariations={setVariations}
        enhancePrompt={enhancePrompt} onEnhancePrompt={setEnhancePrompt}
        intentOpen={intentOpen}     onIntentOpen={setIntentOpen}
        selectedTopics={selectedTopics}
        onToggleTopic={(id) => setSelectedTopics((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
        selectedPurpose={selectedPurpose} onPurposeChange={setSelectedPurpose}
        selectedCta={selectedCta} onCtaChange={setSelectedCta}
        loading={loading} error={error} onGenerate={handleGenerate}
      />

      <div className="flex-1 p-6">
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-[3px] border-brand-azure border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-brand-navy">Generating…</p>
            <p className="text-xs text-gray-400">Using {model} — usually 10–30 seconds</p>
          </div>
        )}

        {!loading && generated.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              {generated.map((img) => (
                <ImageCard key={img.id} id={img.id} url={img.url} copied={copied}
                  onCopy={copyUrl} onSchedule={sendToScheduler} onWriteCaption={sendToWriter} />
              ))}
            </div>
          </div>
        )}

        {!loading && generated.length === 0 && recentImages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-azure/10 flex items-center justify-center mb-4">
              <ImageIcon size={26} className="text-brand-azure" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">Generated images appear here</p>
            <p className="text-sm text-gray-400 max-w-xs">Enter a prompt on the left and click Generate to create new images.</p>
          </div>
        )}

        {recentImages.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
              {generated.length > 0 ? 'Your Images' : 'Recent'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentImages.map((img) => <RecentCard key={img.id} image={img} copied={copied} onCopy={copyUrl} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
