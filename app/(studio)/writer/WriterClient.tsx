'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import WriterControls from '@/components/writer/WriterControls'
import WriterResults from '@/components/writer/WriterResults'
import { EMPTY_INTENT, getGenerationMode } from '@/lib/content-intent'
import type { ContentIntent } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'
import {
  type ContentType, type Platform, type Tone, type SeriesCount, type ContentPillar,
  type CaptionResult, type CaptionResponse, type PlatformResult,
} from '@/components/writer/types'

export default function WriterClient() {
  const router = useRouter()
  const [contentType,      setContentType]      = useState<ContentType>('caption')
  const [brandId,          setBrandId]          = useState<BrandId>('lhcapital')
  const [intent,           setIntent]           = useState<ContentIntent>(EMPTY_INTENT)
  const [topic,            setTopic]            = useState('')
  const [platforms,        setPlatforms]        = useState<Platform[]>([])
  const [tone,             setTone]             = useState<Tone>('professional')
  const [seriesCount,      setSeriesCount]      = useState<SeriesCount>(3)
  const [includeHashtags,  setIncludeHashtags]  = useState(false)
  const [referenceContent, setReferenceContent] = useState('')
  const [referenceUrl,     setReferenceUrl]     = useState('')
  const [keywordsInput,    setKeywordsInput]    = useState('')
  const [fileName,         setFileName]         = useState('')
  const [copied,           setCopied]           = useState<string | number | null>(null)
  const [referenceImageUrl,       setReferenceImageUrl]       = useState('')
  const [referenceContentIsDraft, setReferenceContentIsDraft] = useState(false)
  const [contentPillar, setContentPillar] = useState<ContentPillar | ''>('')
  const [loading,       setLoading]       = useState(false)
  const [error,        setError]        = useState<string | null>(null)
  const [results,      setResults]      = useState<PlatformResult[]>([])
  const [regenerating, setRegenerating] = useState<string | null>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('writerDraft')
      if (!raw) return
      localStorage.removeItem('writerDraft')
      const draft = JSON.parse(raw) as { referenceImageUrl?: string; referenceContent?: string }
      if (draft.referenceImageUrl) setReferenceImageUrl(draft.referenceImageUrl)
      if (draft.referenceContent) {
        setReferenceContent(draft.referenceContent.slice(0, 4000))
        setReferenceContentIsDraft(true)
      }
    } catch { /* ignore */ }
  }, [])

  const prevMode = useRef(getGenerationMode(intent.tier2Id))
  useEffect(() => {
    const mode = getGenerationMode(intent.tier2Id)
    if (mode !== prevMode.current) { setTopic(''); prevMode.current = mode }
  }, [intent.tier2Id])

  function copy(text: string, key: string | number) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function sendToScheduler(text: string, platform: Platform) {
    localStorage.setItem('schedulerDraft', JSON.stringify({ caption: text, platform }))
    router.push('/scheduler')
  }

  function sendToVoiceover(text: string) {
    localStorage.setItem('audioDraft', JSON.stringify({ script: text }))
    router.push('/audio')
  }

  const makePayload = useCallback((platform: Platform) => ({
    platform, tone, brandId, includeHashtags,
    topic:              topic.trim() || undefined,
    seriesCount:        contentType === 'series' ? seriesCount : 1,
    keywords:           keywordsInput.trim() ? keywordsInput.split(',').map((k) => k.trim()).filter(Boolean) : undefined,
    referenceContent:   referenceContent.trim()  || undefined,
    referenceUrl:       referenceUrl.trim()      || undefined,
    referenceImageUrl:  referenceImageUrl.trim() || undefined,
    intentTier1Id:       intent.tier1Id       ?? undefined,
    intentTier2Id:       intent.tier2Id       ?? undefined,
    intentPurposeId:     intent.purposeId     ?? undefined,
    intentCtaId:         intent.ctaId         ?? undefined,
    intentCustomCta:     intent.customCta     ?? undefined,
    intentCtaPlacement:  intent.ctaPlacement  ?? undefined,
    intentCustomTopic:   intent.customTopic   ?? undefined,
    intentCustomPurpose: intent.customPurpose ?? undefined,
    contentPillar:       contentPillar || undefined,
  }), [topic, tone, brandId, includeHashtags, contentType, seriesCount, keywordsInput, referenceContent, referenceUrl, referenceImageUrl, intent, contentPillar])

  const handleGenerate = useCallback(async () => {
    if (platforms.length === 0) return
    setLoading(true); setError(null); setResults([])
    try {
      const responses = await Promise.all(
        platforms.map(async (p) => {
          const res = await fetch('/api/v1/generate/caption', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(makePayload(p)),
          })
          if (!res.ok) {
            const body = await res.json().catch(() => ({}))
            throw new Error(body.message ?? 'Generation failed.')
          }
          const data: CaptionResponse = await res.json()
          const results: CaptionResult[] = data.results ?? (data.result ? [data.result] : [])
          return { platform: p, results }
        })
      )
      setResults(responses)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Generation failed.')
    } finally {
      setLoading(false)
    }
  }, [platforms, makePayload])

  async function regenerateSingle(platform: Platform, captionIdx: number) {
    const key = `${platform}-${captionIdx}`
    setRegenerating(key)
    try {
      const res  = await fetch('/api/v1/generate/caption', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...makePayload(platform), seriesCount: 1 }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setError(err.message ?? 'Regeneration failed.')
        return
      }
      const data: CaptionResponse = await res.json()
      const newResult: CaptionResult | undefined = data.result ?? data.results?.[0]
      if (newResult) {
        setResults((prev) => prev.map((r) =>
          r.platform === platform
            ? { ...r, results: r.results.map((c, i) => i === captionIdx ? newResult : c) }
            : r
        ))
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setRegenerating(null)
    }
  }

  const canGenerate = platforms.length > 0 && (
    topic.trim().length > 0 || !!intent.tier1Id || !!intent.customTopic?.trim() ||
    referenceImageUrl.trim().length > 0 || referenceContent.trim().length > 0
  )

  return (
    <div className="flex bg-app-bg">
      <WriterControls
        contentType={contentType}           onContentType={setContentType}
        seriesCount={seriesCount}           onSeriesCount={setSeriesCount}
        brandId={brandId}                   onBrandId={setBrandId}
        intent={intent}                     onIntent={setIntent}
        topic={topic}                       onTopic={setTopic}
        tone={tone}                         onTone={setTone}
        platforms={platforms}               onTogglePlatform={(p) => setPlatforms((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p])}
        includeHashtags={includeHashtags}   onIncludeHashtags={setIncludeHashtags}
        referenceImageUrl={referenceImageUrl} onClearReferenceImage={() => setReferenceImageUrl('')}
        keywordsInput={keywordsInput}       onKeywordsInput={setKeywordsInput}
        referenceContent={referenceContent} onReferenceContent={setReferenceContent}
        referenceUrl={referenceUrl}         onReferenceUrl={setReferenceUrl}
        fileName={fileName}
        onFileLoad={(name, content) => { setFileName(name); setReferenceContent(content) }}
        onFileClear={() => { setFileName(''); setReferenceContent('') }}
        referenceContentIsDraft={referenceContentIsDraft}
        onClearReferenceDraft={() => { setReferenceContent(''); setReferenceContentIsDraft(false) }}
        contentPillar={contentPillar}       onContentPillar={setContentPillar}
        canGenerate={canGenerate}           loading={loading}
        error={error}                       onGenerate={handleGenerate}
      />

      <div className="flex-1 overflow-y-auto p-6">
        <WriterResults
          loading={loading}
          results={results}
          copied={copied}
          regenerating={regenerating}
          onCopy={copy}
          onRegen={regenerateSingle}
          onSchedule={sendToScheduler}
          onVoiceOver={sendToVoiceover}
        />
      </div>
    </div>
  )
}
