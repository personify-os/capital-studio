'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { FolderOpen, Search, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Asset, getAssetBrand } from '@/components/library/shared'
import AssetCard from '@/components/library/AssetCard'
import CaptionRow from '@/components/library/CaptionRow'
import AudioRow from '@/components/library/AudioRow'

type FilterValue = 'ALL' | 'IMAGE' | 'GRAPHIC' | 'VIDEO' | 'MOTION' | 'LIKENESS' | 'VOICEOVER' | 'CAPTION' | 'MUSIC'
type BrandFilter = 'ALL' | 'lhcapital' | 'simrp' | 'espa' | 'personal'

const TYPE_FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'ALL',       label: 'All' },
  { value: 'IMAGE',     label: 'Images' },
  { value: 'GRAPHIC',   label: 'Graphics' },
  { value: 'VIDEO',     label: 'Videos' },
  { value: 'MOTION',    label: 'Motion' },
  { value: 'LIKENESS',  label: 'Likeness' },
  { value: 'VOICEOVER', label: 'Audio' },
  { value: 'MUSIC',     label: 'Music' },
  { value: 'CAPTION',   label: 'Captions' },
]

const BRAND_FILTERS: { value: BrandFilter; label: string; dot: string }[] = [
  { value: 'ALL',       label: 'All brands', dot: '' },
  { value: 'lhcapital', label: 'LH Capital', dot: 'bg-brand-azure' },
  { value: 'simrp',     label: 'The SIMRP',  dot: 'bg-brand-light' },
  { value: 'espa',      label: 'ESPA',       dot: 'bg-brand-emerald' },
  { value: 'personal',  label: 'Personal',   dot: 'bg-brand-green' },
]

const MEDIA_LABELS: Record<string, string> = {
  IMAGE: 'Images', GRAPHIC: 'Graphics', VIDEO: 'Videos',
  MOTION: 'Motion', LIKENESS: 'Likeness Videos', VOICEOVER: 'Audio', MUSIC: 'Music', CAPTION: 'Captions',
}

interface Props {
  assets:        Asset[]
  total:         number
  pageSize:      number
  initialFilter?: string
  initialBrand?:  string
}

const FILTER_VALUES: FilterValue[] = ['ALL', 'IMAGE', 'GRAPHIC', 'VIDEO', 'MOTION', 'LIKENESS', 'VOICEOVER', 'CAPTION', 'MUSIC']
const BRAND_VALUES:  BrandFilter[] = ['ALL', 'lhcapital', 'simrp', 'espa', 'personal']

