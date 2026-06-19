'use client'

import { Edit2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type BrandProfile, type BrandConfig, TYPE_LABELS, TYPE_COLORS } from '@/components/brand-vault/types'
import { Section, BuiltInKnowledge } from '@/components/brand-vault/BrandDetail'
import GuidelinesSection from '@/components/brand-vault/GuidelinesSection'
import LogoSection from '@/components/brand-vault/LogoSection'

interface Props {
  brand:        BrandProfile
  uploading:    'logo' | 'document' | string | null  // string = logo variant slot
  onEdit:       () => void
  onUpload:     (file: File, type: 'logo' | 'document', logoSlot?: string) => void
  onBrandUpdate:(updated: BrandProfile) => void
}

export default function BrandDetailView({ brand, uploading, onEdit, onUpload, onBrandUpdate }: Props) {
  const config = brand.config as BrandConfig | null

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className={cn('inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wide mb-2', TYPE_COLORS[brand.type])}>
            {TYPE_LABELS[brand.type]}
          </div>
          <h2 className="text-xl font-bold text-brand-navy">{brand.name}</h2>
          {config?.tagline && <p className="text-sm text-gray-500 mt-0.5 italic">&ldquo;{config.tagline}&rdquo;</p>}
        </div>
        <button type="button" onClick={onEdit}
          className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline px-3 py-1.5 border border-brand-azure/20 rounded-lg hover:bg-brand-azure/5 transition-colors">
          <Edit2 size={12} /> Edit
        </button>
      </div>

      {config?.colors && (
        <Section title="Colors">
          <div className="flex flex-wrap gap-3">
            {Object.entries(config.colors).map(([name, hex]) => (
              <div key={name} className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg border border-gray-200 shadow-xs" style={{ backgroundColor: hex as string }} />
                <div>
                  <p className="text-xs font-medium text-brand-navy capitalize">{name}</p>
                  <p className="text-[10px] text-gray-400 font-mono">{hex as string}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {(config?.tone || config?.audience) && (
        <Section title="Voice & Audience">
          {config?.tone     && <div className="mb-3"><p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tone</p><p className="text-sm text-brand-navy">{config.tone}</p></div>}
          {config?.audience && <div><p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Target Audience</p><p className="text-sm text-brand-navy">{config.audience}</p></div>}
        </Section>
      )}

      {config?.products && config.products.length > 0 && (
        <Section title="Products & Offerings">
          <ul className="space-y-1">
            {config.products.map((p: string) => (
              <li key={p} className="flex items-start gap-2 text-sm text-brand-navy">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-azure flex-shrink-0" />{p}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {config?.keyMessages && config.keyMessages.length > 0 && (
        <Section title="Key Messages">
          <ul className="space-y-1.5">
            {config.keyMessages.map((m: string, i: number) => (
              <li key={i} className="flex items-start gap-2 text-sm text-brand-navy">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-teal flex-shrink-0" />&ldquo;{m}&rdquo;
              </li>
            ))}
          </ul>
        </Section>
      )}

      {config?.visualStyle && (
        <Section title="Visual Style">
          <p className="text-sm text-brand-navy leading-relaxed">{config.visualStyle}</p>
        </Section>
      )}

      <BuiltInKnowledge
        type={brand.type}
        brandId={brand.id}
        configOverrides={{
          knowledgeBase: config?.knowledgeBase,
          keyMessages:   config?.keyMessages,
          visualStyle:   config?.visualStyle,
        }}
        onSaved={(patch) => {
          onBrandUpdate({ ...brand, config: { ...((brand.config as object) ?? {}), ...patch } } as BrandProfile)
        }}
      />

      <GuidelinesSection config={config} uploading={uploading} onUpload={onUpload} />

      <LogoSection brand={brand} config={config} uploading={uploading} onUpload={onUpload} onBrandUpdate={onBrandUpdate} />
    </div>
  )
}
