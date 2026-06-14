interface RefMeta {
  referenceImageUrl?: string
  referenceContent?:  string
  referenceUrl?:      string
  keywords?:          string[]
}

/** The "generated from …" reference context badges shown on a caption row. */
export default function CaptionReferenceBadges({ meta }: { meta: RefMeta }) {
  if (!(meta.referenceImageUrl || meta.referenceContent || meta.referenceUrl || meta.keywords?.length)) return null
  return (
    <div className="space-y-1.5 mb-3">
      {meta.referenceImageUrl && (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={meta.referenceImageUrl} alt="Source" className="w-10 h-10 object-cover rounded flex-shrink-0 border border-gray-200" />
          <p className="text-[10px] text-gray-400">Generated from image via Claude Vision</p>
        </div>
      )}
      {meta.referenceContent && (
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Reference context</p>
          <p className="text-[10px] text-gray-500 line-clamp-2 leading-relaxed">{meta.referenceContent}</p>
        </div>
      )}
      {meta.referenceUrl && (
        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 flex items-center gap-1.5">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide flex-shrink-0">URL</p>
          <p className="text-[10px] text-brand-azure truncate">{meta.referenceUrl}</p>
        </div>
      )}
      {meta.keywords && meta.keywords.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap p-2 bg-gray-50 rounded-lg border border-gray-100">
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mr-0.5">Keywords</p>
          {meta.keywords.map((kw: string) => (
            <span key={kw} className="text-[9px] bg-brand-navy/5 text-brand-navy/60 px-1.5 py-0.5 rounded font-medium">{kw}</span>
          ))}
        </div>
      )}
    </div>
  )
}
