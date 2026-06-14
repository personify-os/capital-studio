'use client'

import { useState } from 'react'
import { BookOpen, Plus, CheckCircle, AlertCircle, GripVertical, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandProfile, TYPE_LABELS } from '@/components/brand-vault/types'
import { EditModal, AddBrandModal } from '@/components/brand-vault/BrandModals'
import BrandDetailView from '@/components/brand-vault/BrandDetailView'

interface Props { brands: BrandProfile[] }

export default function BrandVaultClient({ brands: initial }: Props) {
  const [brands,       setBrands]       = useState(initial)
  const [selected,     setSelected]     = useState<BrandProfile | null>(brands[0] ?? null)
  const [editing,      setEditing]      = useState(false)
  const [adding,       setAdding]       = useState(false)
  const [uploading,    setUploading]    = useState<string | null>(null)  // 'logo' | 'document' | logoSlot
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [dragId,       setDragId]       = useState<string | null>(null)

  function handleDrop(targetId: string) {
    if (!dragId || dragId === targetId) { setDragId(null); return }
    setBrands((prev) => {
      const from = prev.findIndex((b) => b.id === dragId)
      const to   = prev.findIndex((b) => b.id === targetId)
      if (from < 0 || to < 0) return prev
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      // Persist the new order (best-effort; UI already reflects it)
      fetch('/api/v1/brands/reorder', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderedIds: next.map((b) => b.id) }),
      }).catch(() => {})
      return next
    })
    setDragId(null)
  }

  async function handleSetDefault(id: string) {
    try {
      const res = await fetch(`/api/v1/brands/${id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isDefault: true }),
      })
      if (!res.ok) return
      setBrands((prev) => prev.map((b) => ({ ...b, isDefault: b.id === id })))
      setSelected((prev) => (prev ? { ...prev, isDefault: prev.id === id } : prev))
    } catch { /* ignore */ }
  }

  function handleSaved(updated: BrandProfile) {
    setBrands((prev) => prev.map((b) => b.id === updated.id ? { ...b, ...updated } : b))
    setSelected((prev) => prev?.id === updated.id ? { ...prev, ...updated } : prev)
  }

  async function handleUpload(file: File, type: 'logo' | 'document', logoSlot?: string) {
    if (!selected) return
    const uploadKey = type === 'logo' ? (logoSlot ?? 'logo') : 'document'
    setUploading(uploadKey); setUploadStatus(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', type)
      if (logoSlot) form.append('logoSlot', logoSlot)
      const res  = await fetch(`/api/v1/brands/${selected.id}/upload`, { method: 'POST', body: form })
      const json = await res.json().catch(() => ({} as Record<string, unknown>))
      if (!res.ok) { setUploadStatus({ type: 'error', message: (json.message as string) ?? 'Upload failed — please try again' }); return }
      if (json.url) {
        const updatedConfig = (selected.config ?? {}) as Record<string, unknown>
        if (type === 'logo' && (!logoSlot || logoSlot === 'primary')) {
          handleSaved({ ...selected, logoUrl: json.url } as BrandProfile)
        } else if (type === 'logo' && logoSlot && logoSlot !== 'primary') {
          const variants = (updatedConfig.logoVariants as { label: string; url: string }[] | undefined) ?? []
          handleSaved({ ...selected, config: { ...updatedConfig, logoVariants: [...variants.filter((v) => v.label !== logoSlot), { label: logoSlot, url: json.url }] } } as BrandProfile)
        } else {
          handleSaved({ ...selected, config: { ...updatedConfig, documentUrl: json.url, documentName: json.name } } as BrandProfile)
        }
        setUploadStatus({ type: 'success', message: type === 'logo' ? 'Logo uploaded' : 'Document uploaded and knowledge base updated' })
        setTimeout(() => setUploadStatus(null), 4000)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Upload failed — please try again'
      setUploadStatus({ type: 'error', message: msg })
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
      {editing && selected && <EditModal brand={selected} onClose={() => setEditing(false)} onSaved={handleSaved} />}
      {adding  && <AddBrandModal onClose={() => setAdding(false)} onCreated={handleCreated} />}
      {uploadStatus && (
        <div className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium',
          uploadStatus.type === 'error' ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700',
        )}>
          {uploadStatus.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
          {uploadStatus.message}
        </div>
      )}

      <div className="flex h-full min-h-screen bg-app-bg">
        {/* Brand list */}
        <div className="w-64 flex-shrink-0 h-screen overflow-y-auto p-4 border-r border-gray-100 bg-white">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3 px-1">Brands</p>
          <div className="space-y-1">
            {brands.map((b) => {
              const active = selected?.id === b.id
              return (
                <div
                  key={b.id}
                  draggable
                  onDragStart={() => setDragId(b.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); handleDrop(b.id) }}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => setSelected(b)}
                  className={cn(
                    'group w-full text-left px-2 py-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer',
                    active ? 'bg-brand-navy text-white' : 'hover:bg-gray-50 text-gray-700',
                    dragId === b.id && 'opacity-50',
                  )}
                >
                  <GripVertical size={13} className={cn('flex-shrink-0 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity', active ? 'text-white/50' : 'text-gray-300')} />
                  <span className={cn('w-2 h-2 rounded-full flex-shrink-0', {
                    'bg-brand-azure':   b.type === 'LHC',
                    'bg-brand-light':   b.type === 'SIMRP',
                    'bg-brand-emerald': b.type === 'ESPA',
                    'bg-brand-green':   b.type === 'PERSONAL',
                  })} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{b.name}</p>
                    <p className={cn('text-[10px]', active ? 'text-white/60' : 'text-gray-400')}>
                      {TYPE_LABELS[b.type]}
                    </p>
                  </div>
                  {b.isDefault ? (
                    <span title="Default brand" className="flex-shrink-0">
                      <CheckCircle size={14} className={active ? 'text-white' : 'text-brand-azure'} />
                    </span>
                  ) : (
                    <button
                      type="button"
                      title="Set as default"
                      onClick={(e) => { e.stopPropagation(); handleSetDefault(b.id) }}
                      className={cn(
                        'flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity',
                        active ? 'text-white/40 hover:text-white' : 'text-gray-300 hover:text-brand-azure',
                      )}
                    >
                      <Circle size={14} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
          <button type="button" onClick={() => setAdding(true)}
            className="flex items-center gap-2 w-full px-3 py-2.5 mt-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand-azure hover:text-brand-azure transition-colors text-xs font-medium">
            <Plus size={13} /> Add Brand
          </button>
        </div>

        {/* Brand detail */}
        <div className="flex-1 overflow-y-auto p-6">
          {!selected ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <BookOpen size={26} className="text-gray-400" />
              </div>
              <p className="text-gray-500">Select a brand to view its settings</p>
            </div>
          ) : (
            <BrandDetailView
              brand={selected}
              uploading={uploading}
              onEdit={() => setEditing(true)}
              onUpload={handleUpload}
              onBrandUpdate={handleSaved}
            />
          )}
        </div>
      </div>
    </>
  )
}
