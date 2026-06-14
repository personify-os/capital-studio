'use client'

import { useRef, useState } from 'react'
import { Link, FileText, X, Loader2 } from 'lucide-react'
import Textarea from '@/components/ui/Textarea'
import { DOC_ACCEPT } from '@/lib/extract-text'

interface ReferencePanelProps {
  referenceUrl:     string
  referenceContent: string
  fileName:         string
  onUrlChange:      (v: string) => void
  onContentChange:  (v: string) => void
  onFileLoad:       (name: string, content: string) => void
  onFileClear:      () => void
}

export default function ReferencePanel({
  referenceUrl, referenceContent, fileName,
  onUrlChange, onContentChange, onFileLoad, onFileClear,
}: ReferencePanelProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setLoading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res  = await fetch('/api/v1/upload/extract', { method: 'POST', body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.message || 'Could not read this file.')
      onFileLoad(data.name as string, data.text as string)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not read this file.')
      if (fileRef.current) fileRef.current.value = ''
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    onFileClear()
    setError('')
    if (fileRef.current) fileRef.current.value = ''
  }

  const inputCls = 'w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-azure/30 focus:border-brand-azure placeholder-gray-300 transition'

  return (
    <div className="bg-gray-50 rounded-card p-4 space-y-3">
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">
        Content Reference <span className="normal-case font-normal text-gray-400">(optional)</span>
      </p>

      {/* URL */}
      <div>
        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">
          <Link size={9} className="inline mr-1" />URL
        </label>
        <input type="url" value={referenceUrl} onChange={(e) => onUrlChange(e.target.value)}
          placeholder="https://example.com/article" className={inputCls} />
      </div>

      {/* File upload */}
      <div>
        <label className="block text-[10px] font-medium text-gray-500 uppercase tracking-wide mb-1.5">
          <FileText size={9} className="inline mr-1" />Upload File
        </label>
        {fileName ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-brand-azure/5 border border-brand-azure/20 rounded-lg">
            <FileText size={12} className="text-brand-azure flex-shrink-0" />
            <span className="text-xs text-brand-azure flex-1 truncate">{fileName}</span>
            <button type="button" onClick={handleClear} className="text-gray-400 hover:text-gray-600">
              <X size={12} />
            </button>
          </div>
        ) : (
          <button type="button" onClick={() => fileRef.current?.click()} disabled={loading}
            className="w-full px-3 py-2 text-xs border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-azure hover:text-brand-azure transition-colors text-left disabled:opacity-60 disabled:cursor-wait flex items-center gap-2">
            {loading
              ? (<><Loader2 size={12} className="animate-spin" />Reading file…</>)
              : 'Upload a file (TXT, MD, CSV, PDF, Word)…'}
          </button>
        )}
        {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
        <input ref={fileRef} type="file" accept={DOC_ACCEPT} className="hidden" onChange={handleFileChange} />
      </div>

      {/* Paste content */}
      {!fileName && (
        <Textarea
          label="Or paste content"
          placeholder="Paste any reference text, notes, or talking points here…"
          value={referenceContent}
          onChange={(e) => onContentChange(e.target.value)}
          rows={3}
          maxLength={4000}
          currentLength={referenceContent.length}
        />
      )}
    </div>
  )
}