export default function LibraryClient({ assets: initialAssets, total, pageSize, initialFilter, initialBrand }: Props) {
  const [allAssets,     setAllAssets]     = useState<Asset[]>(initialAssets)
  const [filter,        setFilter]        = useState<FilterValue>(
    (initialFilter && FILTER_VALUES.includes(initialFilter as FilterValue)) ? (initialFilter as FilterValue) : 'ALL',
  )
  const [brandFilter,   setBrandFilter]   = useState<BrandFilter>(
    (initialBrand && BRAND_VALUES.includes(initialBrand as BrandFilter)) ? (initialBrand as BrandFilter) : 'ALL',
  )
  const [search,        setSearch]        = useState('')
  const [searchResults, setSearchResults] = useState<Asset[] | null>(null)
  const [searching,     setSearching]     = useState(false)
  const [searchError,   setSearchError]   = useState(false)
  const [copied,        setCopied]        = useState<string | null>(null)
  const [loadingMore,   setLoadingMore]   = useState(false)
  const [loadMoreError, setLoadMoreError] = useState(false)
  const [page,          setPage]          = useState(1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hasMore = allAssets.length < total

  // Server-side search — debounced 350 ms
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const q = search.trim()
    if (!q) { setSearchResults(null); return }
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      setSearchError(false)
      try {
        const typeParam = filter !== 'ALL' ? `&type=${filter}` : ''
        const res  = await fetch(`/api/v1/assets?search=${encodeURIComponent(q)}${typeParam}`)
        const json = await res.json().catch(() => ({}))
        if (res.ok && json.assets) { setSearchResults(json.assets as Asset[]) }
        else { setSearchError(true) }
      } catch {
        setSearchError(true)
      } finally {
        setSearching(false)
      }
    }, 350)
  }, [search, filter])

  // Persist the active type/brand filters in the URL so a refresh restores them
  // (the server reads ?type / ?brand on reload). replaceState avoids navigation.
  useEffect(() => {
    const params = new URLSearchParams()
    if (filter !== 'ALL')      params.set('type', filter)
    if (brandFilter !== 'ALL') params.set('brand', brandFilter)
    const qs = params.toString()
    window.history.replaceState(null, '', qs ? `/library?${qs}` : '/library')
  }, [filter, brandFilter])

  async function loadMore() {
    setLoadingMore(true)
    setLoadMoreError(false)
    try {
      const nextPage = page + 1
      const res  = await fetch(`/api/v1/assets?page=${nextPage}&limit=${pageSize}`)
      const json = await res.json().catch(() => ({}))
      if (res.ok && json.assets) {
        setAllAssets((prev) => [...prev, ...json.assets])
        setPage(nextPage)
      } else {
        setLoadMoreError(true)
      }
    } catch {
      setLoadMoreError(true)
    } finally {
      setLoadingMore(false)
    }
  }

  // Reflect an in-place caption edit in both the loaded pool and any active search results
  function handleAssetUpdate(updated: Asset) {
    setAllAssets((prev) => prev.map((a) => (a.id === updated.id ? updated : a)))
    setSearchResults((prev) => (prev ? prev.map((a) => (a.id === updated.id ? updated : a)) : prev))
  }

  // Active pool: server search results when searching, otherwise locally-loaded page
  const activePool = searchResults ?? allAssets

  const filtered = useMemo(() => {
    let items = filter === 'ALL' ? activePool : activePool.filter((a) => a.type === filter)
    if (brandFilter !== 'ALL') items = items.filter((a) => getAssetBrand(a) === brandFilter)
    return items
  }, [activePool, filter, brandFilter])

  function copyUrl(id: string, url: string) {
    navigator.clipboard.writeText(url).then(() => { setCopied(id); setTimeout(() => setCopied(null), 2000) })
  }
  function copyText(id: string, text: string) {
    navigator.clipboard.writeText(text).then(() => { setCopied(id); setTimeout(() => setCopied(null), 2000) })
  }

  const isCaptionFilter = filter === 'CAPTION'
  const isAudioFilter   = filter === 'VOICEOVER' || filter === 'MUSIC'
  const isVideoFilter   = filter === 'MOTION' || filter === 'LIKENESS'
  const mixedMedia      = filter === 'ALL'

  return (
    <div className="p-6">
      {/* Type filter bar */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {TYPE_FILTERS.map((f) => (
          <button key={f.value} type="button" onClick={() => setFilter(f.value)}
            className={cn('px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors',
              filter === f.value ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure'
            )}>
            {f.label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            {searching && <Loader2 size={10} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-brand-azure animate-spin" />}
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setSearchError(false) }}
              placeholder="Search all assets…"
              className={cn(
                'pl-7 pr-3 py-1 text-xs border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent w-40',
                searchError ? 'border-red-300' : 'border-gray-200',
              )}
            />
          </div>
          {searchError && <span className="text-[10px] text-red-500">Search failed</span>}
          <span className="text-xs text-gray-400 whitespace-nowrap">{filtered.length} {filtered.length === 1 ? 'asset' : 'assets'}</span>
        </div>
      </div>

      {/* Brand filter bar */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {BRAND_FILTERS.map((b) => (
          <button key={b.value} type="button" onClick={() => setBrandFilter(b.value)}
            className={cn('flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium border transition-colors',
              brandFilter === b.value ? 'bg-brand-navy/5 border-brand-navy/30 text-brand-navy' : 'bg-white text-gray-500 border-gray-100 hover:border-gray-300'
            )}>
            {b.dot && <span className={cn('w-2 h-2 rounded-full flex-shrink-0', b.dot)} />}
            {b.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <FolderOpen size={26} className="text-gray-400" />
          </div>
          <p className="font-semibold text-brand-navy mb-1">{search.trim() ? 'No results found' : 'No assets yet'}</p>
          <p className="text-sm text-gray-400">{search.trim() ? 'Try a different search term' : 'Generated content will appear here'}</p>
        </div>
      ) : isCaptionFilter ? (
        <div className="space-y-3 max-w-2xl">
          {filtered.map((a) => <CaptionRow key={a.id} asset={a} copied={copied} onCopy={copyText} onUpdate={handleAssetUpdate} />)}
        </div>
      ) : isAudioFilter ? (
        <div className="space-y-3 max-w-2xl">
          {filtered.map((a) => <AudioRow key={a.id} asset={a} copied={copied} onCopy={copyUrl} />)}
        </div>
      ) : isVideoFilter ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {filtered.map((a) => <AssetCard key={a.id} asset={a} copied={copied} onCopy={copyUrl} />)}
        </div>
      ) : mixedMedia ? (
        <div className="space-y-8">
          {(['IMAGE', 'GRAPHIC', 'VIDEO', 'MOTION', 'LIKENESS', 'VOICEOVER', 'MUSIC', 'CAPTION'] as const).map((type) => {
            const group = filtered.filter((a) => a.type === type)
            if (group.length === 0) return null
            return (
              <div key={type}>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-3">{MEDIA_LABELS[type]}</p>
                {type === 'VOICEOVER' || type === 'MUSIC' ? (
                  <div className="space-y-3 max-w-2xl">
                    {group.map((a) => <AudioRow key={a.id} asset={a} copied={copied} onCopy={copyUrl} />)}
                  </div>
                ) : type === 'CAPTION' ? (
                  <div className="space-y-3 max-w-2xl">
                    {group.map((a) => <CaptionRow key={a.id} asset={a} copied={copied} onCopy={copyText} onUpdate={handleAssetUpdate} />)}
                  </div>
                ) : type === 'MOTION' || type === 'LIKENESS' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {group.map((a) => <AssetCard key={a.id} asset={a} copied={copied} onCopy={copyUrl} />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {group.map((a) => <AssetCard key={a.id} asset={a} copied={copied} onCopy={copyUrl} />)}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filtered.map((a) => <AssetCard key={a.id} asset={a} copied={copied} onCopy={copyUrl} />)}
        </div>
      )}

      {hasMore && !search.trim() && filter === 'ALL' && brandFilter === 'ALL' && (
        <div className="flex flex-col items-center gap-2 mt-8">
          <button
            type="button"
            onClick={loadMore}
            disabled={loadingMore}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:border-brand-azure hover:text-brand-azure transition-colors disabled:opacity-60"
          >
            {loadingMore ? <Loader2 size={14} className="animate-spin" /> : null}
            {loadingMore ? 'Loading…' : `Load more (${total - allAssets.length} remaining)`}
          </button>
          {loadMoreError && <p className="text-xs text-red-500">Failed to load — please try again</p>}
        </div>
      )}
    </div>
  )
}
