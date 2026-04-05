'use client'

import { useState } from 'react'
import { BookOpen, Plus, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BrandProfile, TYPE_LABELS } from '@/components/brand-vault/types'
import { EditModal, AddBrandModal } from '@/components/brand-vault/BrandModals'
import BrandDetailView from '@/components/brand-vault/BrandDetailView'

interface Props { brands: BrandProfile[] }

export default function BrandVaultClient({ brands: initial }: Props) {
  const [brands,    setBrands]    = useState(initial)
  const [selected,  setSelected]  = useState<BrandProfile | null>(brands[0] ?? null)
  const [editing,   setEditing]   = useState(false)
  const [adding,    setAdding]    = useState(false)
  const [uploading,    setUploading]    = useState<'logo' | 'document' | null>(null)
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  function handleSaved(updated: BrandProfile) {
    setBrands((prev) => prev.map((b) => b.id === updated.id ? { ...b, ...updated } : b))
    setSelected((prev) => prev?.id === updated.id ? { ...prev, ...updated } : prev)
  }

  async function handleUpload(file: File, type: 'logo' | 'document') {
    if (!selected) return
    setUploading(type); setUploadStatus(null)
    try {
      const form = new FormData()
      form.append('file', file)
      form.append('type', type)
      const res  = await fetch(`/api/v1/brands/${selected.id}/upload`, { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok) { setUploadStatus({ type: 'error', message: json.message ?? 'Upload failed' }); return }
      if (json.url) {
        handleSaved({ ...selected,
          ...(type === 'logo' ? { logoUrl: json.url } : {}),
          config: type === 'document'
            ? { ...selected.config, documentUrl: json.url, documentName: json.name }
            : selected.config,
        } as BrandProfile)
        setUploadStatus({ type: 'success', message: type === 'logo' ? 'Logo uploaded' : 'Document uploaded' })
        setTimeout(() => setUploadStatus(null), 3000)
      }
    } catch {
      setUploadStatus({ type: 'error', message: 'Upload failed — please try again' })
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
            {brands.map((b) => (
              <button key={b.id} type="button" onClick={() => setSelected(b)}
                className={cn(
                  'w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition-colors',
                  selected?.id === b.id ? 'bg-brand-navy text-white' : 'hover:bg-gray-50 text-gray-700',
                )}>
                <span className={cn('w-2 h-2 rounded-full flex-shrink-0', {
                  'bg-brand-azure':  b.type === 'LHC',
                  'bg-brand-light':  b.type === 'SIMRP',
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
            />
          )}
        </div>
      </div>
    </>
  )
}
