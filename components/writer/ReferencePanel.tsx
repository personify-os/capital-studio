'use client'

import { useRef } from 'react'
import { Link, FileText, X } from 'lucide-react'
import Textarea from '@/components/ui/Textarea'

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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      onFileLoad(file.name, text?.slice(0, 4000) ?? '')
    }
    reader.readAsText(file)
  }

  function handleClear() {
    onFileClear()
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
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full px-3 py-2 text-xs border border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-brand-azure hover:text-brand-azure transition-colors text-left">
            Click to upload a text file…
          </button>
        )}
        <input ref={fileRef} type="file" accept=".txt,.md,.csv,.doc,.docx" className="hidden" onChange={handleFileChange} />
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
