'use client'

import { cn } from '@/lib/utils'
import { PURPOSES } from '@/lib/content-intent'

interface Props {
  purposeId:      string | null
  customPurpose:  string | null
  onSelect:       (id: string) => void
  onCustomChange: (v: string | null) => void
}

const pillBase = 'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors'

export default function PurposePicker({ purposeId, customPurpose, onSelect, onCustomChange }: Props) {
  return (
    <div>
      <p className="text-[10px] font-medium text-gray-500 mb-2">Purpose</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {PURPOSES.map((p) => (
          <button key={p.id} type="button" onClick={() => onSelect(p.id)}
            className={cn(pillBase, purposeId === p.id
              ? 'bg-brand-navy text-white border-brand-navy'
              : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy hover:text-brand-navy')}>
            {p.label}
          </button>
        ))}
      </div>
      {!purposeId && (
        <input type="text" value={customPurpose ?? ''} onChange={(e) => onCustomChange(e.target.value || null)}
          placeholder="Or describe the purpose…"
          className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-navy/30 focus:border-brand-navy placeholder-gray-300 transition" />
      )}
    </div>
  )
}
