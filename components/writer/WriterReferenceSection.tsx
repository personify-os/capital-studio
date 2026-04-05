'use client'

import { X, ImageIcon, AlignLeft } from 'lucide-react'
import ReferencePanel from '@/components/writer/ReferencePanel'

interface Props {
  referenceImageUrl:       string
  onClearReferenceImage:   () => void
  keywordsInput:           string
  onKeywordsInput:         (v: string) => void
  referenceContent:        string
  onReferenceContent:      (v: string) => void
  referenceUrl:            string
  onReferenceUrl:          (v: string) => void
  fileName:                string
  onFileLoad:              (name: string, content: string) => void
  onFileClear:             () => void
  referenceContentIsDraft: boolean
  onClearReferenceDraft:   () => void
}

export default function WriterReferenceSection({
  referenceImageUrl, onClearReferenceImage,
  keywordsInput, onKeywordsInput,
  referenceContent, onReferenceContent,
  referenceUrl, onReferenceUrl,
  fileName, onFileLoad, onFileClear,
  referenceContentIsDraft, onClearReferenceDraft,
}: Props) {
  return (
    <>
      {/* Reference image banner */}
      {referenceImageUrl && (
        <div className="bg-brand-azure/5 border border-brand-azure/20 rounded-card p-3 flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={referenceImageUrl} alt="Reference" className="w-14 h-14 object-cover rounded-lg flex-shrink-0 border border-gray-200" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-brand-azure uppercase tracking-widest flex items-center gap-1">
              <ImageIcon size={9} />Reference Image
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5 truncate">{referenceImageUrl}</p>
            <p className="text-[10px] text-gray-400 mt-1">Claude will analyze this image when writing your caption.</p>
          </div>
          <button type="button" onClick={onClearReferenceImage} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Keywords */}
      <div className="bg-gray-50 rounded-card p-4">
        <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">
          Keywords <span className="normal-case font-normal text-gray-400">(optional)</span>
        </label>
        <input type="text" value={keywordsInput} onChange={(e) => onKeywordsInput(e.target.value)}
          placeholder="SIMRP, tax savings, life insurance… (comma-separated)"
          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-azure/30 focus:border-brand-azure placeholder-gray-300 transition" />
        <p className="text-[10px] text-gray-400 mt-1.5">Claude will weave these in naturally.</p>
      </div>

      {/* Reference content draft banner */}
      {referenceContentIsDraft && referenceContent && (
        <div className="bg-brand-teal/5 border border-brand-teal/20 rounded-card p-3 flex items-start gap-3">
          <AlignLeft size={14} className="text-brand-teal flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-brand-teal uppercase tracking-widest">Reference Content Loaded</p>
            <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{referenceContent}</p>
            <p className="text-[10px] text-gray-400 mt-1">Claude will use this as context when writing your caption.</p>
          </div>
          <button type="button" onClick={onClearReferenceDraft} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            <X size={12} />
          </button>
        </div>
      )}

      {/* Content Reference */}
      <ReferencePanel
        referenceUrl={referenceUrl}
        referenceContent={referenceContent}
        fileName={fileName}
        onUrlChange={onReferenceUrl}
        onContentChange={onReferenceContent}
        onFileLoad={onFileLoad}
        onFileClear={onFileClear}
      />
    </>
  )
}
