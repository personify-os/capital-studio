'use client'

import { useState } from 'react'
import { FolderOpen, Download, Copy, Check } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'

type AssetType = 'IMAGE' | 'GRAPHIC' | 'VIDEO' | 'AUDIO' | 'VOICEOVER' | 'DOCUMENT'

interface Asset {
  id:          string
  type:        string   // AssetType at runtime; kept as string to avoid Prisma cast issues
  s3Url:       string | null
  htmlContent: string | null
  metadata:    unknown
  createdAt:   string
}

const FILTERS: { value: AssetType | 'ALL'; label: string }[] = [
  { value: 'ALL',      label: 'All' },
  { value: 'IMAGE',    label: 'Images' },
  { value: 'GRAPHIC',  label: 'Graphics' },
  { value: 'VIDEO',    label: 'Videos' },
  { value: 'AUDIO',    label: 'Audio' },
]

export default function LibraryClient({ assets }: { assets: Asset[] }) {
  const [filter, setFilter]   = useState<AssetType | 'ALL'>('ALL')
  const [copied, setCopied]   = useState<string | null>(null)

  const filtered = filter === 'ALL' ? assets : assets.filter((a) => a.type === filter)

  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(id)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  return (
    <div className="p-6">
      {/* Filter bar */}
      <div className="flex gap-2 mb-6">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              'px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              filter === f.value
                ? 'bg-[#041740] text-white border-[#041740]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#0475ae] hover:text-[#0475ae]',
            )}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-gray-400 self-center">{filtered.length} assets</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FolderOpen size={26} className="text-gray-400" />
          </div>
          <p className="font-semibold text-[#041740] mb-1">No assets yet</p>
          <p className="text-sm text-gray-400">Generated content will appear here</p>
        </div>
      ) : (
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
      {/* Preview */}
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
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[10px] font-semibold text-gray-400 uppercase">{asset.type}</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1.5 p-2">
        {asset.s3Url && (
          <button
            type="button"
            onClick={() => window.open(asset.s3Url!, '_blank', 'noopener')}
            className="flex items-center gap-1 bg-white text-[#041740] text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-gray-50 w-full justify-center"
          >
            <Download size={10} /> Download
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
        <p className="text-white/50 text-[9px] text-center mt-0.5">{formatRelativeTime(asset.createdAt)}</p>
      </div>
    </div>
  )
}
