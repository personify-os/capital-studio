'use client'

import { cn } from '@/lib/utils'
import { type ContentPillar, CONTENT_PILLARS } from './types'

interface Props {
  value:    ContentPillar | ''
  onChange: (v: ContentPillar | '') => void
}

export default function ContentPillarSelector({ value, onChange }: Props) {
  return (
    <div className="bg-gray-50 rounded-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Content Pillar</p>
        {value && (
          <button type="button" onClick={() => onChange('')}
            className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors">
            Clear
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {CONTENT_PILLARS.map((p) => (
          <button
            key={p.value}
            type="button"
            title={p.description}
            onClick={() => onChange(value === p.value ? '' : p.value)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
              value === p.value
                ? 'bg-brand-navy text-white border-brand-navy'
                : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy hover:text-brand-navy',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {value && (
        <p className="text-[10px] text-gray-400 mt-2 leading-snug">
          {CONTENT_PILLARS.find((p) => p.value === value)?.description}
        </p>
      )}
    </div>
  )
}
