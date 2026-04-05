'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, ImageIcon, PenSquare, BookOpen } from 'lucide-react'
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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
        {MODULES.map(({ href, icon: Icon, label, description, gradient, accent, badge }) => (
          <Link
            key={href}
            href={href}
            className="group relative overflow-hidden rounded-xl shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
            style={{ minHeight: 110 }}
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-10" style={{ background: accent }} />
            {badge && (
              <span className="absolute top-2 right-2 bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full backdrop-blur-sm z-10">
                {badge}
              </span>
            )}
            <div className="relative z-10 p-3 flex flex-col h-full" style={{ minHeight: 110 }}>
              <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center mb-auto">
                <Icon size={13} className="text-white" />
              </div>
              <div className="mt-3">
                <p className="font-bold text-white text-[12px] leading-tight">{label}</p>
                <p className="text-white/65 text-[10px] mt-0.5 leading-relaxed line-clamp-2">{description}</p>
                <div className="flex items-center gap-1 mt-1.5 text-[10px] font-semibold" style={{ color: accent }}>
                  Get Started <ArrowRight size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* First-run guidance */}
      {totalAssets === 0 && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-brand-azure/30 bg-brand-azure/5 p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-brand-azure/10 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={22} className="text-brand-azure" />
          </div>
          <h2 className="text-lg font-bold text-brand-navy mb-1">Welcome to Capital Studio</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            Start by setting up your brand profile, then generate your first piece of content.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/brand-vault"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-navy text-white text-sm font-semibold hover:bg-brand-azure transition-colors">
              <BookOpen size={14} /> Set up Brand Vault
            </Link>
            <Link href="/images"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-brand-azure text-brand-azure text-sm font-semibold hover:bg-brand-azure hover:text-white transition-colors">
              <ImageIcon size={14} /> Generate an Image
            </Link>
            <Link href="/writer"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-semibold hover:border-brand-azure hover:text-brand-azure transition-colors">
              <PenSquare size={14} /> Write a Caption
            </Link>
          </div>
        </div>
      )}

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
