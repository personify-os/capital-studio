'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CTA_OPTIONS } from '@/lib/content-intent'
import type { ContentIntent } from '@/lib/content-intent'

const CTA_GROUP_LABELS: Record<'contact' | 'learn-more' | 'engage', string> = {
  contact:      'Contact',
  'learn-more': 'Learn More',
  engage:       'Engage',
}

const CTA_GROUPS = (['contact', 'learn-more', 'engage'] as const).map((g) => ({
  group:   g,
  options: CTA_OPTIONS.filter((c) => c.group === g),
}))

interface Props {
  ctaId:        string | null
  customCta:    string | null
  ctaPlacement: string | null
  onSelectCta:  (id: string) => void
  onChange:     (patch: Partial<ContentIntent>) => void
}

export default function CtaSelector({ ctaId, customCta, ctaPlacement, onSelectCta, onChange }: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-medium text-gray-500">Call to Action</p>
        <button
          type="button"
          onClick={() => onChange({ ctaId: null, customCta: null, ctaPlacement: null })}
          className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition-colors"
        >
          <X size={9} /> Clear
        </button>
      </div>

      {CTA_GROUPS.map(({ group, options }) => (
        <div key={group}>
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
            {CTA_GROUP_LABELS[group]}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {options.map((opt) => (
              <button key={opt.id} type="button" onClick={() => onSelectCta(opt.id)}
                className={cn(
                  'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors',
                  ctaId === opt.id
                    ? 'bg-brand-orange text-white border-brand-orange'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-orange hover:text-brand-orange',
                )}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <input
        type="text"
        maxLength={100}
        value={customCta ?? ''}
        onChange={(e) => onChange({ ctaId: null, customCta: e.target.value || null })}
        placeholder="Or type a custom CTA…"
        className="w-full px-2.5 py-1.5 text-[10px] rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder-gray-300 transition"
      />

      <div className="flex gap-1.5">
        {(['caption', 'graphic', 'both'] as const).map((p) => (
          <button key={p} type="button" onClick={() => onChange({ ctaPlacement: ctaPlacement === p ? null : p })}
            className={cn(
              'flex-1 text-[9px] py-1 rounded-lg border font-semibold capitalize transition-colors',
              ctaPlacement === p
                ? 'bg-brand-orange/10 text-brand-orange border-brand-orange'
                : 'bg-white text-gray-500 border-gray-200 hover:border-brand-orange hover:text-brand-orange',
            )}>
            {p}
          </button>
        ))}
      </div>
    </div>
  )
}
