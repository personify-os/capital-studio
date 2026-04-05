'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import {
  TOPIC_TIERS,
  PURPOSES,
  CTA_OPTIONS,
  QUICK_STARTS,
  type ContentIntent,
} from '@/lib/content-intent'
import CtaSelector from './CtaSelector'
import TopicPicker from './TopicPicker'
import PurposePicker from './PurposePicker'

interface Props {
  value:    ContentIntent
  onChange: (v: ContentIntent) => void
}

export default function ContentIntentPanel({ value, onChange }: Props) {
  const [open, setOpen] = useState(true)

  const hasAny = !!(value.tier1Id || value.tier2Id || value.purposeId || value.ctaId || value.customCta || value.customTopic || value.customPurpose)

  const activeTier1   = TOPIC_TIERS.find((t) => t.id === value.tier1Id)
  const activeTier2   = activeTier1?.subtopics.find((s) => s.id === value.tier2Id)
  const activePurpose = PURPOSES.find((p) => p.id === value.purposeId)
  const activeCta     = CTA_OPTIONS.find((c) => c.id === value.ctaId)

  function set(patch: Partial<ContentIntent>) {
    onChange({ ...value, ...patch })
  }

  function clear() {
    onChange({ tier1Id: null, tier2Id: null, purposeId: null, ctaId: null, customCta: null, ctaPlacement: null, customTopic: null, customPurpose: null })
  }

  function selectTier1(id: string) {
    const next = value.tier1Id === id ? null : id
    set({ tier1Id: next, tier2Id: null, customTopic: null })
  }

  function selectTier2(id: string) {
    set({ tier2Id: value.tier2Id === id ? null : id })
  }

  function selectPurpose(id: string) {
    set({ purposeId: value.purposeId === id ? null : id, customPurpose: null })
  }

  function selectCta(id: string) {
    set({ ctaId: value.ctaId === id ? null : id, customCta: null })
  }

  function applyQuickStart(idx: number) {
    const qs = QUICK_STARTS[idx]
    if (!qs) return
    onChange({
      tier1Id:       qs.tier1Id,
      tier2Id:       qs.tier2Id,
      purposeId:     qs.purposeId,
      ctaId:         qs.ctaId ?? null,
      customCta:     null,
      ctaPlacement:  null,
      customTopic:   null,
      customPurpose: null,
    })
  }

  return (
    <div className="bg-gray-50 rounded-card p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Content Intent</p>
          <span className="text-[10px] text-gray-400">(optional)</span>
        </div>
        <div className="flex items-center gap-2">
          {hasAny && (
            <button
              type="button"
              onClick={clear}
              className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition-colors"
            >
              <X size={10} /> Clear
            </button>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Active chips summary */}
      {hasAny && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {activeTier1 && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-azure/10 text-brand-azure font-medium">
              {activeTier1.icon} {activeTier2 ? activeTier2.label : activeTier1.label}
            </span>
          )}
          {activePurpose && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-navy/10 text-brand-navy font-medium">
              {activePurpose.label}
            </span>
          )}
          {(activeCta || value.customCta) && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-orange/10 text-brand-orange font-medium">
              {value.customCta ? 'Custom CTA' : activeCta?.label}
            </span>
          )}
        </div>
      )}

      {open && (
        <div className="space-y-4">
          {/* Quick Starts */}
          <div>
            <p className="text-[10px] font-medium text-gray-500 mb-2">⚡ Quick Start</p>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_STARTS.map((qs, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyQuickStart(i)}
                  className="text-xs px-3 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-brand-azure hover:text-brand-azure transition-colors"
                >
                  {qs.icon} {qs.label}
                </button>
              ))}
            </div>
          </div>

          <TopicPicker
            tier1Id={value.tier1Id}       tier2Id={value.tier2Id}
            customTopic={value.customTopic ?? null}
            onSelectTier1={selectTier1}   onSelectTier2={selectTier2}
            onCustomTopic={(v) => set({ customTopic: v })}
          />

          <PurposePicker
            purposeId={value.purposeId}   customPurpose={value.customPurpose ?? null}
            onSelect={selectPurpose}
            onCustomChange={(v) => set({ customPurpose: v })}
          />

          {/* CTA */}
          <CtaSelector
            ctaId={value.ctaId}
            customCta={value.customCta}
            ctaPlacement={value.ctaPlacement}
            onSelectCta={selectCta}
            onChange={set}
          />
        </div>
      )}
    </div>
  )
}
