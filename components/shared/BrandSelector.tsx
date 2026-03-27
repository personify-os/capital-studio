'use client'

import { BRAND_CONFIGS, type BrandId } from '@/lib/brands'
import { cn } from '@/lib/utils'

interface Props {
  value:    BrandId
  onChange: (id: BrandId) => void
}

const BRANDS: { id: BrandId; dot: string }[] = [
  { id: 'lhcapital', dot: '#0475ae' },
  { id: 'simrp',     dot: '#689EB8' },
  { id: 'personal',  dot: '#37ca37' },
]

export default function BrandSelector({ value, onChange }: Props) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Brand</p>
      <div className="flex gap-2">
        {BRANDS.map(({ id, dot }) => {
          const config  = BRAND_CONFIGS[id]
          const active  = value === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                active
                  ? 'border-[#041740] bg-[#041740] text-white'
                  : 'border-gray-200 text-gray-600 hover:border-[#0475ae] hover:text-[#0475ae]',
              )}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: dot }}
              />
              {config.shortName}
            </button>
          )
        })}
      </div>
    </div>
  )
}
