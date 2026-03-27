'use client'

import Link from 'next/link'
import { ImageIcon, Layers, PenSquare, Calendar, BookOpen, FolderOpen, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils'

const MODULES = [
  { href: '/images',      icon: ImageIcon, label: 'Create Images',    description: 'AI-generated photos & visuals',    color: 'bg-[#0475ae]/10 text-[#0475ae]' },
  { href: '/graphics',    icon: Layers,    label: 'Graphics Studio',  description: 'Branded social graphics & flyers',  color: 'bg-[#00c4cc]/10 text-[#00c4cc]' },
  { href: '/writer',      icon: PenSquare, label: 'Writer',           description: 'Captions, emails & blog content',   color: 'bg-[#ed6835]/10 text-[#ed6835]' },
  { href: '/scheduler',   icon: Calendar,  label: 'Social Scheduler', description: 'Schedule posts across platforms',   color: 'bg-[#041740]/10 text-[#041740]' },
  { href: '/brand-vault', icon: BookOpen,  label: 'Brand Vault',      description: 'Logos, colors, guidelines & docs',  color: 'bg-[#37ca37]/10 text-[#37ca37]' },
  { href: '/library',     icon: FolderOpen,label: 'Content Library',  description: 'All your generated assets',         color: 'bg-gray-100 text-gray-600' },
]

interface Asset {
  id:          string
  type:        string
  s3Url:       string | null
  htmlContent: string | null
  metadata:    any
  createdAt:   string
}

interface Props {
  userName:     string
  recentAssets: Asset[]
  counts:       Record<string, number>
}

export default function DashboardClient({ userName, recentAssets, counts }: Props) {
  const totalAssets = Object.values(counts).reduce((a, b) => a + b, 0)

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#041740]">Hey, {userName}</h2>
        <p className="text-gray-500 text-sm mt-1">
          {totalAssets > 0
            ? `You have ${totalAssets} asset${totalAssets !== 1 ? 's' : ''} in your library.`
            : 'Your studio is ready. Start creating.'}
        </p>
      </div>

      {/* Quick stats */}
      {totalAssets > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-8">
          {[
            { label: 'Images',   key: 'IMAGE',   color: 'text-[#0475ae]' },
            { label: 'Graphics', key: 'GRAPHIC',  color: 'text-[#00c4cc]' },
            { label: 'Videos',   key: 'VIDEO',    color: 'text-[#ed6835]' },
            { label: 'Audio',    key: 'AUDIO',    color: 'text-[#37ca37]' },
            { label: 'Total',    key: '__total__', color: 'text-[#041740]' },
          ].map(({ label, key, color }) => (
            <div key={key} className="bg-white rounded-card shadow-card p-4 text-center">
              <p className={cn('text-2xl font-bold', color)}>
                {key === '__total__' ? totalAssets : (counts[key] ?? 0)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Module grid */}
      <section className="mb-10">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Create</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {MODULES.map(({ href, icon: Icon, label, description, color }) => (
            <Link
              key={href}
              href={href}
              className="group bg-white rounded-card shadow-card p-5 hover:shadow-card-hover transition-shadow flex flex-col gap-3"
            >
              <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', color)}>
                <Icon size={18} />
              </div>
              <div>
                <p className="font-semibold text-[#041740] text-sm group-hover:text-[#0475ae] transition-colors">
                  {label}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
              <ArrowRight size={14} className="text-gray-300 group-hover:text-[#0475ae] transition-colors self-end mt-auto" />
            </Link>
          ))}
        </div>
      </section>

      {/* Recent assets */}
      {recentAssets.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Recent</h3>
            <Link href="/library" className="text-xs text-[#0475ae] hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {recentAssets.map((asset) => (
              <AssetThumb key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function AssetThumb({ asset }: { asset: Asset }) {
  const meta = asset.metadata as { prompt?: string } | null

  if (asset.type === 'IMAGE' && asset.s3Url) {
    return (
      <div className="rounded-card overflow-hidden bg-gray-100 aspect-square shadow-card group relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={asset.s3Url} alt={meta?.prompt ?? 'Asset'} className="w-full h-full object-cover" loading="lazy" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <p className="text-white text-[9px] truncate">{meta?.prompt}</p>
          <p className="text-white/60 text-[9px]">{formatRelativeTime(asset.createdAt)}</p>
        </div>
      </div>
    )
  }

  if (asset.type === 'GRAPHIC' && asset.htmlContent) {
    return (
      <div className="rounded-card overflow-hidden bg-gray-100 aspect-square shadow-card">
        <iframe
          srcDoc={asset.htmlContent}
          className="w-full h-full border-0 pointer-events-none scale-[0.25] origin-top-left"
          style={{ width: '400%', height: '400%' }}
          title="Graphic preview"
        />
      </div>
    )
  }

  return (
    <div className="rounded-card bg-gray-100 aspect-square shadow-card flex items-center justify-center">
      <span className="text-[10px] text-gray-400 uppercase font-medium">{asset.type}</span>
    </div>
  )
}
