'use client'

import { AlertCircle, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import BrandSelector from '@/components/shared/BrandSelector'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'
import Toggle from '@/components/ui/Toggle'
import WriterReferenceSection from '@/components/writer/WriterReferenceSection'
import ContentIntentPanel from '@/app/(studio)/writer/ContentIntentPanel'
import StructuredDataEntry from '@/app/(studio)/writer/StructuredDataEntry'
import { getGenerationMode } from '@/lib/content-intent'
import type { ContentIntent } from '@/lib/content-intent'
import type { BrandId } from '@/lib/brands'
import {
  type ContentType, type Platform, type Tone, type SeriesCount, type ContentPillar,
  PLATFORMS, TONES,
} from '@/components/writer/types'
import ContentPillarSelector from '@/components/writer/ContentPillarSelector'

interface Props {
  contentType:             ContentType
  onContentType:           (v: ContentType) => void
  seriesCount:             SeriesCount
  onSeriesCount:           (v: SeriesCount) => void
  brandId:                 BrandId
  onBrandId:               (v: BrandId) => void
  intent:                  ContentIntent
  onIntent:                (v: ContentIntent) => void
  topic:                   string
  onTopic:                 (v: string) => void
  tone:                    Tone
  onTone:                  (v: Tone) => void
  platforms:               Platform[]
  onTogglePlatform:        (p: Platform) => void
  includeHashtags:         boolean
  onIncludeHashtags:       (v: boolean) => void
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
  contentPillar:           ContentPillar | ''
  onContentPillar:         (v: ContentPillar | '') => void
  canGenerate:             boolean
  loading:                 boolean
  error:                   string | null
  onGenerate:              () => void
}

export default function WriterControls({
  contentType, onContentType, seriesCount, onSeriesCount,
  brandId, onBrandId, intent, onIntent, topic, onTopic,
  tone, onTone, platforms, onTogglePlatform,
  includeHashtags, onIncludeHashtags,
  referenceImageUrl, onClearReferenceImage,
  keywordsInput, onKeywordsInput,
  referenceContent, onReferenceContent,
  referenceUrl, onReferenceUrl,
  fileName, onFileLoad, onFileClear,
  referenceContentIsDraft, onClearReferenceDraft,
  contentPillar, onContentPillar,
  canGenerate, loading, error, onGenerate,
}: Props) {
  return (
    <div className="w-[380px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-5 border-r border-gray-100 bg-white">
      <div className="space-y-5">

        {/* Content type */}
        <div className="bg-gray-50 rounded-card p-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Content Type</p>
          <div className="flex gap-2">
            {(['caption', 'series'] as ContentType[]).map((t) => (
              <button key={t} type="button" onClick={() => onContentType(t)}
                className={cn(
                  'flex-1 py-2 rounded-lg text-xs font-semibold border-2 capitalize transition-all',
                  contentType === t
                    ? 'border-brand-azure bg-brand-azure text-white'
                    : 'border-gray-200 text-gray-600 hover:border-brand-azure hover:text-brand-azure',
                )}>
                {t === 'series' ? 'Content Series' : 'Single Caption'}
              </button>
            ))}
          </div>
          {contentType === 'series' && (
            <div className="flex gap-2 mt-3">
              <p className="text-xs text-gray-500 self-center mr-1">Series of:</p>
              {([3, 5, 10] as SeriesCount[]).map((n) => (
                <button key={n} type="button" onClick={() => onSeriesCount(n)}
                  className={cn(
                    'w-10 h-8 rounded-lg text-sm font-semibold border-2 transition-colors',
                    seriesCount === n ? 'bg-brand-navy text-white border-brand-navy' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-navy',
                  )}>
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brand */}
        <div className="bg-gray-50 rounded-card p-4">
          <BrandSelector value={brandId} onChange={onBrandId} />
        </div>

        {/* Content Intent */}
        <ContentIntentPanel value={intent} onChange={onIntent} />

        {/* Post Details */}
        {getGenerationMode(intent.tier2Id) === 'structured' && intent.tier2Id ? (
          <StructuredDataEntry tier2Id={intent.tier2Id} onChange={onTopic} />
        ) : (
          <div className="bg-gray-50 rounded-card p-4">
            <Textarea label="Post Details" placeholder="Add any specific details, talking points, or context… (optional)"
              value={topic} onChange={(e) => onTopic(e.target.value)} rows={3} maxLength={500} currentLength={topic.length} />
          </div>
        )}

        {/* Tone */}
        <div className="bg-gray-50 rounded-card p-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Tone</p>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <button key={t.value} type="button" onClick={() => onTone(t.value)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
                  tone === t.value ? 'bg-brand-azure text-white border-brand-azure' : 'bg-white text-gray-600 border-gray-200 hover:border-brand-azure hover:text-brand-azure',
                )}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Pillar */}
        <ContentPillarSelector value={contentPillar} onChange={onContentPillar} />

        <WriterReferenceSection
          referenceImageUrl={referenceImageUrl}       onClearReferenceImage={onClearReferenceImage}
          keywordsInput={keywordsInput}               onKeywordsInput={onKeywordsInput}
          referenceContent={referenceContent}         onReferenceContent={onReferenceContent}
          referenceUrl={referenceUrl}                 onReferenceUrl={onReferenceUrl}
          fileName={fileName}                         onFileLoad={onFileLoad}
          onFileClear={onFileClear}
          referenceContentIsDraft={referenceContentIsDraft}
          onClearReferenceDraft={onClearReferenceDraft}
        />

        {/* Platform */}
        <div className="bg-gray-50 rounded-card p-4">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-1">Platform</p>
          <p className="text-[10px] text-gray-400 mb-3">Select one or more</p>
          <div className="grid grid-cols-2 gap-1.5">
            {PLATFORMS.map((p) => (
              <button key={p.value} type="button" onClick={() => onTogglePlatform(p.value)}
                className={cn(
                  'py-2 px-3 rounded-lg text-xs font-medium border-2 text-left transition-all',
                  platforms.includes(p.value)
                    ? 'border-brand-azure bg-brand-azure/5 text-brand-azure'
                    : 'border-gray-200 text-gray-600 hover:border-brand-light',
                )}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hashtags toggle */}
        <div className="bg-gray-50 rounded-card p-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-gray-700">Include hashtags</span>
            <Toggle checked={includeHashtags} onChange={onIncludeHashtags} />
          </div>
        </div>

        <Button className="w-full" size="lg" disabled={!canGenerate || loading} loading={loading} onClick={onGenerate}>
          <Sparkles size={14} />
          Generate {contentType === 'series' ? `${seriesCount}-Part Series` : 'Caption'}
        </Button>

        {!canGenerate && !loading && platforms.length === 0 && (
          <p className="text-[11px] text-center text-gray-400">Select at least one platform to generate</p>
        )}

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
