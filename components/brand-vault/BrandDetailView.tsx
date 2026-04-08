'use client'

import { useRef } from 'react'
import { Edit2, Upload, FileText, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type BrandProfile, TYPE_LABELS, TYPE_COLORS } from '@/components/brand-vault/types'
import { Section, BuiltInKnowledge } from '@/components/brand-vault/BrandDetail'

type LogoVariant = { label: string; url: string }

type BrandConfig = {
  colors?:        Record<string, string>
  fonts?:         Record<string, string>
  tagline?:       string
  tone?:          string
  audience?:      string
  products?:      string[]
  guidelines?:    string
  visualStyle?:   string
  keyMessages?:   string[]
  knowledgeBase?: string[]
  documentUrl?:   string
  documentName?:  string
  logoVariants?:  LogoVariant[]
}

interface Props {
  brand:        BrandProfile
  uploading:    'logo' | 'document' | string | null  // string = logo variant slot
  onEdit:       () => void
  onUpload:     (file: File, type: 'logo' | 'document', logoSlot?: string) => void
  onBrandUpdate:(updated: BrandProfile) => void
}

// Named logo slots users can upload to
const LOGO_SLOTS: { slot: string; label: string }[] = [
  { slot: 'horizontal', label: 'Horizontal' },
  { slot: 'icon',       label: 'Icon / Mark' },
  { slot: 'dark',       label: 'Dark Background' },
  { slot: 'white',      label: 'White / Reversed' },
]

export default function BrandDetailView({ brand, uploading, onEdit, onUpload, onBrandUpdate }: Props) {
  const logoRef = useRef<HTMLInputElement>(null)
  const docRef  = useRef<HTMLInputElement>(null)
  const variantRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const config  = brand.config as BrandConfig | null

  async function deleteLogoVariant(slot: string) {
    const currentVariants = config?.logoVariants ?? []
    const updated = currentVariants.filter((v) => v.label !== slot)
    try {
      const res  = await fetch(`/api/v1/brands/${brand.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ logoVariants: updated }),
      })
      if (!res.ok) return
      const { brand: updatedBrand } = await res.json()
      onBrandUpdate(updatedBrand)
    } catch { /* ignore */ }
  }

  const logoVariants    = config?.logoVariants ?? []

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
                <div className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: hex as string }} />
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

      {/* Custom Guidelines */}
      <Section title="Custom Guidelines">
        {config?.guidelines || config?.documentName ? (
          <div>
            {config.documentName && (
              <div className="flex items-center gap-2 mb-3">
                <FileText size={14} className="text-brand-azure flex-shrink-0" />
                <p className="text-xs text-brand-navy font-medium">{config.documentName}</p>
              </div>
            )}
            {config.guidelines && (
              <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-4">{config.guidelines.slice(0, 300)}{config.guidelines.length > 300 ? '…' : ''}</p>
            )}
            <button type="button" onClick={() => docRef.current?.click()} disabled={uploading === 'document'}
              className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline disabled:opacity-50">
              <Upload size={11} />{uploading === 'document' ? 'Uploading…' : 'Replace document'}
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-400 mb-1">Upload a .txt or PDF knowledge base file.</p>
            <p className="text-xs text-gray-400 mb-3">Text content is automatically extracted and prepended to the AI knowledge base.</p>
            <button type="button" onClick={() => docRef.current?.click()} disabled={uploading === 'document'}
              className="px-4 py-2 bg-brand-azure text-white text-xs font-semibold rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-50">
              {uploading === 'document' ? 'Uploading…' : 'Upload Document'}
            </button>
          </div>
        )}
        <input ref={docRef} type="file" accept=".pdf,.txt,text/plain,application/pdf" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, 'document') }} />
      </Section>

      {/* Logos */}
      <Section title="Logo">
        {/* Primary logo */}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Primary</p>
        {brand.logoUrl ? (
          <div className="flex items-center gap-4 mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logoUrl} alt={brand.name} className="h-12 object-contain border border-gray-100 rounded-lg p-1" />
            <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading === 'logo'}
              className="text-xs text-brand-azure hover:underline disabled:opacity-50">
              {uploading === 'logo' ? 'Uploading…' : 'Replace'}
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading === 'logo'}
            className="flex items-center gap-2 text-xs text-brand-azure hover:underline disabled:opacity-50 mb-4">
            <Upload size={11} /> {uploading === 'logo' ? 'Uploading…' : 'Upload primary logo'}
          </button>
        )}
        <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, 'logo', 'primary') }} />

        {/* Logo variants */}
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2 mt-3">Variants</p>
        <div className="space-y-2">
          {LOGO_SLOTS.map(({ slot, label }) => {
            const existing = logoVariants.find((v) => v.label === slot)
            const isUploading = uploading === slot
            return (
              <div key={slot} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <p className="text-xs text-gray-500 w-28 flex-shrink-0">{label}</p>
                {existing ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={existing.url} alt={label} className="h-8 object-contain border border-gray-100 rounded p-0.5 flex-1 min-w-0" />
                    <button type="button" onClick={() => variantRefs.current[slot]?.click()} disabled={isUploading}
                      className="text-[10px] text-brand-azure hover:underline disabled:opacity-50 flex-shrink-0">
                      {isUploading ? '…' : 'Replace'}
                    </button>
                    <button type="button" onClick={() => deleteLogoVariant(slot)}
                      className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600 flex-shrink-0 transition-colors">
                      <Trash2 size={11} />
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => variantRefs.current[slot]?.click()} disabled={isUploading}
                    className="flex items-center gap-1.5 text-[10px] text-gray-400 hover:text-brand-azure transition-colors disabled:opacity-50">
                    <Plus size={10} /> {isUploading ? 'Uploading…' : 'Upload'}
                  </button>
                )}
                <input
                  ref={(el) => { variantRefs.current[slot] = el }}
                  type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, 'logo', slot) }}
                />
              </div>
            )
          })}
        </div>
      </Section>
    </div>
  )
}
