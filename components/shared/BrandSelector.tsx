'use client'

import { BRAND_CONFIGS, type BrandId } from '@/lib/brands'
import { cn } from '@/lib/utils'

interface Props {
  value:    BrandId
  onChange: (id: BrandId) => void
}

const BRAND_IDS: BrandId[] = ['lhcapital', 'simrp', 'personal']

export default function BrandSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Brand</p>
      <div className="flex gap-2">
        {BRAND_IDS.map((id) => {
          const config = BRAND_CONFIGS[id]
          const active = value === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                active
                  ? 'border-brand-navy bg-brand-navy text-white'
                  : 'border-gray-200 text-gray-600 hover:border-brand-azure hover:text-brand-azure',
              )}
            >
              {/* dot color comes from lib/brands.ts — the approved source of truth */}
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: config.colors.primary }}
              />
              {config.shortName}
            </button>
          )
        })}
      </div>
    </div>
  )
}
