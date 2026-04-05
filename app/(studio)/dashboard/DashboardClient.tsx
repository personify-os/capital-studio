'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MODULES } from '@/lib/dashboard-modules'
import AssetThumb, { type Asset } from '@/components/dashboard/AssetThumb'

interface Props {
  userName:     string
  recentAssets: Asset[]
  counts:       Record<string, number>
}

export default function DashboardClient({ userName, recentAssets, counts }: Props) {
  const totalAssets = Object.values(counts).reduce((a, b) => a + b, 0)
  const images      = counts['IMAGE']      ?? 0
  const videos      = (counts['VIDEO']     ?? 0) + (counts['MOTION'] ?? 0)
  const graphics    = counts['GRAPHIC']    ?? 0
  const audio       = (counts['VOICEOVER'] ?? 0) + (counts['MUSIC']  ?? 0)
  const captions    = counts['CAPTION']    ?? 0

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-brand-accent" />
          <p className="text-xs font-semibold text-brand-accent uppercase tracking-widest">Capital Studio</p>
        </div>
        <h1 className="text-2xl font-bold text-brand-navy">
          {totalAssets > 0 ? `Welcome back, ${userName}` : `Hey, ${userName}`}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create images, video, audio, and creative assets for LH Capital & The SIMRP.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Generated', value: totalAssets,                 cls: 'text-brand-navy'   },
          { label: 'Images',          value: images,                      cls: 'text-brand-azure'  },
          { label: 'Videos',          value: videos,                      cls: 'text-brand-light'  },
          { label: 'Captions & More', value: captions + graphics + audio, cls: 'text-brand-orange' },
        ].map(({ label, value, cls }) => (
          <div key={label} className="bg-white rounded-card shadow-card p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className={`text-2xl font-bold ${cls}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3">
        {MODULES.map(({ href, icon: Icon, label, description, gradient, accent, badge }) => (
          <Link
            key={href}
            href={href}
            className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
            style={{ minHeight: 135 }}
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
            <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-10" style={{ background: accent }} />
            <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full opacity-5" style={{ background: accent }} />
            {badge && (
              <span className="absolute top-2.5 right-2.5 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                {badge}
              </span>
            )}
            <div className="relative z-10 p-4 flex flex-col h-full" style={{ minHeight: 135 }}>
              <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center mb-auto">
                <Icon size={15} className="text-white" />
              </div>
              <div className="mt-4">
                <p className="font-bold text-white text-sm leading-tight">{label}</p>
                <p className="text-white/70 text-[11px] mt-0.5 leading-relaxed line-clamp-2">{description}</p>
                <div className="flex items-center gap-1 mt-1.5 text-[11px] font-semibold" style={{ color: accent }}>
                  Get Started <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>


      {/* Recent assets */}
      {recentAssets.length > 0 && (
        <section className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Recent</h3>
            <Link href="/library" className="text-xs text-brand-azure hover:underline">View all</Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
            {recentAssets.map((asset) => (
              <AssetThumb key={asset.id} asset={asset} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
