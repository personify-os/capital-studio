import { FileText, Mic, Music } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AssetMeta {
  prompt?:        string
  text?:          string
  texts?:         string[]
  platform?:      string
  title?:         string
  voiceName?:     string
  contentPillar?: string
}

export interface Asset {
  id:          string
  type:        string
  s3Url:       string | null
  htmlContent: string | null
  metadata:    AssetMeta | null
  createdAt:   string
}

export default function AssetThumb({ asset }: { asset: Asset }) {
  const meta = asset.metadata

  if (asset.type === 'CAPTION') {
    const snippet = meta?.text ?? meta?.texts?.[0] ?? ''
    return (
      <div className="rounded-xl bg-brand-navy/5 border border-brand-navy/10 aspect-square shadow-card flex flex-col p-2 overflow-hidden">
        <div className="flex items-center gap-1 mb-1 flex-shrink-0">
          <FileText size={10} className="text-brand-navy/40" />
          <span className="text-[8px] font-semibold text-brand-navy/40 uppercase tracking-wide truncate">{meta?.platform ?? 'caption'}</span>
        </div>
        <p className="text-[9px] text-brand-navy/60 leading-relaxed line-clamp-5">{snippet}</p>
      </div>
    )
  }

  if (asset.type === 'IMAGE' && asset.s3Url) {
    return (
      <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square shadow-card group relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.s3Url} alt={meta?.prompt ?? 'Asset'} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
          <p className="text-white text-[9px] truncate">{meta?.prompt}</p>
        </div>
      </div>
    )
  }

  if ((asset.type === 'VIDEO' || asset.type === 'MOTION') && asset.s3Url) {
    return (
      <div className="rounded-xl overflow-hidden bg-black aspect-square shadow-card relative">
        <video src={asset.s3Url} className="w-full h-full object-cover" preload="metadata" muted />
        <div className="absolute bottom-1 left-1 right-1">
          <span className="text-[8px] font-semibold text-white/70 uppercase bg-black/50 px-1.5 py-0.5 rounded">
            {asset.type === 'MOTION' ? 'Motion' : 'Video'}
          </span>
        </div>
      </div>
    )
  }

  if ((asset.type === 'VOICEOVER' || asset.type === 'MUSIC') && asset.s3Url) {
    const isMusic = asset.type === 'MUSIC'
    const label   = meta?.title ?? meta?.text?.slice(0, 40) ?? (isMusic ? 'Music' : 'Voiceover')
    return (
      <div className={cn(
        'rounded-xl aspect-square shadow-card flex flex-col items-center justify-center gap-1.5 p-2',
        isMusic ? 'bg-purple-50 border border-purple-100' : 'bg-brand-azure/5 border border-brand-azure/10',
      )}>
        {isMusic ? <Music size={18} className="text-purple-400" /> : <Mic size={18} className="text-brand-azure" />}
        <p className="text-[8px] text-center text-gray-500 line-clamp-2 leading-tight">{label}</p>
      </div>
    )
  }

  if (asset.type === 'GRAPHIC' && asset.htmlContent) {
    return (
      <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square shadow-card">
        <iframe
          srcDoc={asset.htmlContent}
          className="w-full h-full border-0 pointer-events-none scale-[0.25] origin-top-left"
          style={{ width: '400%', height: '400%' }}
          title="Graphic preview"
          sandbox="allow-same-origin"
        />
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-gray-100 aspect-square shadow-card flex items-center justify-center">
      <span className="text-[10px] text-gray-400 uppercase font-medium">{asset.type}</span>
    </div>
  )
}
