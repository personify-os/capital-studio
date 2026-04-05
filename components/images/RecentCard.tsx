'use client'

import { useRouter } from 'next/navigation'
import { Download, Copy, Check, Calendar, PenSquare } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface RecentImage { id: string; s3Url: string; metadata: { prompt?: string; model?: string; brandId?: string; contentPillar?: string } | null; createdAt: string }

interface Props {
  image:  RecentImage
  copied: string | null
  onCopy: (id: string, url: string) => void
}

export default function RecentCard({ image, copied, onCopy }: Props) {
  const router = useRouter()
  const meta = image.metadata as { model?: string; prompt?: string } | null

  function sendToScheduler() { localStorage.setItem('schedulerDraft', JSON.stringify({ imageUrl: image.s3Url })); router.push('/scheduler') }
  function sendToWriter()    { localStorage.setItem('writerDraft', JSON.stringify({ referenceImageUrl: image.s3Url })); router.push('/writer') }

  return (
    <div className="relative group rounded-card overflow-hidden bg-gray-100 aspect-square shadow-card">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image.s3Url} alt={meta?.prompt ?? ''} className="w-full h-full object-cover" loading="lazy" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
        <button type="button" onClick={() => window.open(image.s3Url, '_blank', 'noopener')}
          className="flex items-center gap-1 bg-white text-brand-navy text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-gray-50 w-full justify-center">
          <Download size={10} /> Download
        </button>
        <button type="button" onClick={sendToWriter}
          className="flex items-center gap-1 bg-brand-teal/80 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-brand-teal w-full justify-center">
          <PenSquare size={10} /> Write Caption
        </button>
        <button type="button" onClick={sendToScheduler}
          className="flex items-center gap-1 bg-brand-azure/80 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-brand-azure w-full justify-center">
          <Calendar size={10} /> Schedule
        </button>
        <button type="button" onClick={() => onCopy(image.id, image.s3Url)}
          className="flex items-center gap-1 bg-white/20 text-white text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-white/30 w-full justify-center">
          {copied === image.id ? <><Check size={10} />Copied</> : <><Copy size={10} />Copy URL</>}
        </button>
        <p className="text-white/40 text-[9px] mt-1 truncate max-w-full px-1">{meta?.prompt}</p>
        <p className="text-white/30 text-[9px]">{formatRelativeTime(image.createdAt)}</p>
      </div>
    </div>
  )
}
