'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  TOPIC_TIERS,
  PURPOSES,
  CTA_OPTIONS,
  QUICK_STARTS,
  type ContentIntent,
} from '@/lib/content-intent'

interface Props {
  value:    ContentIntent
  onChange: (v: ContentIntent) => void
}

const CTA_GROUP_LABELS: Record<'contact' | 'learn-more' | 'engage', string> = {
  contact:    'Contact',
  'learn-more': 'Learn More',
  engage:     'Engage',
}

export default function ContentIntentPanel({ value, onChange }: Props) {
  const [open,    setOpen]    = useState(true)
  const [ctaOpen, setCtaOpen] = useState(false)

  const hasAny = !!(value.tier1Id || value.tier2Id || value.purposeId || value.ctaId || value.customCta)

  const activeTier1   = TOPIC_TIERS.find((t) => t.id === value.tier1Id)
  const activeTier2   = activeTier1?.subtopics.find((s) => s.id === value.tier2Id)
  const activePurpose = PURPOSES.find((p) => p.id === value.purposeId)
  const activeCta     = CTA_OPTIONS.find((c) => c.id === value.ctaId)

  function set(patch: Partial<ContentIntent>) {
    onChange({ ...value, ...patch })
  }

  function clear() {
    onChange({ tier1Id: null, tier2Id: null, purposeId: null, ctaId: null, customCta: null, ctaPlacement: null })
    setCtaOpen(false)
  }

  function selectTier1(id: string) {
    const next = value.tier1Id === id ? null : id
    set({ tier1Id: next, tier2Id: null })
  }

  function selectTier2(id: string) {
    set({ tier2Id: value.tier2Id === id ? null : id })
  }

  function selectPurpose(id: string) {
    set({ purposeId: value.purposeId === id ? null : id })
  }

  function selectCta(id: string) {
    set({ ctaId: value.ctaId === id ? null : id, customCta: null })
  }

  function applyQuickStart(idx: number) {
    const qs = QUICK_STARTS[idx]
    if (!qs) return
    onChange({
      tier1Id:      qs.tier1Id,
      tier2Id:      qs.tier2Id,
      purposeId:    qs.purposeId,
      ctaId:        qs.ctaId ?? null,
      customCta:    null,
      ctaPlacement: null,
    })
    if (qs.ctaId) setCtaOpen(true)
  }

  const ctaGroups = (['contact', 'learn-more', 'engage'] as const).map((g) => ({
    group:   g,
    options: CTA_OPTIONS.filter((c) => c.group === g),
  }))

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
                  className="text-[10px] px-2 py-1 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-brand-azure hover:text-brand-azure transition-colors"
                >
                  {qs.icon} {qs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tier 1 — Topic categories */}
          <div>
            <p className="text-[10px] font-medium text-gray-500 mb-2">Topic</p>
            <div className="flex flex-wrap gap-1.5">
              {TOPIC_TIERS.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => selectTier1(cat.id)}
                  className={cn(
                    'text-[10px] px-2.5 py-1 rounded-full border font-medium transition-colors',
                    value.tier1Id === cat.id
                      ? 'bg-brand-azure text-white border-brand-azure'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
                  )}
                >
                  {cat.icon} {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tier 2 — Subtopics */}
          {activeTier1 && (
            <div className="pl-2 border-l border-brand-azure/20">
              <p className="text-[10px] font-medium text-gray-500 mb-2">More specifically</p>
              <div className="flex flex-wrap gap-1.5">
                {activeTier1.subtopics.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => selectTier2(sub.id)}
                    className={cn(
                      'text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors',
                      value.tier2Id === sub.id
                        ? 'bg-brand-navy text-white border-brand-navy'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy hover:text-brand-navy',
                    )}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Purpose */}
          <div>
            <p className="text-[10px] font-medium text-gray-500 mb-2">Purpose</p>
            <div className="flex flex-wrap gap-1.5">
              {PURPOSES.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => selectPurpose(p.id)}
                  className={cn(
                    'text-[10px] px-2.5 py-1 rounded-full border font-medium transition-colors',
                    value.purposeId === p.id
                      ? 'bg-brand-navy text-white border-brand-navy'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy hover:text-brand-navy',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div>
            {!ctaOpen && !value.ctaId && !value.customCta ? (
              <button
                type="button"
                onClick={() => setCtaOpen(true)}
                className="w-full text-[10px] py-1.5 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-orange hover:text-brand-orange transition-colors text-center"
              >
                + Add a Call to Action (optional)
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-medium text-gray-500">Call to Action</p>
                  <button
                    type="button"
                    onClick={() => { set({ ctaId: null, customCta: null, ctaPlacement: null }); setCtaOpen(false) }}
                    className="text-[10px] text-gray-400 hover:text-gray-600 flex items-center gap-0.5 transition-colors"
                  >
                    <X size={9} /> Remove
                  </button>
                </div>

                {ctaGroups.map(({ group, options }) => (
                  <div key={group}>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-1">
                      {CTA_GROUP_LABELS[group]}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {options.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => selectCta(opt.id)}
                          className={cn(
                            'text-[10px] px-2 py-0.5 rounded-full border font-medium transition-colors',
                            value.ctaId === opt.id
                              ? 'bg-brand-orange text-white border-brand-orange'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-brand-orange hover:text-brand-orange',
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Custom CTA text input */}
                <input
                  type="text"
                  maxLength={100}
                  value={value.customCta ?? ''}
                  onChange={(e) => set({ ctaId: null, customCta: e.target.value || null })}
                  placeholder="Or type a custom CTA…"
                  className="w-full px-2.5 py-1.5 text-[10px] rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange placeholder-gray-300 transition"
                />

                {/* CTA placement selector */}
                <div className="flex gap-1.5">
                  {(['caption', 'graphic', 'both'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => set({ ctaPlacement: value.ctaPlacement === p ? null : p })}
                      className={cn(
                        'flex-1 text-[9px] py-1 rounded-lg border font-semibold capitalize transition-colors',
                        value.ctaPlacement === p
                          ? 'bg-brand-orange/10 text-brand-orange border-brand-orange'
                          : 'bg-white text-gray-500 border-gray-200 hover:border-brand-orange hover:text-brand-orange',
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
