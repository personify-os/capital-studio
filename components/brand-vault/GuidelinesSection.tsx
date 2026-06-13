'use client'

import { useRef } from 'react'
import { Upload, FileText } from 'lucide-react'
import { DOC_ACCEPT } from '@/lib/extract-text'
import { Section } from '@/components/brand-vault/BrandDetail'
import type { BrandConfig } from '@/components/brand-vault/types'

interface Props {
  config:    BrandConfig | null
  uploading: 'logo' | 'document' | string | null
  onUpload:  (file: File, type: 'logo' | 'document') => void
}

export default function GuidelinesSection({ config, uploading, onUpload }: Props) {
  const docRef = useRef<HTMLInputElement>(null)
  const isUploading = uploading === 'document'

  return (
    <Section title="Custom Guidelines">
      {config?.guidelines || config?.documentName ? (
        <div>
          {config.documentName && (
            <div className="flex items-center gap-2 mb-3">
              <FileText size={14} className="text-brand-azure flex-shrink-0" />
              <p className="text-xs text-brand-navy font-medium">{config.documentName}</p>
            </div>
          )}
          {config.guidelines && (
            <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-4">{config.guidelines.slice(0, 300)}{config.guidelines.length > 300 ? '…' : ''}</p>
          )}
          <button type="button" onClick={() => docRef.current?.click()} disabled={isUploading}
            className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline disabled:opacity-50">
            <Upload size={11} />{isUploading ? 'Uploading…' : 'Replace document'}
          </button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-400 mb-1">Upload a TXT, MD, CSV, PDF, or Word (.docx) knowledge base file.</p>
          <p className="text-xs text-gray-400 mb-3">Text content is automatically extracted and prepended to the AI knowledge base.</p>
          <button type="button" onClick={() => docRef.current?.click()} disabled={isUploading}
            className="px-4 py-2 bg-brand-azure text-white text-xs font-semibold rounded-lg hover:bg-brand-navy transition-colors disabled:opacity-50">
            {isUploading ? 'Uploading…' : 'Upload Document'}
          </button>
        </div>
      )}
      <input ref={docRef} type="file" accept={DOC_ACCEPT} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f, 'document') }} />
    </Section>
  )
}
