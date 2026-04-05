'use client'

import { useRouter } from 'next/navigation'
import { Download, Copy, Check, Film, Play, PenSquare, Calendar, Layers } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { type Asset, BrandDot } from './shared'

interface Props {
  asset:  Asset
  copied: string | null
  onCopy: (id: string, url: string) => void
}

export default function AssetCard({ asset, copied, onCopy }: Props) {
  const router = useRouter()
  const meta         = asset.metadata as { prompt?: string; model?: string; contentPillar?: string } | null
  const contentPillar = meta?.contentPillar

  function sendToWriter() {
    if (asset.type === 'IMAGE' && asset.s3Url) {
      localStorage.setItem('writerDraft', JSON.stringify({ referenceImageUrl: asset.s3Url }))
    } else if (asset.type === 'GRAPHIC') {
      const gm = asset.metadata as { headline?: string; subtext?: string; topic?: string } | null
      localStorage.setItem('writerDraft', JSON.stringify({ referenceContent: [gm?.headline, gm?.subtext, gm?.topic].filter(Boolean).join('\n') }))
    }
    router.push('/writer')
  }

  function sendToScheduler() {
    const draft: Record<string, string> = {}
    if (asset.s3Url)        draft.imageUrl = asset.s3Url
    if (asset.type === 'GRAPHIC') {
      const gm = asset.metadata as { headline?: string; subtext?: string } | null
      if (gm?.headline) draft.caption = [gm.headline, gm.subtext].filter(Boolean).join('\n\n')
    }
    localStorage.setItem('schedulerDraft', JSON.stringify(draft))
    router.push('/scheduler')
  }

  function editInGraphics() {
    localStorage.setItem('graphicsDraft', JSON.stringify(asset.metadata))
    router.push('/graphics')
  }

  return (
    <div className="group relative rounded-card overflow-hidden bg-gray-100 aspect-square shadow-card">
      <BrandDot asset={asset} />

      {asset.type === 'IMAGE' && asset.s3Url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset.s3Url} alt={meta?.prompt ?? ''} className="w-full h-full object-cover" loading="lazy" />
      ) : asset.type === 'GRAPHIC' && asset.htmlContent ? (
        <iframe
          srcDoc={asset.htmlContent}
          className="w-full h-full border-0 pointer-events-none"
          style={{ transform: 'scale(0.25)', transformOrigin: 'top left', width: '400%', height: '400%' }}
          title="Graphic"
        />
      ) : asset.type === 'VIDEO' && asset.s3Url ? (
        <>
          <video src={asset.s3Url} className="w-full h-full object-cover" preload="metadata" muted />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-9 h-9 rounded-full bg-white/90 flex items-center justify-center shadow">
              <Play size={14} className="text-brand-navy ml-0.5" />
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1">
          <Film size={20} className="text-gray-300" />
          <span className="text-[10px] font-semibold text-gray-400 uppercase">{asset.type}</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
        {asset.s3Url && asset.type !== 'VIDEO' && (
          <button
            type="button"
            onClick={() => window.open(asset.s3Url!, '_blank', 'noopener')}
            className="flex items-center gap-1 bg-white text-brand-navy text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-gray-50 w-full justify-center"
          >
            <Download size={10} /> Download
          </button>
        )}
        {asset.s3Url && asset.type === 'VIDEO' && (
          <a href={asset.s3Url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 bg-white text-brand-navy text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-gray-50 w-full justify-center">
            <Play size={10} /> Open
          </a>
        )}
        {asset.type === 'VIDEO' && meta?.prompt && (
          <button
            type="button"
            onClick={() => { localStorage.setItem('writerDraft', JSON.stringify({ referenceContent: meta!.prompt })); router.push('/writer') }}
            className="flex items-center gap-1 bg-brand-teal/80 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-brand-teal w-full justify-center"
          >
            <PenSquare size={10} /> Write Caption
          </button>
        )}
        {asset.s3Url && (
          <button
            type="button"
            onClick={() => onCopy(asset.id, asset.s3Url!)}
            className="flex items-center gap-1 bg-white/20 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-white/30 w-full justify-center"
          >
            {copied === asset.id ? <><Check size={10} />Copied</> : <><Copy size={10} />Copy URL</>}
          </button>
        )}
        {((asset.type === 'IMAGE' && asset.s3Url) || asset.type === 'GRAPHIC') && (
          <button
            type="button"
            onClick={sendToWriter}
            className="flex items-center gap-1 bg-brand-teal/80 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-brand-teal w-full justify-center"
          >
            <PenSquare size={10} /> Write Caption
          </button>
        )}
        {(asset.type === 'IMAGE' || asset.type === 'VIDEO') && (
          <button
            type="button"
            onClick={sendToScheduler}
            className="flex items-center gap-1 bg-brand-azure/80 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-brand-azure w-full justify-center"
          >
            <Calendar size={10} /> Schedule
          </button>
        )}
        {asset.type === 'GRAPHIC' && (
          <button
            type="button"
            onClick={editInGraphics}
            className="flex items-center gap-1 bg-brand-navy/80 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-brand-navy w-full justify-center"
          >
            <Layers size={10} /> Edit in Graphics
          </button>
        )}
        {contentPillar && (
          <span className="text-[9px] bg-white/20 text-white px-2 py-0.5 rounded-full font-semibold capitalize">
            {contentPillar.replace('-', ' ')}
          </span>
        )}
        <p className="text-white/50 text-[9px] text-center mt-0.5">{formatRelativeTime(asset.createdAt)}</p>
      </div>
    </div>
  )
}
