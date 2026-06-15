'use client'

import { useState } from 'react'
import { ImageIcon, Loader2, Copy, Check, AlertCircle } from 'lucide-react'

export interface PlanResult {
  ok:        boolean
  idx:       number
  day:       string | null
  platform:  string
  audience?: string | null
  theme?:    string | null
  body?:     string
  hashtags?: string[]
  assetId?:  string | null
  error?:    string
}

export type ImageState = { url?: string; state: 'idle' | 'loading' | 'error' }

interface Props {
  result:          PlanResult
  image?:          ImageState
  onGenerateImage: () => void
}

export default function PlanResultCard({ result, image, onGenerateImage }: Props) {
  const [copied, setCopied] = useState(false)
  const imgUrl   = image?.url ?? null
  const imgState = image?.state ?? 'idle'

  const fullText = result.hashtags?.length ? `${result.body}\n\n${result.hashtags.join(' ')}` : (result.body ?? '')

  function copy() {
    navigator.clipboard.writeText(fullText).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  if (!result.ok) {
    return (
      <div className="bg-white rounded-card shadow-card p-4 border-l-2 border-red-300">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">Day {result.day ?? '—'} · {result.platform}</p>
        <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} /> {result.error ?? 'Generation failed'}</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 flex-wrap">
          Day {result.day ?? '—'} · {result.platform}
          {result.audience && <span className="text-brand-emerald/70">· {result.audience}</span>}
          {result.theme && <span className="text-gray-400">· {result.theme}</span>}
        </p>
        <button type="button" onClick={copy}
          className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-brand-azure bg-gray-50 border border-gray-200 px-2 py-1 rounded transition-colors flex-shrink-0">
          {copied ? <><Check size={10} />Copied</> : <><Copy size={10} />Copy</>}
        </button>
      </div>

      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{result.body}</p>
      {result.hashtags && result.hashtags.length > 0 && (
        <p className="text-[10px] text-brand-azure/70 font-medium mt-1.5">{result.hashtags.join(' ')}</p>
      )}

      <div className="mt-3">
        {imgUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imgUrl} alt="" className="w-32 h-32 object-cover rounded-lg border border-gray-200" />
        ) : (
          <button type="button" onClick={onGenerateImage} disabled={imgState === 'loading'}
            className="flex items-center gap-1.5 text-[10px] font-medium text-brand-azure hover:text-brand-navy bg-brand-azure/5 border border-brand-azure/20 px-2.5 py-1.5 rounded transition-colors disabled:opacity-60">
            {imgState === 'loading' ? <><Loader2 size={11} className="animate-spin" />Generating image…</> : <><ImageIcon size={11} />Generate image</>}
          </button>
        )}
        {imgState === 'error' && <p className="text-[10px] text-red-500 mt-1">Image generation failed.</p>}
      </div>
    </div>
  )
}
