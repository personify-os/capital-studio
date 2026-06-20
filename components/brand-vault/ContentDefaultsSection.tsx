'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { Section } from './BrandDetail'
import type { BrandProfile } from './types'
import {
  CAPTION_MODELS, IMAGE_STYLES, DEFAULT_CAPTION_MODEL, DEFAULT_IMAGE_STYLE,
  type CaptionModelId, type ImageStyleId, type ContentDefaults,
} from '@/lib/content-plan-options'

const selectCls = 'text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-azure/30'

export default function ContentDefaultsSection({ brand, onBrandUpdate }: {
  brand:         BrandProfile
  onBrandUpdate: (b: BrandProfile) => void
}) {
  const cd = (brand.config as { contentDefaults?: ContentDefaults } | null)?.contentDefaults ?? {}
  const [captionModel, setCaptionModel] = useState<CaptionModelId>(cd.captionModel ?? DEFAULT_CAPTION_MODEL)
  const [imageStyle,   setImageStyle]   = useState<ImageStyleId>(cd.imageStyle ?? DEFAULT_IMAGE_STYLE)
  const [saving, setSaving] = useState(false)
  const [saved,  setSaved]  = useState(false)

  async function save(next: ContentDefaults) {
    const contentDefaults: ContentDefaults = { captionModel, imageStyle, ...next }
    setSaving(true); setSaved(false)
    try {
      const res = await fetch(`/api/v1/brands/${brand.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentDefaults }),
      })
      if (res.ok) {
        onBrandUpdate({ ...brand, config: { ...((brand.config as object) ?? {}), contentDefaults } } as BrandProfile)
        setSaved(true); setTimeout(() => setSaved(false), 1500)
      }
    } finally { setSaving(false) }
  }

  return (
    <Section title="Content Plan Defaults">
      <p className="text-[11px] text-gray-400 mb-3">Applied for everyone in this account when this brand is selected in the Content Plan.</p>
      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Caption model</span>
          <select value={captionModel} className={selectCls}
            onChange={(e) => { const m = e.target.value as CaptionModelId; setCaptionModel(m); save({ captionModel: m }) }}>
            {CAPTION_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Image style</span>
          <select value={imageStyle} className={selectCls}
            onChange={(e) => { const s = e.target.value as ImageStyleId; setImageStyle(s); save({ imageStyle: s }) }}>
            {(Object.keys(IMAGE_STYLES) as ImageStyleId[]).map((k) => <option key={k} value={k}>{IMAGE_STYLES[k].label}</option>)}
          </select>
        </label>
        {saving && <span className="flex items-center gap-1 text-[11px] text-gray-400 pb-1.5"><Loader2 size={11} className="animate-spin" /> Saving…</span>}
        {saved && <span className="flex items-center gap-1 text-[11px] text-green-600 pb-1.5"><Check size={11} /> Saved</span>}
      </div>
    </Section>
  )
}
