'use client'

import { useState, useRef } from 'react'
import { BookOpen, Edit2, Plus, CheckCircle, X, Upload, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from '@/components/ui/Button'

type BrandType = 'LHC' | 'SIMRP' | 'PERSONAL'

interface BrandProfile {
  id:        string
  type:      BrandType
  name:      string
  logoUrl:   string | null
  config:    any
  isDefault: boolean
}

interface Props { brands: BrandProfile[] }

const TYPE_LABELS: Record<BrandType, string> = {
  LHC:      'LH Capital',
  SIMRP:    'The SIMRP',
  PERSONAL: 'Personal Brand',
}

const TYPE_COLORS: Record<BrandType, string> = {
  LHC:      'bg-brand-azure/10 text-brand-azure border-brand-azure/20',
  SIMRP:    'bg-brand-light/10 text-brand-light border-brand-light/20',
  PERSONAL: 'bg-brand-green/10 text-brand-green border-brand-green/20',
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

interface EditModalProps {
  brand:    BrandProfile
  onClose:  () => void
  onSaved:  (updated: BrandProfile) => void
}

function EditModal({ brand, onClose, onSaved }: EditModalProps) {
  const config = (brand.config ?? {}) as Record<string, any>
  const [tagline,    setTagline]    = useState<string>(config.tagline    ?? '')
  const [tone,       setTone]       = useState<string>(config.tone       ?? '')
  const [audience,   setAudience]   = useState<string>(config.audience   ?? '')
  const [products,   setProducts]   = useState<string>((config.products as string[] ?? []).join('\n'))
  const [guidelines, setGuidelines] = useState<string>(config.guidelines ?? '')
  const [saving,     setSaving]     = useState(false)
  const [err,        setErr]        = useState('')

  async function handleSave() {
    setSaving(true)
    setErr('')
    try {
      const res = await fetch(`/api/v1/brands/${brand.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          tagline,
          tone,
          audience,
          products:   products.split('\n').map((s) => s.trim()).filter(Boolean),
          guidelines,
        }),
      })
      if (!res.ok) { setErr('Save failed. Please try again.'); return }
      const { brand: updated } = await res.json()
      onSaved(updated)
      onClose()
    } catch {
      setErr('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg bg-white rounded-card shadow-card-hover overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-brand-navy text-sm">Edit — {brand.name}</p>
            <p className="text-[10px] text-gray-400">{TYPE_LABELS[brand.type]}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Fields */}
        <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
          <Field label="Tagline">
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. Protecting what matters most"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
            />
          </Field>
          <Field label="Tone of Voice">
            <textarea
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              rows={2}
              placeholder="e.g. Professional, empathetic, straightforward. Avoids jargon."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
            />
          </Field>
          <Field label="Target Audience">
            <textarea
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              rows={2}
              placeholder="e.g. Business owners, HR directors, and CFOs with 10–500 employees"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
            />
          </Field>
          <Field label="Products & Offerings" hint="One per line">
            <textarea
              value={products}
              onChange={(e) => setProducts(e.target.value)}
              rows={4}
              placeholder="SIMRP — Self-Insured Medical Reimbursement Plan&#10;Wellness Plans&#10;Supplemental Benefits"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
            />
          </Field>
          <Field label="Knowledge Base / Guidelines">
            <textarea
              value={guidelines}
              onChange={(e) => setGuidelines(e.target.value)}
              rows={5}
              placeholder="Paste brand guidelines, talking points, or product details. This is injected into AI prompts for brand-accurate generation."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
            />
          </Field>
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <Button size="sm" loading={saving} onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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

// ─── Add Brand Modal ──────────────────────────────────────────────────────────

function AddBrandModal({ onClose, onCreated }: { onClose: () => void; onCreated: (b: BrandProfile) => void }) {
  const [name,    setName]    = useState('')
  const [type,    setType]    = useState<BrandType>('LHC')
  const [saving,  setSaving]  = useState(false)
  const [err,     setErr]     = useState('')

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
      onCreated(brand)
      onClose()
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
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. LH Capital — East Region"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
              autoFocus
            />
          </Field>
          <Field label="Brand Type">
            <div className="flex flex-col gap-1.5">
              {(['LHC', 'SIMRP', 'PERSONAL'] as BrandType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'px-3 py-2 rounded-lg border-2 text-left text-xs font-medium transition-all',
                    type === t ? 'border-brand-azure bg-brand-azure/5 text-brand-azure' : 'border-gray-200 text-gray-600 hover:border-brand-azure',
                  )}
                >
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
          <Button size="sm" loading={saving} disabled={!name.trim()} onClick={handleCreate}>
            Create Brand
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function BrandVaultClient({ brands: initial }: Props) {
  const [brands,    setBrands]    = useState(initial)
  const [selected,  setSelected]  = useState<BrandProfile | null>(brands[0] ?? null)
  const [editing,   setEditing]   = useState(false)
  const [adding,    setAdding]    = useState(false)
  const [uploading, setUploading] = useState<'logo' | 'document' | null>(null)
  const logoRef = useRef<HTMLInputElement>(null)
  const docRef  = useRef<HTMLInputElement>(null)

  const config = selected?.config as {
    colors?:       Record<string, string>
    fonts?:        Record<string, string>
    tagline?:      string
    tone?:         string
    audience?:     string
    products?:     string[]
    guidelines?:   string
    documentUrl?:  string
    documentName?: string
  } | null

  function handleSaved(updated: BrandProfile) {
    setBrands((prev) => prev.map((b) => b.id === updated.id ? { ...b, ...updated } : b))
    setSelected((prev) => prev?.id === updated.id ? { ...prev, ...updated } : prev)
  }

  async function handleUpload(file: File, type: 'logo' | 'document') {
    if (!selected) return
    setUploading(type)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', type)
      const res  = await fetch(`/api/v1/brands/${selected.id}/upload`, { method: 'POST', body: form })
      const json = await res.json()
      if (json.url) {
        const updated = { ...selected,
          ...(type === 'logo' ? { logoUrl: json.url } : {}),
          config: type === 'document'
            ? { ...selected.config, documentUrl: json.url, documentName: json.name }
            : selected.config,
        }
        handleSaved(updated as BrandProfile)
      }
    } finally {
      setUploading(null)
    }
  }

  function handleCreated(brand: BrandProfile) {
    setBrands((prev) => [...prev, brand])
    setSelected(brand)
  }

  return (
    <>
      {editing && selected && (
        <EditModal brand={selected} onClose={() => setEditing(false)} onSaved={handleSaved} />
      )}
      {adding && (
        <AddBrandModal onClose={() => setAdding(false)} onCreated={handleCreated} />
      )}

      <div className="flex h-full min-h-screen bg-app-bg">
        {/* ── Brand list ─────────────────────────────────────────────── */}
        <div className="w-64 flex-shrink-0 h-screen overflow-y-auto p-4 border-r border-gray-100 bg-white">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 px-1">Brands</p>
          <div className="space-y-1">
            {brands.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelected(b)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors',
                  selected?.id === b.id ? 'bg-brand-navy text-white' : 'hover:bg-gray-50 text-gray-700',
                )}
              >
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', {
                  'bg-brand-azure': b.type === 'LHC',
                  'bg-brand-light': b.type === 'SIMRP',
                  'bg-brand-green':  b.type === 'PERSONAL',
                })} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{b.name}</p>
                  <p className={cn('text-[10px]', selected?.id === b.id ? 'text-white/60' : 'text-gray-400')}>
                    {TYPE_LABELS[b.type]}
                  </p>
                </div>
                {b.isDefault && (
                  <CheckCircle size={12} className={selected?.id === b.id ? 'text-white/60' : 'text-brand-azure'} />
                )}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setAdding(true)}
            className="flex items-center gap-2 w-full px-3 py-2.5 mt-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand-azure hover:text-brand-azure transition-colors text-xs font-medium"
          >
            <Plus size={13} /> Add Brand
          </button>
        </div>

        {/* ── Brand detail ───────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <BookOpen size={26} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Select a brand to view its settings</p>
            </div>
          ) : (
            <div className="max-w-2xl">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className={cn('inline-flex items-center px-2.5 py-1 rounded-full border text-[10px] font-semibold uppercase tracking-wide mb-2', TYPE_COLORS[selected.type])}>
                    {TYPE_LABELS[selected.type]}
                  </div>
                  <h2 className="text-xl font-bold text-brand-navy">{selected.name}</h2>
                  {config?.tagline && <p className="text-sm text-gray-500 mt-0.5 italic">"{config.tagline}"</p>}
                </div>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline px-3 py-1.5 border border-brand-azure/20 rounded-lg hover:bg-brand-azure/5 transition-colors"
                >
                  <Edit2 size={12} /> Edit
                </button>
              </div>

              {/* Colors */}
              {config?.colors && (
                <Section title="Colors">
                  <div className="flex flex-wrap gap-3">
                    {Object.entries(config.colors).map(([name, hex]) => (
                      <div key={name} className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg border border-gray-200 shadow-sm" style={{ backgroundColor: hex as string }} />
                        <div>
                          <p className="text-xs font-medium text-brand-navy capitalize">{name}</p>
                          <p className="text-[10px] text-gray-400 font-mono">{hex as string}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Section>
              )}

              {/* Tone & Audience */}
              {(config?.tone || config?.audience) && (
                <Section title="Voice & Audience">
                  {config?.tone && (
                    <div className="mb-3">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Tone</p>
                      <p className="text-sm text-brand-navy">{config.tone}</p>
                    </div>
                  )}
                  {config?.audience && (
                    <div>
                      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Target Audience</p>
                      <p className="text-sm text-brand-navy">{config.audience}</p>
                    </div>
                  )}
                </Section>
              )}

              {/* Products */}
              {config?.products && config.products.length > 0 && (
                <Section title="Products & Offerings">
                  <ul className="space-y-1">
                    {config.products.map((p: string) => (
                      <li key={p} className="flex items-start gap-2 text-sm text-brand-navy">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-brand-azure flex-shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {/* Knowledge base / guidelines */}
              <Section title="Knowledge Base">
                {config?.guidelines ? (
                  <div>
                    <p className="text-sm text-brand-navy whitespace-pre-wrap mb-3">{config.guidelines}</p>
                    <button
                      type="button"
                      onClick={() => docRef.current?.click()}
                      disabled={uploading === 'document'}
                      className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline disabled:opacity-50"
                    >
                      <Upload size={11} />
                      {uploading === 'document' ? 'Uploading…' : 'Replace document'}
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    {config?.documentName ? (
                      <div className="flex items-center gap-2 justify-center mb-3">
                        <FileText size={16} className="text-brand-azure" />
                        <p className="text-sm text-brand-navy font-medium">{config.documentName}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 mb-3">
                        Upload brand guidelines, product docs, or talking points.<br />
                        This content is injected into AI prompts for brand-accurate generation.
                      </p>
                    )}
                    <button
                      type="button"
                      onClick={() => docRef.current?.click()}
                      disabled={uploading === 'document'}
                      className="px-4 py-2 bg-brand-azure text-white text-xs font-semibold rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-50"
                    >
                      {uploading === 'document' ? 'Uploading…' : config?.documentName ? 'Replace Document' : 'Upload Document'}
                    </button>
                  </div>
                )}
                <input
                  ref={docRef}
                  type="file"
                  accept=".pdf,.txt"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'document') }}
                />
              </Section>

              {/* Logo */}
              <Section title="Logo">
                {selected.logoUrl ? (
                  <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selected.logoUrl} alt={selected.name} className="h-16 object-contain" />
                    <button
                      type="button"
                      onClick={() => logoRef.current?.click()}
                      disabled={uploading === 'logo'}
                      className="text-xs text-brand-azure hover:underline disabled:opacity-50"
                    >
                      {uploading === 'logo' ? 'Uploading…' : 'Replace'}
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-400 mb-3">No logo uploaded yet.</p>
                    <button
                      type="button"
                      onClick={() => logoRef.current?.click()}
                      disabled={uploading === 'logo'}
                      className="px-4 py-2 bg-brand-azure text-white text-xs font-semibold rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-50"
                    >
                      {uploading === 'logo' ? 'Uploading…' : 'Upload Logo'}
                    </button>
                  </div>
                )}
                <input
                  ref={logoRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f, 'logo') }}
                />
              </Section>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-card shadow-card p-5 mb-4">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-4">{title}</p>
      {children}
    </div>
  )
}
