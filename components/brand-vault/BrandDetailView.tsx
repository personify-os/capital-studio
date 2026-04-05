'use client'

import { useRef } from 'react'
import { Edit2, Upload, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type BrandProfile, TYPE_LABELS, TYPE_COLORS } from '@/components/brand-vault/types'
import { Section, BuiltInKnowledge } from '@/components/brand-vault/BrandDetail'

type BrandConfig = {
  colors?:      Record<string, string>
  fonts?:       Record<string, string>
  tagline?:     string
  tone?:        string
  audience?:    string
  products?:    string[]
  guidelines?:  string
  visualStyle?: string
  keyMessages?: string[]
  documentUrl?: string
  documentName?: string
}

interface Props {
  brand:     BrandProfile
  uploading: 'logo' | 'document' | null
  onEdit:    () => void
  onUpload:  (file: File, type: 'logo' | 'document') => void
}

export default function BrandDetailView({ brand, uploading, onEdit, onUpload }: Props) {
  const logoRef = useRef<HTMLInputElement>(null)
  const docRef  = useRef<HTMLInputElement>(null)
  const config  = brand.config as BrandConfig | null

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

      <BuiltInKnowledge type={brand.type} />

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
              <p className="text-sm text-brand-navy whitespace-pre-wrap mb-3">{config.guidelines}</p>
            )}
            <button type="button" onClick={() => docRef.current?.click()} disabled={uploading === 'document'}
              className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline disabled:opacity-50">
              <Upload size={11} />{uploading === 'document' ? 'Uploading…' : 'Replace document'}
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-400 mb-3">Add custom guidelines, talking points, or agent-specific context.<br />These are prepended to the built-in knowledge base in every AI prompt.</p>
            <button type="button" onClick={() => docRef.current?.click()} disabled={uploading === 'document'}
              className="px-4 py-2 bg-brand-azure text-white text-xs font-semibold rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-50">
              {uploading === 'document' ? 'Uploading…' : 'Upload Document'}
            </button>
          </div>
        )}
        <input ref={docRef} type="file" accept=".pdf,.txt" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, 'document') }} />
      </Section>

      <Section title="Logo">
        {brand.logoUrl ? (
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={brand.logoUrl} alt={brand.name} className="h-16 object-contain" />
            <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading === 'logo'}
              className="text-xs text-brand-azure hover:underline disabled:opacity-50">
              {uploading === 'logo' ? 'Uploading…' : 'Replace'}
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-400 mb-3">No logo uploaded yet.</p>
            <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading === 'logo'}
              className="px-4 py-2 bg-brand-azure text-white text-xs font-semibold rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-50">
              {uploading === 'logo' ? 'Uploading…' : 'Upload Logo'}
            </button>
          </div>
        )}
        <input ref={logoRef} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, 'logo') }} />
      </Section>
    </div>
  )
}
