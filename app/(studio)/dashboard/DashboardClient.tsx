'use client'

import Link from 'next/link'
import { ArrowRight, ImageIcon, Film, Mic, Layers, PenSquare, Calendar, BookOpen, FolderOpen, Sparkles, Clapperboard, Music, BarChart3, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Module cards ─────────────────────────────────────────────────────────────

const MODULES = [
  {
    href:        '/images',
    icon:        ImageIcon,
    label:       'Image Studio',
    description: 'Generate stunning AI images with Flux, Imagen 4, and more',
    gradient:    'from-[#0475ae] via-[#045a8a] to-[#023456]',
    accent:      '#46C3B2',
  },
  {
    href:        '/videos',
    icon:        Film,
    label:       'Video Studio',
    description: 'Generate cinematic AI videos with Kling, Veo, and MiniMax',
    gradient:    'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    accent:      '#689EB8',
  },
  {
    href:        '/motion',
    icon:        Clapperboard,
    label:       'Motion Studio',
    description: 'Animate any image with Kling AI — add cinematic motion to stills',
    gradient:    'from-[#2d1b69] via-[#1a0a3e] to-[#0d0020]',
    accent:      '#a78bfa',
    badge:       'New',
  },
  {
    href:        '/audio',
    icon:        Mic,
    label:       'VoiceOver Studio',
    description: 'Professional AI voiceovers with ElevenLabs',
    gradient:    'from-[#00c4cc] via-[#007b80] to-[#003d40]',
    accent:      '#DAF2EF',
  },
  {
    href:        '/music',
    icon:        Music,
    label:       'Music Studio',
    description: 'Generate background music for videos with Suno AI',
    gradient:    'from-[#7c3aed] via-[#5b21b6] to-[#3b0764]',
    accent:      '#c4b5fd',
    badge:       'New',
  },
  {
    href:        '/graphics',
    icon:        Layers,
    label:       'Graphics Studio',
    description: 'Branded social graphics, flyers, and email headers',
    gradient:    'from-[#ed6835] via-[#c44d1a] to-[#7a2d0a]',
    accent:      '#fbbf80',
  },
  {
    href:        '/writer',
    icon:        PenSquare,
    label:       'Content Writer',
    description: 'AI captions, emails, and long-form content series',
    gradient:    'from-[#041740] via-[#0a2a60] to-[#041740]',
    accent:      '#89a8c4',
  },
  {
    href:        '/scheduler',
    icon:        Calendar,
    label:       'Social Scheduler',
    description: 'Schedule and publish to 9 platforms from one place',
    gradient:    'from-[#005851] via-[#007a70] to-[#003d3a]',
    accent:      '#46C3B2',
  },
  {
    href:        '/brand-vault',
    icon:        BookOpen,
    label:       'Brand Vault',
    description: 'Brand assets, guidelines, logos, and knowledge base',
    gradient:    'from-[#1e3a5f] via-[#2a4f80] to-[#1a2d4a]',
    accent:      '#93c5fd',
  },
  {
    href:        '/library',
    icon:        FolderOpen,
    label:       'Content Library',
    description: 'All your generated images, videos, audio, and graphics',
    gradient:    'from-[#374151] via-[#4b5563] to-[#1f2937]',
    accent:      '#d1d5db',
  },
  {
    href:        '/analytics',
    icon:        BarChart3,
    label:       'Analytics',
    description: 'Track content created by module, model, count, and cost',
    gradient:    'from-[#0f4c75] via-[#1b262c] to-[#0a1628]',
    accent:      '#60a5fa',
  },
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

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardClient({ userName, recentAssets, counts }: Props) {
  const totalAssets = Object.values(counts).reduce((a, b) => a + b, 0)
  const images      = counts['IMAGE']     ?? 0
  const videos      = counts['VIDEO']     ?? 0
  const graphics    = counts['GRAPHIC']   ?? 0
  const audio       = counts['VOICEOVER'] ?? 0
  const captions    = counts['CAPTION']   ?? 0

  return (
    <div className="p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles size={16} className="text-brand-accent" />
          <p className="text-xs font-semibold text-brand-accent uppercase tracking-widest">Capital Studio</p>
        </div>
        <h1 className="text-2xl font-bold text-[#041740]">
          {totalAssets > 0 ? `Welcome back, ${userName}` : `Hey, ${userName}`}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Create images, video, audio, and creative assets for LH Capital & The SIMRP.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Total Generated', value: totalAssets,           accent: '#041740' },
          { label: 'Images',          value: images,                 accent: '#0475ae' },
          { label: 'Videos',          value: videos,                 accent: '#689EB8' },
          { label: 'Captions & More', value: captions + graphics + audio, accent: '#ed6835' },
        ].map(({ label, value, accent }) => (
          <div key={label} className="bg-white rounded-card shadow-card p-4">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-2xl font-bold" style={{ color: accent }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Module grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map(({ href, icon: Icon, label, description, gradient, accent, badge }) => (
          <Link
            key={href}
            href={href}
            className="group relative overflow-hidden rounded-2xl shadow-card hover:shadow-card-hover transition-all hover:-translate-y-0.5"
            style={{ minHeight: 200 }}
          >
            {/* Background gradient */}
            <div className={cn('absolute inset-0 bg-gradient-to-br', gradient)} />

            {/* Decorative circles */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-10" style={{ background: accent }} />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full opacity-5" style={{ background: accent }} />

            {/* Badge */}
            {badge && (
              <span className="absolute top-3 right-3 bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                {badge}
              </span>
            )}

            {/* Content */}
            <div className="relative z-10 p-5 flex flex-col h-full" style={{ minHeight: 200 }}>
              {/* Icon */}
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-auto">
                <Icon size={18} className="text-white" />
              </div>

              {/* Text */}
              <div className="mt-12">
                <p className="font-bold text-white text-lg leading-tight">{label}</p>
                <p className="text-white/70 text-xs mt-1 leading-relaxed">{description}</p>
                <div className="flex items-center gap-1 mt-3 text-xs font-semibold" style={{ color: accent }}>
                  Get Started <ArrowRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
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
            <Link href="/library" className="text-xs text-[#0475ae] hover:underline">View all</Link>
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

function AssetThumb({ asset }: { asset: Asset }) {
  const meta = asset.metadata as { prompt?: string; text?: string; texts?: string[]; platform?: string } | null

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

  if (asset.type === 'GRAPHIC' && asset.htmlContent) {
    return (
      <div className="rounded-xl overflow-hidden bg-gray-100 aspect-square shadow-card">
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
    <div className="rounded-xl bg-gray-100 aspect-square shadow-card flex items-center justify-center">
      <span className="text-[10px] text-gray-400 uppercase font-medium">{asset.type}</span>
    </div>
  )
}
