'use client'

import { useRouter } from 'next/navigation'
import { FileText, Copy, Check, Calendar, Hash } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { type Asset, BRAND_DOT, getAssetBrand } from './shared'

interface CaptionResult { body: string; hashtags?: string[]; altText?: string }
interface CaptionMeta {
  platform?:         string
  contentPillar?:    string
  referenceImageUrl?: string
  referenceContent?: string
  referenceUrl?:     string
  keywords?:         string[]
  [key: string]:     unknown
}

interface Props {
  asset:  Asset
  copied: string | null
  onCopy: (id: string, text: string) => void
}

/** Normalise both old format (text/texts strings) and new format (result/results objects) */
function extractResults(meta: Record<string, any>): CaptionResult[] {
  // New format: structured CaptionResult objects
  if (meta.results && Array.isArray(meta.results)) {
    return meta.results.map((r: any) => ({
      body:     typeof r.body === 'string' ? r.body : String(r.body ?? ''),
      hashtags: Array.isArray(r.hashtags) ? r.hashtags : [],
      altText:  typeof r.altText === 'string' ? r.altText : undefined,
    }))
  }
  if (meta.result && typeof meta.result === 'object') {
    return [{
      body:     typeof meta.result.body === 'string' ? meta.result.body : String(meta.result.body ?? ''),
      hashtags: Array.isArray(meta.result.hashtags) ? meta.result.hashtags : [],
      altText:  typeof meta.result.altText === 'string' ? meta.result.altText : undefined,
    }]
  }
  // Legacy format: plain strings
  const texts: string[] = meta.texts ?? (meta.text ? [meta.text] : [])
  return texts.map((t) => ({ body: t, hashtags: [], altText: undefined }))
}

function resultToFullText(r: CaptionResult): string {
  return r.hashtags && r.hashtags.length > 0 ? `${r.body}\n\n${r.hashtags.join(' ')}` : r.body
}

export default function CaptionRow({ asset, copied, onCopy }: Props) {
  const router   = useRouter()
  const meta          = (asset.metadata ?? {}) as CaptionMeta
  const platform      = meta.platform as string | undefined
  const contentPillar = meta.contentPillar as string | undefined
  const results       = extractResults(meta)
  const isSeries = results.length > 1
  const brandId  = getAssetBrand(asset)

  function scheduleCaption(text: string) {
    localStorage.setItem('schedulerDraft', JSON.stringify({ caption: text, platform }))
    router.push('/scheduler')
  }

  const allText = results.map(resultToFullText).join('\n\n---\n\n')

  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="relative w-7 h-7 rounded-full bg-brand-navy/10 flex items-center justify-center flex-shrink-0">
            <FileText size={13} className="text-brand-navy" />
            {brandId && BRAND_DOT[brandId] && (
              <span className={cn('absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ring-1 ring-white', BRAND_DOT[brandId])} />
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-brand-navy capitalize flex items-center gap-1.5 flex-wrap">
              {isSeries ? `${results.length}-Part Series` : 'Caption'}
              {platform && <span className="text-gray-400 font-normal">· {platform}</span>}
              {contentPillar && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-brand-navy/8 text-brand-navy/60 font-semibold capitalize">
                  {contentPillar.replace('-', ' ')}
                </span>
              )}
            </p>
            <p className="text-[10px] text-gray-400">{formatRelativeTime(asset.createdAt)}</p>
          </div>
        </div>
        {results.length > 0 && (
          <button
            type="button"
            onClick={() => onCopy(asset.id, allText)}
            className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-brand-azure bg-gray-50 border border-gray-200 px-2 py-1 rounded transition-colors flex-shrink-0"
          >
            {copied === asset.id ? <><Check size={10} />Copied</> : <><Copy size={10} />{isSeries ? 'Copy all' : 'Copy'}</>}
          </button>
        )}
      </div>

      {/* Reference context badges (legacy + new) */}
      {(meta.referenceImageUrl || meta.referenceContent || meta.referenceUrl || meta.keywords?.length) && (
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
      )}

      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="group/item relative bg-gray-50 rounded-lg px-3 py-2">
            {isSeries && (
              <span className="text-[9px] font-semibold text-brand-azure uppercase tracking-widest block mb-1">Post {i + 1}</span>
            )}
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{r.body}</p>
            {r.hashtags && r.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                <Hash size={9} className="text-gray-300 mt-0.5 flex-shrink-0" />
                {r.hashtags.map((tag) => (
                  <span key={tag} className="text-[9px] text-brand-azure/70 font-medium">{tag}</span>
                ))}
              </div>
            )}
            {r.altText && (
              <p className="text-[9px] text-gray-400 italic mt-1 leading-snug">Alt: {r.altText}</p>
            )}
            <button
              type="button"
              onClick={() => scheduleCaption(resultToFullText(r))}
              className="absolute bottom-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1 bg-brand-navy text-white text-[9px] font-semibold px-2 py-1 rounded-full"
            >
              <Calendar size={9} /> Schedule
            </button>
          </div>
        ))}
        {results.length === 0 && <p className="text-xs text-gray-400 italic">Caption text not available</p>}
      </div>
    </div>
  )
}
