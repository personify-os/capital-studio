'use client'

import { useRef } from 'react'
import { Upload, Plus, Trash2 } from 'lucide-react'
import { Section } from '@/components/brand-vault/BrandDetail'
import type { BrandProfile, BrandConfig } from '@/components/brand-vault/types'

const LOGO_IMAGE_ACCEPT = 'image/png,image/jpeg,image/webp,image/svg+xml'

// Named logo slots users can upload to
const LOGO_SLOTS: { slot: string; label: string }[] = [
  { slot: 'horizontal', label: 'Horizontal' },
  { slot: 'icon',       label: 'Icon / Mark' },
  { slot: 'dark',       label: 'Dark Background' },
  { slot: 'white',      label: 'White / Reversed' },
]

interface Props {
  brand:         BrandProfile
  config:        BrandConfig | null
  uploading:     'logo' | 'document' | string | null  // string = logo variant slot
  onUpload:      (file: File, type: 'logo' | 'document', logoSlot?: string) => void
  onBrandUpdate: (updated: BrandProfile) => void
}

export default function LogoSection({ brand, config, uploading, onUpload, onBrandUpdate }: Props) {
  const logoRef = useRef<HTMLInputElement>(null)
  const variantRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const logoVariants = config?.logoVariants ?? []

  async function deleteLogoVariant(slot: string) {
    const updated = logoVariants.filter((v) => v.label !== slot)
    try {
      const res = await fetch(`/api/v1/brands/${brand.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ logoVariants: updated }),
      })
      if (!res.ok) return
      const { brand: updatedBrand } = await res.json()
      onBrandUpdate(updatedBrand)
    } catch { /* ignore */ }
  }

  return (
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
      <input ref={logoRef} type="file" accept={LOGO_IMAGE_ACCEPT} className="hidden"
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
                type="file" accept={LOGO_IMAGE_ACCEPT} className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, 'logo', slot) }}
              />
            </div>
          )
        })}
      </div>
    </Section>
  )
}
