'use client'

import { useRouter } from 'next/navigation'
import { Download, Copy, Check, Mic, Music, Calendar } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { type Asset, BRAND_DOT, getAssetBrand } from './shared'

interface Props {
  asset:  Asset
  copied: string | null
  onCopy: (id: string, url: string) => void
}

export default function AudioRow({ asset, copied, onCopy }: Props) {
  const router  = useRouter()
  const meta    = asset.metadata as { text?: string; voiceName?: string; title?: string; prompt?: string; contentPillar?: string } | null
  const isMusic = asset.type === 'MUSIC'
  const label   = isMusic
    ? (meta?.title ?? meta?.prompt ?? 'Music track')
    : (meta?.text ?? 'Voiceover')
  const brandId      = getAssetBrand(asset)
  const contentPillar = meta?.contentPillar

  function sendToScheduler() {
    if (!asset.s3Url) return
    localStorage.setItem('schedulerDraft', JSON.stringify({ caption: label }))
    router.push('/scheduler')
  }

  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <div className={cn('w-7 h-7 rounded-full flex items-center justify-center', isMusic ? 'bg-purple-100' : 'bg-brand-azure/10')}>
              {isMusic ? <Music size={13} className="text-purple-500" /> : <Mic size={13} className="text-brand-azure" />}
            </div>
            {brandId && BRAND_DOT[brandId] && (
              <span className={cn('absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white', BRAND_DOT[brandId])} />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-brand-navy truncate flex items-center gap-1.5 flex-wrap">
              {label}
              {contentPillar && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-navy/8 text-brand-navy/60 font-semibold capitalize">
                  {contentPillar.replace('-', ' ')}
                </span>
              )}
            </p>
            <p className="text-[10px] text-gray-400 mt-0.5">
              {!isMusic && meta?.voiceName && `${meta.voiceName} · `}
              {formatRelativeTime(asset.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {asset.s3Url && (
            <button type="button" onClick={sendToScheduler}
              className="text-gray-400 hover:text-brand-azure transition-colors" title="Schedule">
              <Calendar size={13} />
            </button>
          )}
          {asset.s3Url && (
            <button type="button" onClick={() => onCopy(asset.id, asset.s3Url!)}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-brand-azure transition-colors">
              {copied === asset.id ? <Check size={11} /> : <Copy size={11} />}
            </button>
          )}
          {asset.s3Url && (
            <a href={asset.s3Url} download className="text-brand-azure hover:text-brand-navy">
              <Download size={14} />
            </a>
          )}
        </div>
      </div>
      {asset.s3Url
        ? <audio src={asset.s3Url} controls className="w-full" style={{ height: '32px' }} />
        : <p className="text-[10px] text-gray-400 italic">Audio unavailable</p>
      }
    </div>
  )
}
