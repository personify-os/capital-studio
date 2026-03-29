'use client'

import { useState, useCallback } from 'react'
import { Film, AlertCircle, ChevronDown, ChevronUp, Play, Download, Zap, Sparkles } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useGenerate } from '@/hooks/useGenerate'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import { TOPIC_PILLS, PURPOSE_PILLS, CTA_PILLS, buildIntentString } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'

// ─── Types ────────────────────────────────────────────────────────────────────

type VideoModel  = 'kling-3.0' | 'kling-2.1' | 'veo-3' | 'minimax' | 'hunyuan' | 'wan'
type Duration    = '5' | '10'
type AspectRatio = '16:9' | '9:16' | '1:1'

interface VideoAsset { id: string; url: string }
interface GenerateResponse { asset: VideoAsset }

interface RecentVideo { id: string; s3Url: string; metadata: any; createdAt: string }

// ─── Constants ────────────────────────────────────────────────────────────────

const MODELS: { id: VideoModel; name: string; note: string; badge?: string }[] = [
  { id: 'kling-3.0', name: 'Kling 3.0',      note: 'Latest · best quality',  badge: 'NEW' },
  { id: 'kling-2.1', name: 'Kling 2.1',      note: 'Cinematic quality',      badge: 'TOP' },
  { id: 'veo-3',     name: 'Veo 3',          note: 'Google DeepMind',        badge: 'NEW' },
  { id: 'minimax',   name: 'MiniMax Video',   note: 'Vivid & dynamic' },
  { id: 'hunyuan',   name: 'HunyuanVideo',    note: 'Detail-rich scenes' },
  { id: 'wan',       name: 'Wan T2V',         note: 'Fast generation' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function VideosClient({ recentVideos: initial }: { recentVideos: RecentVideo[] }) {
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
  const [enhanceOn,       setEnhanceOn]       = useState(false)

  const { data, loading, error, generate } = useGenerate<object, GenerateResponse>({
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
    const intent    = buildIntentString(selectedTopics, selectedPurpose, selectedCta)
    const fullPrompt = intent ? `${prompt.trim()}\n\nContent intent: ${intent}` : prompt.trim()
    generate({ prompt: fullPrompt, model, duration, aspectRatio, brandId })
  }, [prompt, model, duration, aspectRatio, brandId, selectedTopics, selectedPurpose, selectedCta, generate])

  function toggleTopic(t: string) {
    setSelectedTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

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

  return (
    <div className="flex bg-app-bg">
      {/* ── Left: controls ─────────────────────────────────────────── */}
      <div className="w-[400px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden p-5 border-r border-gray-100 bg-white">
        <div className="space-y-4 pb-4">

          {/* Content Intent */}
          <div className="bg-gray-50 rounded-card p-4">
            <button
              type="button"
              onClick={() => setIntentOpen((v) => !v)}
              className="flex items-center justify-between w-full"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Content Intent</span>
                <span className="text-[9px] text-gray-400">— helps AI create targeted content</span>
              </div>
              {intentOpen ? <ChevronUp size={13} className="text-gray-400" /> : <ChevronDown size={13} className="text-gray-400" />}
            </button>

            {intentOpen && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Topic — What is this about?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPIC_PILLS.map((t) => (
                      <button key={t} type="button" onClick={() => toggleTopic(t)}
                        className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                          selectedTopics.includes(t) ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure'
                        )}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Purpose</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PURPOSE_PILLS.map((p) => (
                      <button key={p.label} type="button" onClick={() => setSelectedPurpose((v) => v === p.label ? '' : p.label)}
                        className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                          selectedPurpose === p.label ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure'
                        )}>{p.emoji} {p.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Call to Action <span className="normal-case font-normal text-gray-400">(optional)</span></p>
                  <div className="flex flex-wrap gap-1.5">
                    {CTA_PILLS.map((c) => (
                      <button key={c} type="button" onClick={() => setSelectedCta((v) => v === c ? '' : c)}
                        className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                          selectedCta === c ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure'
                        )}>{c}</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Brand */}
          <div className="bg-gray-50 rounded-card p-4">
            <BrandSelector value={brandId} onChange={setBrandId} />
          </div>

          {/* Prompt */}
          <div className="bg-gray-50 rounded-card p-4">
            <Textarea
              label="What would you like to create?"
              placeholder="Describe the video — e.g. 'A confident business executive presenting employee benefits solutions in a modern boardroom, cinematic lighting'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              maxLength={1000}
              currentLength={prompt.length}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-700">Prompt Enhancer</p>
                <p className="text-[10px] text-gray-400">AI refines your video description</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enhanceOn}
                disabled={!prompt.trim() || enhancing}
                onClick={async () => {
                  if (enhanceOn || !prompt.trim()) { setEnhanceOn(false); return }
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

          {/* Model */}
          <div className="bg-gray-50 rounded-card p-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Model</p>
            <div className="grid grid-cols-2 gap-2">
              {MODELS.map((m) => (
                <button key={m.id} type="button" onClick={() => setModel(m.id)}
                  className={cn('relative p-3 rounded-lg border-2 text-left transition-all',
                    model === m.id ? 'border-brand-azure bg-brand-azure/5' : 'border-gray-200 hover:border-brand-light'
                  )}
                >
                  {m.badge && <span className="absolute top-1.5 right-1.5 bg-brand-azure text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{m.badge}</span>}
                  <p className={cn('text-xs font-semibold', model === m.id ? 'text-brand-azure' : 'text-brand-navy')}>{m.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{m.note}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Duration + Aspect */}
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
            <span>{duration}s · {aspectRatio} · {model}</span>
          </div>
          <Button className="w-full" size="lg" disabled={!prompt.trim() || loading} loading={loading} onClick={handleGenerate}>
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

      {/* ── Right: results ─────────────────────────────────────────── */}
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
              {recentVideos.map((v) => (
                <VideoThumb key={v.id} video={v} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function VideoThumb({ video }: { video: RecentVideo }) {
  const meta = video.metadata as { model?: string; prompt?: string } | null
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
        <p className="text-white/40 text-[9px]">{meta?.model} · {formatRelativeTime(video.createdAt)}</p>
      </div>
    </div>
  )
}
