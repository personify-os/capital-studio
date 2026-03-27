'use client'

import { useState } from 'react'
import { BookOpen, Edit2, Plus, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

type BrandType = 'LHC' | 'SIMRP' | 'PERSONAL'

interface BrandProfile {
  id:        string
  type:      BrandType
  name:      string
  logoUrl:   string | null
  config:    any
  isDefault: boolean
}

interface Props { brands: BrandProfile[] }

const TYPE_LABELS: Record<BrandType, string> = {
  LHC:      'LH Capital',
  SIMRP:    'The SIMRP',
  PERSONAL: 'Personal Brand',
}

const TYPE_COLORS: Record<BrandType, string> = {
  LHC:      'bg-[#0475ae]/10 text-[#0475ae] border-[#0475ae]/20',
  SIMRP:    'bg-[#689EB8]/10 text-[#689EB8] border-[#689EB8]/20',
  PERSONAL: 'bg-[#37ca37]/10 text-[#37ca37] border-[#37ca37]/20',
}

export default function BrandVaultClient({ brands }: Props) {
  const [selected, setSelected] = useState<BrandProfile | null>(brands[0] ?? null)

  const config = selected?.config as {
    colors?: Record<string, string>
    fonts?: Record<string, string>
    tagline?: string
    tone?: string
    audience?: string
    products?: string[]
    guidelines?: string
  } | null

  return (
    <div className="flex h-full min-h-screen bg-app-bg">
      {/* ── Brand list ─────────────────────────────────────────────── */}
      <div className="w-64 flex-shrink-0 h-full overflow-y-auto p-4 border-r border-gray-100 bg-white">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 px-1">Brands</p>
        <div className="space-y-1">
          {brands.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setSelected(b)}
              className={cn(
                'w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors',
                selected?.id === b.id ? 'bg-[#041740] text-white' : 'hover:bg-gray-50 text-gray-700',
              )}
            >
              <span className={cn('w-2 h-2 rounded-full', {
                'bg-[#0475ae]': b.type === 'LHC',
                'bg-[#689EB8]': b.type === 'SIMRP',
                'bg-[#37ca37]': b.type === 'PERSONAL',
              })} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{b.name}</p>
                <p className={cn('text-[10px]', selected?.id === b.id ? 'text-white/60' : 'text-gray-400')}>
                  {TYPE_LABELS[b.type]}
                </p>
              </div>
              {b.isDefault && <CheckCircle size={12} className={selected?.id === b.id ? 'text-white/60' : 'text-[#0475ae]'} />}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="flex items-center gap-2 w-full px-3 py-2.5 mt-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-[#0475ae] hover:text-[#0475ae] transition-colors text-xs font-medium"
        >
          <Plus size={13} /> Add Brand
        </button>
      </div>

      {/* ── Brand detail ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        {!selected ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <BookOpen size={26} className="text-gray-400" />
            </div>
            <p className="text-gray-500">Select a brand to view its settings</p>
          </div>
        ) : (
          <div className="max-w-2xl">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className={cn('inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wide mb-2', TYPE_COLORS[selected.type])}>
                  {TYPE_LABELS[selected.type]}
                </div>
                <h2 className="text-xl font-bold text-[#041740]">{selected.name}</h2>
                {config?.tagline && <p className="text-sm text-gray-500 mt-0.5 italic">"{config.tagline}"</p>}
              </div>
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-[#0475ae] hover:underline px-3 py-1.5 border border-[#0475ae]/20 rounded-lg"
              >
                <Edit2 size={12} /> Edit
              </button>
            </div>

            {/* Colors */}
            {config?.colors && (
              <Section title="Colors">
                <div className="flex flex-wrap gap-3">
                  {Object.entries(config.colors).map(([name, hex]) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: hex }} />
                      <div>
                        <p className="text-xs font-medium text-[#041740] capitalize">{name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{hex}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {/* Tone & Audience */}
            {(config?.tone || config?.audience) && (
              <Section title="Voice & Audience">
                {config?.tone && (
                  <div className="mb-3">
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tone</p>
                    <p className="text-sm text-[#041740]">{config.tone}</p>
                  </div>
                )}
                {config?.audience && (
                  <div>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Target Audience</p>
                    <p className="text-sm text-[#041740]">{config.audience}</p>
                  </div>
                )}
              </Section>
            )}

            {/* Products */}
            {config?.products && config.products.length > 0 && (
              <Section title="Products & Offerings">
                <ul className="space-y-1">
                  {config.products.map((p: string) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-[#041740]">
                      <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#0475ae] flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </Section>
            )}

            {/* Knowledge base / guidelines */}
            <Section title="Knowledge Base">
              {config?.guidelines ? (
                <p className="text-sm text-[#041740] whitespace-pre-wrap">{config.guidelines}</p>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-400 mb-3">
                    Upload brand guidelines, product docs, or talking points.<br />
                    This content is injected into AI prompts for brand-accurate generation.
                  </p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#0475ae] text-white text-xs font-semibold rounded-lg hover:bg-[#035d8a] transition-colors"
                  >
                    Upload Document
                  </button>
                </div>
              )}
            </Section>

            {/* Logo */}
            <Section title="Logo">
              {selected.logoUrl ? (
                <div className="flex items-center gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selected.logoUrl} alt={selected.name} className="h-16 object-contain" />
                  <button type="button" className="text-xs text-[#0475ae] hover:underline">Replace</button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-sm text-gray-400 mb-3">No logo uploaded yet.</p>
                  <button
                    type="button"
                    className="px-4 py-2 bg-[#0475ae] text-white text-xs font-semibold rounded-lg hover:bg-[#035d8a] transition-colors"
                  >
                    Upload Logo
                  </button>
                </div>
              )}
            </Section>
          </div>
        )}
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-card shadow-card p-5 mb-4">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  )
}
