'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Copy, Check, Calendar, Hash, Pencil, Save, X } from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import { type Asset, BRAND_DOT, getAssetBrand, PostStatusList } from './shared'
import CaptionReferenceBadges from './CaptionReferenceBadges'

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
  asset:    Asset
  copied:   string | null
  onCopy:   (id: string, text: string) => void
  onUpdate?: (updated: Asset) => void
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

export default function CaptionRow({ asset, copied, onCopy, onUpdate }: Props) {
  const router   = useRouter()
  const meta          = (asset.metadata ?? {}) as CaptionMeta
  const platform      = meta.platform as string | undefined
  const contentPillar = meta.contentPillar as string | undefined
  const results       = extractResults(meta)
  const isSeries = results.length > 1
  const brandId  = getAssetBrand(asset)

  const [editing, setEditing] = useState(false)
  const [drafts,  setDrafts]  = useState<string[]>([])
  const [saving,  setSaving]  = useState(false)

  function startEdit() { setDrafts(results.map((r) => r.body)); setEditing(true) }

  async function saveEdit() {
    const newResults = results.map((r, i) => ({ ...r, body: drafts[i] ?? r.body }))
    setSaving(true)
    try {
      const res = await fetch(`/api/v1/assets/${asset.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ results: newResults }),
      })
      if (!res.ok) return
      onUpdate?.({ ...asset, metadata: { ...meta, results: newResults, seriesCount: newResults.length } })
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  function scheduleCaption(text: string) {
    const draft: Record<string, string> = { caption: text, assetId: asset.id }
    if (platform)              draft.platform = platform
    if (meta.referenceImageUrl) draft.imageUrl = meta.referenceImageUrl  // bundle the caption's source image
    localStorage.setItem('schedulerDraft', JSON.stringify(draft))
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
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {editing ? (
            <>
              <button type="button" onClick={saveEdit} disabled={saving}
                className="flex items-center gap-1 text-[10px] font-medium text-white bg-brand-azure hover:bg-brand-navy px-2 py-1 rounded transition-colors disabled:opacity-50">
                <Save size={10} />{saving ? 'Saving…' : 'Save'}
              </button>
              <button type="button" onClick={() => setEditing(false)} disabled={saving}
                className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-gray-600 bg-gray-50 border border-gray-200 px-2 py-1 rounded transition-colors">
                <X size={10} />Cancel
              </button>
            </>
          ) : (
            <>
              {onUpdate && results.length > 0 && (
                <button type="button" onClick={startEdit} title="Edit caption"
                  className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-brand-azure bg-gray-50 border border-gray-200 px-2 py-1 rounded transition-colors">
                  <Pencil size={10} />Edit
                </button>
              )}
              {results.length > 0 && (
                <button type="button" onClick={() => onCopy(asset.id, allText)}
                  className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-brand-azure bg-gray-50 border border-gray-200 px-2 py-1 rounded transition-colors">
                  {copied === asset.id ? <><Check size={10} />Copied</> : <><Copy size={10} />{isSeries ? 'Copy all' : 'Copy'}</>}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {asset.scheduledPosts && asset.scheduledPosts.length > 0 && (
        <PostStatusList posts={asset.scheduledPosts} className="mb-3" />
      )}

      <CaptionReferenceBadges meta={meta} />

      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="group/item relative bg-gray-50 rounded-lg px-3 py-2">
            {isSeries && (
              <span className="text-[9px] font-semibold text-brand-azure uppercase tracking-widest block mb-1">Post {i + 1}</span>
            )}
            {editing ? (
              <textarea
                value={drafts[i] ?? r.body}
                onChange={(e) => setDrafts((prev) => { const next = [...prev]; next[i] = e.target.value; return next })}
                rows={Math.min(10, Math.max(3, (drafts[i] ?? r.body).split('\n').length + 1))}
                className="w-full text-xs text-gray-700 leading-relaxed bg-white border border-brand-azure/30 rounded p-2 focus:outline-none focus:ring-2 focus:ring-brand-azure/30 resize-y"
              />
            ) : (
              <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{r.body}</p>
            )}
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
            {!editing && (
              <button
                type="button"
                onClick={() => scheduleCaption(resultToFullText(r))}
                className="absolute bottom-2 right-2 opacity-0 group-hover/item:opacity-100 transition-opacity flex items-center gap-1 bg-brand-navy text-white text-[9px] font-semibold px-2 py-1 rounded-full"
              >
                <Calendar size={9} /> Schedule
              </button>
            )}
          </div>
        ))}
        {results.length === 0 && <p className="text-xs text-gray-400 italic">Caption text not available</p>}
      </div>
    </div>
  )
}
