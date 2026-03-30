'use client'

import { useState, useCallback } from 'react'
import { Clapperboard, AlertCircle, Play, Download, Zap } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useGenerate } from '@/hooks/useGenerate'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import type { BrandId } from '@/lib/brands'

// ─── Types ────────────────────────────────────────────────────────────────────

type Duration    = '5' | '10'
type AspectRatio = '16:9' | '9:16' | '1:1'

interface MotionAsset { id: string; url: string }
interface GenerateResponse { asset: MotionAsset }

interface RecentVideo { id: string; s3Url: string; metadata: unknown; createdAt: string }

// ─── Component ────────────────────────────────────────────────────────────────

export default function MotionClient({ recentVideos: initial }: { recentVideos: RecentVideo[] }) {
  const [imageUrl,      setImageUrl]      = useState('')
  const [imageValid,    setImageValid]    = useState(false)
  const [prompt,        setPrompt]        = useState('')
  const [duration,      setDuration]      = useState<Duration>('5')
  const [aspectRatio,   setAspectRatio]   = useState<AspectRatio>('16:9')
  const [brandId,       setBrandId]       = useState<BrandId>('lhcapital')
  const [recentVideos,  setRecentVideos]  = useState(initial)
  const [enhancing,     setEnhancing]     = useState(false)
  const [enhanceOn,     setEnhanceOn]     = useState(false)

  const { data, loading, error, generate } = useGenerate<object, GenerateResponse>({
    endpoint:  '/api/v1/generate/motion',
    onSuccess: (res) => {
      setRecentVideos((prev) => [
        {
          id:        res.asset.id,
          s3Url:     res.asset.url,
          metadata:  { imageUrl, prompt, source: 'motion' },
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ].slice(0, 12))
    },
  })

  const handleImageUrlChange = useCallback((val: string) => {
    setImageUrl(val)
    setImageValid(false)
    try {
      new URL(val)
      setImageValid(true)
    } catch {
      setImageValid(false)
    }
  }, [])

  const handleGenerate = useCallback(() => {
    if (!imageUrl.trim() || !prompt.trim()) return
    generate({ imageUrl: imageUrl.trim(), prompt: prompt.trim(), duration, aspectRatio, brandId })
  }, [imageUrl, prompt, duration, aspectRatio, brandId, generate])

  async function handleEnhancePrompt() {
    if (!prompt.trim()) return
    setEnhancing(true)
    try {
      const res  = await fetch('/api/v1/generate/enhance', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ prompt: prompt.trim(), type: 'video', brandId }),
      })
      const json = await res.json()
      if (json.prompt) setPrompt(json.prompt)
    } finally {
      setEnhancing(false)
    }
  }

  const canGenerate = imageUrl.trim().length > 0 && imageValid && prompt.trim().length > 0

  return (
    <div className="flex bg-app-bg">
      {/* ── Left: controls ─────────────────────────────────────────── */}
      <div className="w-[400px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden p-5 border-r border-gray-100 bg-white">
        <div className="space-y-4 pb-4">

          {/* Brand */}
          <div className="bg-gray-50 rounded-card p-4">
            <BrandSelector value={brandId} onChange={setBrandId} />
          </div>

          {/* Source Image */}
          <div className="bg-gray-50 rounded-card p-4 space-y-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Source Image</p>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-azure/30 focus:border-brand-azure placeholder-gray-300 transition"
              />
              {imageUrl && !imageValid && (
                <p className="text-[10px] text-red-500 mt-1">Enter a valid URL</p>
              )}
            </div>
            {imageValid && imageUrl && (
              <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Source image preview"
                  className="w-full object-cover max-h-48"
                  onError={() => setImageValid(false)}
                />
              </div>
            )}
          </div>

          {/* Motion Description */}
          <div className="bg-gray-50 rounded-card p-4">
            <Textarea
              label="Motion Description"
              placeholder="Describe the motion — camera movement, wind, water ripple, slow zoom in..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              maxLength={500}
              currentLength={prompt.length}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-700">Prompt Enhancer</p>
                <p className="text-[10px] text-gray-400">AI refines your motion description</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enhanceOn}
                disabled={prompt.trim().split(/\s+/).filter(Boolean).length < 3 || enhancing}
                title={prompt.trim().split(/\s+/).filter(Boolean).length < 3 ? 'Enter at least 3 words to enhance' : undefined}
                onClick={async () => {
                  if (enhanceOn || prompt.trim().split(/\s+/).filter(Boolean).length < 3) { setEnhanceOn(false); return }
                  setEnhanceOn(true)
                  await handleEnhancePrompt()
                  setEnhanceOn(false)
                }}
                className={cn(
                  'relative flex-shrink-0 w-9 h-5 rounded-full transition-colors disabled:opacity-40',
                  enhancing ? 'bg-brand-teal' : enhanceOn ? 'bg-brand-teal' : 'bg-gray-300',
                )}
              >
                {enhancing
                  ? <span className="absolute top-1 left-1 w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  : <span className={cn('absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', enhanceOn ? 'translate-x-4' : 'translate-x-0.5')} />
                }
              </button>
            </div>
          </div>

          {/* Duration + Aspect Ratio */}
          <div className="bg-gray-50 rounded-card p-4 space-y-3">
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Duration</p>
              <div className="flex gap-2">
                {(['5', '10'] as Duration[]).map((d) => (
                  <button key={d} type="button" onClick={() => setDuration(d)}
                    className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                      duration === d ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure'
                    )}>{d}s</button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Aspect Ratio</p>
              <div className="flex gap-2">
                {(['16:9', '9:16', '1:1'] as AspectRatio[]).map((a) => (
                  <button key={a} type="button" onClick={() => setAspectRatio(a)}
                    className={cn('flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors',
                      aspectRatio === a ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure'
                    )}>{a}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
            <Zap size={11} className="text-brand-teal" />
            <span>{duration}s · {aspectRatio} · Kling AI image-to-video</span>
          </div>

          <Button className="w-full" size="lg" disabled={!canGenerate || loading} loading={loading} onClick={handleGenerate}>
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

      {/* ── Right: results ─────────────────────────────────────────── */}
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
              <a href={data.asset.url} download className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline">
                <Download size={12} /> Download
              </a>
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
            <p className="text-sm text-gray-400 max-w-xs">Paste an image URL on the left, describe the motion, and click Animate.</p>
          </div>
        )}

        {recentVideos.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">Recent Motion Videos</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {recentVideos.map((v) => (
                <MotionThumb key={v.id} video={v} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function MotionThumb({ video }: { video: RecentVideo }) {
  const meta = video.metadata as { prompt?: string; imageUrl?: string } | null
  return (
    <div className="rounded-card overflow-hidden shadow-card bg-black group relative">
      <video src={video.s3Url} className="w-full aspect-video object-cover" preload="metadata" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
          <Play size={16} className="text-brand-navy ml-0.5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-white/70 text-[9px] truncate">{meta?.prompt}</p>
        <p className="text-white/40 text-[9px]">motion · {formatRelativeTime(video.createdAt)}</p>
      </div>
    </div>
  )
}
