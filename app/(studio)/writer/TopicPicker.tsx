'use client'

import { cn } from '@/lib/utils'
import { TOPIC_TIERS } from '@/lib/content-intent'

interface Props {
  tier1Id:         string | null
  tier2Id:         string | null
  customTopic:     string | null
  onSelectTier1:   (id: string) => void
  onSelectTier2:   (id: string) => void
  onCustomTopic:   (v: string | null) => void
}

const pillBase = 'text-xs px-3 py-1.5 rounded-full border font-medium transition-colors'

export default function TopicPicker({ tier1Id, tier2Id, customTopic, onSelectTier1, onSelectTier2, onCustomTopic }: Props) {
  const activeTier1 = TOPIC_TIERS.find((t) => t.id === tier1Id)

  return (
    <div>
      <p className="text-[10px] font-medium text-gray-500 mb-2">Topic</p>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {TOPIC_TIERS.filter((cat) => cat.id !== 'personal-brand').map((cat) => (
          <button key={cat.id} type="button" onClick={() => onSelectTier1(cat.id)}
            className={cn(pillBase, tier1Id === cat.id
              ? 'bg-brand-azure text-white border-brand-azure'
              : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure')}>
            {cat.icon} {cat.label}
          </button>
        ))}
      </div>
      {!tier1Id && (
        <input type="text" value={customTopic ?? ''} onChange={(e) => onCustomTopic(e.target.value || null)}
          placeholder="Or type a custom topic…"
          className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-azure/30 focus:border-brand-azure placeholder-gray-300 transition" />
      )}
      {activeTier1 && (
        <div className="mt-3 pl-2 border-l border-brand-azure/20">
          <p className="text-[10px] font-medium text-gray-500 mb-2">More specifically</p>
          <div className="flex flex-wrap gap-1.5">
            {activeTier1.subtopics.map((sub) => (
              <button key={sub.id} type="button" onClick={() => onSelectTier2(sub.id)}
                className={cn(pillBase, tier2Id === sub.id
                  ? 'bg-brand-navy text-white border-brand-navy'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy hover:text-brand-navy')}>
                {sub.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
