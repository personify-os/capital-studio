'use client'

import { useState } from 'react'
import { FolderOpen, Download, Copy, Check, Film, Mic, Play, FileText } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'

type FilterValue = 'ALL' | 'IMAGE' | 'GRAPHIC' | 'VIDEO' | 'VOICEOVER' | 'CAPTION'

interface Asset {
  id:          string
  type:        string
  s3Url:       string | null
  htmlContent: string | null
  metadata:    unknown
  createdAt:   string
}

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'ALL',       label: 'All' },
  { value: 'IMAGE',     label: 'Images' },
  { value: 'GRAPHIC',   label: 'Graphics' },
  { value: 'VIDEO',     label: 'Videos' },
  { value: 'VOICEOVER', label: 'Audio' },
  { value: 'CAPTION',   label: 'Captions' },
]

export default function LibraryClient({ assets }: { assets: Asset[] }) {
  const [filter, setFilter] = useState<FilterValue>('ALL')
  const [copied, setCopied] = useState<string | null>(null)

  // Hide captions from "All" view since they don't fit the grid — they have their own tab
  const filtered = filter === 'ALL'
    ? assets.filter((a) => a.type !== 'CAPTION')
    : assets.filter((a) => a.type === filter)

  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const isAudioFilter   = filter === 'VOICEOVER'
  const isCaptionFilter = filter === 'CAPTION'
  const hasVideo        = filtered.some((a) => a.type === 'VIDEO')
  const hasAudio        = filtered.some((a) => a.type === 'VOICEOVER')
  const mixedMedia      = filter === 'ALL' && (hasVideo || hasAudio)

  return (
    <div className="p-6">
      {/* Filter bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              filter === f.value
                ? 'bg-brand-navy text-white border-brand-navy'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
            )}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} assets</span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FolderOpen size={26} className="text-gray-400" />
          </div>
          <p className="font-semibold text-brand-navy mb-1">No assets yet</p>
          <p className="text-sm text-gray-400">Generated content will appear here</p>
        </div>
      ) : isCaptionFilter ? (
        /* ── Captions list layout ── */
        <div className="space-y-3 max-w-2xl">
          {filtered.map((asset) => (
            <CaptionRow key={asset.id} asset={asset} copied={copied} onCopy={copyText} />
          ))}
        </div>
      ) : isAudioFilter ? (
        /* ── Audio list layout ── */
        <div className="space-y-3 max-w-2xl">
          {filtered.map((asset) => (
            <AudioRow key={asset.id} asset={asset} copied={copied} onCopy={copyUrl} />
          ))}
        </div>
      ) : mixedMedia ? (
        /* ── Mixed: group by type ── */
        <div className="space-y-8">
          {(['IMAGE', 'GRAPHIC', 'VIDEO', 'VOICEOVER'] as const).map((type) => {
            const group = filtered.filter((a) => a.type === type)
            if (group.length === 0) return null
            const labels: Record<string, string> = { IMAGE: 'Images', GRAPHIC: 'Graphics', VIDEO: 'Videos', VOICEOVER: 'Audio', CAPTION: 'Captions' }
            return (
              <div key={type}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{labels[type]}</p>
                {type === 'VOICEOVER' ? (
                  <div className="space-y-3 max-w-2xl">
                    {group.map((a) => <AudioRow key={a.id} asset={a} copied={copied} onCopy={copyUrl} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {group.map((a) => <AssetCard key={a.id} asset={a} copied={copied} onCopy={copyUrl} />)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        /* ── Standard grid ── */
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((asset) => (
            <AssetCard key={asset.id} asset={asset} copied={copied} onCopy={copyUrl} />
          ))}
        </div>
      )}
    </div>
  )
}

function AssetCard({ asset, copied, onCopy }: { asset: Asset; copied: string | null; onCopy: (id: string, url: string) => void }) {
  const meta = asset.metadata as { prompt?: string; model?: string } | null

  return (
    <div className="group relative rounded-card overflow-hidden bg-gray-100 aspect-square shadow-card">
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
          <a
            href={asset.s3Url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-white text-brand-navy text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-gray-50 w-full justify-center"
          >
            <Play size={10} /> Open
          </a>
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
        <p className="text-white/50 text-[9px] text-center mt-0.5">{formatRelativeTime(asset.createdAt)}</p>
      </div>
    </div>
  )
}

function CaptionRow({ asset, copied, onCopy }: { asset: Asset; copied: string | null; onCopy: (id: string, text: string) => void }) {
  const meta     = asset.metadata as { text?: string; texts?: string[]; platform?: string; seriesCount?: number } | null
  const platform = meta?.platform
  const texts    = meta?.texts ?? (meta?.text ? [meta.text] : [])
  const isSeries = (meta?.seriesCount ?? 1) > 1

  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
            <FileText size={13} className="text-brand-navy" />
          </div>
          <div>
            <p className="text-xs font-medium text-brand-navy capitalize">
              {isSeries ? `${meta?.seriesCount}-Part Series` : 'Caption'}
              {platform && <span className="ml-1 text-gray-400 font-normal">· {platform}</span>}
            </p>
            <p className="text-[10px] text-gray-400">{formatRelativeTime(asset.createdAt)}</p>
          </div>
        </div>
        {texts.length > 0 && (
          <button
            type="button"
            onClick={() => onCopy(asset.id, texts.join('\n\n---\n\n'))}
            className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-brand-azure bg-gray-50 border border-gray-200 px-2 py-1 rounded transition-colors flex-shrink-0"
          >
            {copied === asset.id ? <><Check size={10} />Copied</> : <><Copy size={10} />{isSeries ? 'Copy all' : 'Copy'}</>}
          </button>
        )}
      </div>
      <div className="space-y-2">
        {texts.map((t, i) => (
          <div key={i} className="text-xs text-gray-700 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed whitespace-pre-wrap">
            {isSeries && <span className="text-[9px] font-semibold text-brand-azure uppercase tracking-widest block mb-1">Post {i + 1}</span>}
            {t}
          </div>
        ))}
        {texts.length === 0 && (
          <p className="text-xs text-gray-400 italic">Caption text not available</p>
        )}
      </div>
    </div>
  )
}

function AudioRow({ asset, copied, onCopy }: { asset: Asset; copied: string | null; onCopy: (id: string, url: string) => void }) {
  const meta = asset.metadata as { text?: string; voiceName?: string } | null
  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-7 h-7 rounded-full bg-brand-azure/10 flex items-center justify-center flex-shrink-0">
            <Mic size={13} className="text-brand-azure" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-brand-navy truncate">{meta?.text ?? 'Voiceover'}</p>
            <p className="text-[10px] text-gray-400 mt-0.5">{meta?.voiceName} · {formatRelativeTime(asset.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {asset.s3Url && (
            <button
              type="button"
              onClick={() => onCopy(asset.id, asset.s3Url!)}
              className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-brand-azure transition-colors"
            >
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
      {asset.s3Url && (
        <audio src={asset.s3Url} controls className="w-full h-8" style={{ height: '32px' }} />
      )}
    </div>
  )
}
