'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'
import { BrandType, BrandProfile, TYPE_LABELS } from './types'

// ─── Field helper ─────────────────────────────────────────────────────────────

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline gap-2 mb-1">
        <label className="block text-xs font-medium text-gray-700">{label}</label>
        {hint && <span className="text-[10px] text-gray-400">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  brand:   BrandProfile
  onClose: () => void
  onSaved: (updated: BrandProfile) => void
}

export function EditModal({ brand, onClose, onSaved }: EditModalProps) {
  const config = (brand.config ?? {}) as Record<string, any>
  const [tagline,     setTagline]     = useState<string>(config.tagline     ?? '')
  const [tone,        setTone]        = useState<string>(config.tone        ?? '')
  const [audience,    setAudience]    = useState<string>(config.audience    ?? '')
  const [products,    setProducts]    = useState<string>((config.products    as string[] ?? []).join('\n'))
  const [guidelines,  setGuidelines]  = useState<string>(config.guidelines  ?? '')
  const [visualStyle, setVisualStyle] = useState<string>(config.visualStyle ?? '')
  const [keyMessages, setKeyMessages] = useState<string>((config.keyMessages as string[] ?? []).join('\n'))
  const [saving,      setSaving]      = useState(false)
  const [err,         setErr]         = useState('')

  async function handleSave() {
    setSaving(true); setErr('')
    try {
      const res = await fetch(`/api/v1/brands/${brand.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          tagline, tone, audience,
          products:    products.split('\n').map((s) => s.trim()).filter(Boolean),
          guidelines,  visualStyle,
          keyMessages: keyMessages.split('\n').map((s) => s.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) { setErr('Save failed. Please try again.'); return }
      const { brand: updated } = await res.json()
      onSaved(updated); onClose()
    } catch {
      setErr('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const inputCls = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent'
  const textareaCls = `${inputCls} resize-none`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-card shadow-card-hover overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-brand-navy text-sm">Edit — {brand.name}</p>
            <p className="text-[10px] text-gray-400">{TYPE_LABELS[brand.type]}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <Field label="Tagline">
            <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Protecting what matters most" className={inputCls} />
          </Field>
          <Field label="Tone of Voice">
            <textarea value={tone} onChange={(e) => setTone(e.target.value)} rows={2}
              placeholder="e.g. Professional, empathetic, straightforward. Avoids jargon." className={textareaCls} />
          </Field>
          <Field label="Target Audience">
            <textarea value={audience} onChange={(e) => setAudience(e.target.value)} rows={2}
              placeholder="e.g. Business owners, HR directors, and CFOs with 10–500 employees" className={textareaCls} />
          </Field>
          <Field label="Products & Offerings" hint="One per line">
            <textarea value={products} onChange={(e) => setProducts(e.target.value)} rows={4}
              placeholder={'SIMRP — Self-Insured Medical Reimbursement Plan\nWellness Plans\nSupplemental Benefits'} className={textareaCls} />
          </Field>
          <Field label="Key Messages" hint="One per line — core messaging pillars for copy generation">
            <textarea value={keyMessages} onChange={(e) => setKeyMessages(e.target.value)} rows={4}
              placeholder={'e.g.\nHelping families protect what matters most\nLife insurance made simple and affordable\nYour trusted financial guide'} className={textareaCls} />
          </Field>
          <Field label="Visual Style" hint="Guides image, graphic, and video generation">
            <textarea value={visualStyle} onChange={(e) => setVisualStyle(e.target.value)} rows={3}
              placeholder="e.g. Clean, modern, warm photography. Blue and white palette. Professional headshots in office settings." className={textareaCls} />
          </Field>
          <Field label="Custom Guidelines / Knowledge Base">
            <textarea value={guidelines} onChange={(e) => setGuidelines(e.target.value)} rows={5}
              placeholder="Paste brand guidelines, talking points, or product details. These are prepended to the built-in knowledge base in every AI prompt." className={textareaCls} />
          </Field>
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <Button size="sm" loading={saving} onClick={handleSave}>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}

// ─── Add Brand Modal ──────────────────────────────────────────────────────────

export function AddBrandModal({ onClose, onCreated }: { onClose: () => void; onCreated: (b: BrandProfile) => void }) {
  const [name,   setName]   = useState('')
  const [type,   setType]   = useState<BrandType>('LHC')
  const [saving, setSaving] = useState(false)
  const [err,    setErr]    = useState('')

  async function handleCreate() {
    if (!name.trim()) return
    setSaving(true); setErr('')
    try {
      const res = await fetch('/api/v1/brands', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), type }),
      })
      if (!res.ok) { setErr('Failed to create brand. Please try again.'); return }
      const { brand } = await res.json()
      onCreated(brand); onClose()
    } catch {
      setErr('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-card shadow-card-hover overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-semibold text-brand-navy text-sm">Add Brand</p>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <Field label="Brand Name">
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              placeholder="e.g. LH Capital — East Region" autoFocus
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
          </Field>
          <Field label="Brand Type">
            <div className="flex flex-col gap-1.5">
              {(['LHC', 'SIMRP', 'PERSONAL'] as BrandType[]).map((t) => (
                <button key={t} type="button" onClick={() => setType(t)}
                  className={cn(
                    'px-3 py-2 rounded-lg border-2 text-left text-xs font-medium transition-all',
                    type === t ? 'border-brand-azure bg-brand-azure/5 text-brand-azure' : 'border-gray-200 text-gray-600 hover:border-brand-azure',
                  )}>
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </Field>
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <Button size="sm" loading={saving} disabled={!name.trim()} onClick={handleCreate}>Create Brand</Button>
        </div>
      </div>
    </div>
  )
}
