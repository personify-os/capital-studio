'use client'

import { useState, useCallback } from 'react'
import { Download, Copy, Check, AlertCircle, ImageIcon, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { useGenerate } from '@/hooks/useGenerate'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import { TOPIC_PILLS, PURPOSE_PILLS, CTA_PILLS, buildIntentString } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'

// ─── Types ────────────────────────────────────────────────────────────────────

type ModelId     = 'flux-pro' | 'fal-flux' | 'ideogram-v3' | 'recraft-v3' | 'imagen-4' | 'dall-e-3' | 'seedream-v3' | 'realistic-vision' | 'nano-banana-2' | 'nano-banana-pro' | 'gemini-flash' | 'gemini-flash-pro'
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:5'

interface GeneratedAsset { id: string; url: string }
interface GenerateResponse { assets: GeneratedAsset[] }

interface RecentImage {
  id: string; s3Url: string; metadata: any; createdAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODELS: { id: ModelId; name: string; note: string; badge?: string }[] = [
  { id: 'flux-pro',         name: 'Flux Pro 1.1',    note: 'Best overall quality',         badge: 'TOP' },
  { id: 'ideogram-v3',      name: 'Ideogram V3',     note: 'Best text-in-image',            badge: 'NEW' },
  { id: 'recraft-v3',       name: 'Recraft V3',      note: 'Vector & illustration',         badge: 'NEW' },
  { id: 'imagen-4',         name: 'Imagen 4',        note: "Google's photorealistic",       badge: 'NEW' },
  { id: 'nano-banana-2',    name: 'Nano Banana 2',   note: 'High-quality creative',         badge: 'NEW' },
  { id: 'nano-banana-pro',  name: 'Nano Banana Pro', note: 'Pro creative generation',       badge: 'NEW' },
  { id: 'gemini-flash',     name: 'Gemini Flash',    note: "Google's fast model",           badge: 'NEW' },
  { id: 'gemini-flash-pro', name: 'Gemini Flash Pro',note: "Google's pro model",            badge: 'NEW' },
  { id: 'realistic-vision', name: 'Realistic Vision',note: 'Photorealistic people & scenes' },
  { id: 'seedream-v3',      name: 'Seedream V3',     note: 'Fast 4K generation' },
  { id: 'fal-flux',         name: 'Flux Schnell',    note: 'Fastest generation' },
  { id: 'dall-e-3',         name: 'DALL-E 3',        note: "OpenAI's creative model" },
]

const ASPECTS: { value: AspectRatio; label: string }[] = [
  { value: '1:1',  label: 'Square 1:1' },
  { value: '16:9', label: 'Landscape 16:9' },
  { value: '9:16', label: 'Portrait 9:16' },
  { value: '4:5',  label: '4:5 Feed' },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function ImagesClient({ recentImages: initial }: { recentImages: RecentImage[] }) {
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
    const intent     = buildIntentString(selectedTopics, selectedPurpose, selectedCta)
    const fullPrompt = intent ? `${prompt.trim()}\n\nContent intent: ${intent}` : prompt.trim()
    generate({ prompt: fullPrompt, model, aspectRatio: aspect, variations, brandId, enhancePrompt })
  }, [prompt, model, aspect, variations, brandId, enhancePrompt, selectedTopics, selectedPurpose, selectedCta, generate])

  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function toggleTopic(t: string) {
    setSelectedTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t])
  }

  const generated = data?.assets ?? []

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
              {intentOpen
                ? <ChevronUp size={13} className="text-gray-400" />
                : <ChevronDown size={13} className="text-gray-400" />}
            </button>

            {intentOpen && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Topic — What is this content about?</p>
                  <div className="flex flex-wrap gap-1.5">
                    {TOPIC_PILLS.map((t) => (
                      <button key={t} type="button" onClick={() => toggleTopic(t)}
                        className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                          selectedTopics.includes(t)
                            ? 'bg-brand-azure text-white border-brand-azure'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
                        )}
                      >{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Purpose</p>
                  <div className="flex flex-wrap gap-1.5">
                    {PURPOSE_PILLS.map((p) => (
                      <button key={p.label} type="button" onClick={() => setSelectedPurpose((v) => v === p.label ? '' : p.label)}
                        className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                          selectedPurpose === p.label
                            ? 'bg-brand-azure text-white border-brand-azure'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
                        )}
                      >{p.emoji} {p.label}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Call to Action <span className="normal-case font-normal text-gray-400">(optional)</span>
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {CTA_PILLS.map((c) => (
                      <button key={c} type="button" onClick={() => setSelectedCta((v) => v === c ? '' : c)}
                        className={cn('px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all',
                          selectedCta === c
                            ? 'bg-brand-azure text-white border-brand-azure'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
                        )}
                      >{c}</button>
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
              label="Prompt"
              placeholder="Describe the image — e.g. 'A professional executive reviewing employee benefits documents at a modern office, cinematic lighting'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={4}
              maxLength={600}
              currentLength={prompt.length}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div>
                <p className="text-xs font-medium text-gray-700">Prompt Enhancer</p>
                <p className="text-[10px] text-gray-400">Adds brand visual context to your prompt</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={enhancePrompt}
                onClick={() => setEnhancePrompt((v) => !v)}
                className={cn(
                  'relative flex-shrink-0 w-9 h-5 rounded-full transition-colors overflow-hidden',
                  enhancePrompt ? 'bg-brand-teal' : 'bg-gray-300',
                )}
              >
                <span className={cn(
                  'absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform',
                  enhancePrompt ? 'translate-x-4' : 'translate-x-0.5',
                )} />
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
                    model === m.id ? 'border-brand-azure bg-brand-azure/5' : 'border-gray-200 hover:border-brand-light',
                  )}
                >
                  {m.badge && (
                    <span className="absolute top-1.5 right-1.5 bg-brand-azure text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                      {m.badge}
                    </span>
                  )}
                  <p className={cn('text-xs font-semibold', model === m.id ? 'text-brand-azure' : 'text-brand-navy')}>{m.name}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{m.note}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect ratio */}
          <div className="bg-gray-50 rounded-card p-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Aspect Ratio</p>
            <div className="flex flex-wrap gap-2">
              {ASPECTS.map((a) => (
                <button key={a.value} type="button" onClick={() => setAspect(a.value)}
                  className={cn('px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                    aspect === a.value
                      ? 'bg-brand-azure text-white border-brand-azure'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
                  )}
                >{a.label}</button>
              ))}
            </div>
          </div>

          {/* Variations */}
          <div className="bg-gray-50 rounded-card p-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Variations</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((v) => (
                <button key={v} type="button" onClick={() => setVariations(v)}
                  className={cn('w-10 h-9 rounded-lg text-sm font-semibold border transition-colors',
                    variations === v
                      ? 'bg-brand-azure text-white border-brand-azure'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure',
                  )}
                >{v}</button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400 px-1">
            <Zap size={11} className="text-brand-teal" />
            <span>{variations} image{variations > 1 ? 's' : ''} · {model}</span>
          </div>
          <Button
            className="w-full" size="lg"
            disabled={!prompt.trim() || loading} loading={loading}
            onClick={handleGenerate}
          >
            Generate Image{variations > 1 ? 's' : ''}
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
            <p className="text-sm font-medium text-brand-navy">Generating…</p>
            <p className="text-xs text-gray-400">Using {model} — usually 10–30 seconds</p>
          </div>
        )}

        {!loading && generated.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-2 gap-4">
              {generated.map((img) => (
                <ImageCard key={img.id} id={img.id} url={img.url} copied={copied} onCopy={copyUrl} />
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
            <p className="text-sm text-gray-400 max-w-xs">
              Enter a prompt on the left and click Generate to create new images.
            </p>
          </div>
        )}

        {recentImages.length > 0 && (
          <>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-4">
              {generated.length > 0 ? 'Your Images' : 'Recent'}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {recentImages.map((img) => (
                <RecentCard key={img.id} image={img} copied={copied} onCopy={copyUrl} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ImageCard({ id, url, copied, onCopy }: { id: string; url: string; copied: string | null; onCopy: (id: string, url: string) => void }) {
  return (
    <div className="relative group rounded-card overflow-hidden bg-gray-100 aspect-square shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Generated" className="w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-3">
        <button type="button" onClick={() => window.open(url, '_blank', 'noopener')}
          className="flex items-center gap-1.5 bg-white text-brand-navy text-xs font-semibold px-4 py-2 rounded-full hover:bg-gray-50 transition-colors w-full justify-center">
          <Download size={12} /> Download
        </button>
        <button type="button" onClick={() => onCopy(id, url)}
          className="flex items-center gap-1.5 bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full hover:bg-white/30 transition-colors w-full justify-center">
          {copied === id ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy URL</>}
        </button>
      </div>
    </div>
  )
}

function RecentCard({ image, copied, onCopy }: { image: RecentImage; copied: string | null; onCopy: (id: string, url: string) => void }) {
  const meta = image.metadata as { model?: string; prompt?: string } | null
  return (
    <div className="relative group rounded-card overflow-hidden bg-gray-100 aspect-square shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.s3Url} alt={meta?.prompt ?? ''} className="w-full h-full object-cover" loading="lazy" />
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-2.5 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center justify-between gap-1">
          <p className="text-white/80 text-[9px] truncate flex-1">{meta?.prompt}</p>
          <div className="flex gap-1 flex-shrink-0">
            <button type="button" onClick={() => window.open(image.s3Url, '_blank', 'noopener')} className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center">
              <Download size={10} className="text-white" />
            </button>
            <button type="button" onClick={() => onCopy(image.id, image.s3Url)} className="w-5 h-5 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center">
              {copied === image.id ? <Check size={10} className="text-green-300" /> : <Copy size={10} className="text-white" />}
            </button>
          </div>
        </div>
        <p className="text-white/40 text-[9px] mt-0.5">{formatRelativeTime(image.createdAt)}</p>
      </div>
    </div>
  )
}
