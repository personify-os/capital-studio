'use client'

import { Copy, Check, PenSquare } from 'lucide-react'
import CaptionCard from '@/components/writer/CaptionCard'
import { type Platform, type CaptionResult, type PlatformResult, PLATFORM_LABEL } from '@/components/writer/types'

interface Props {
  loading:       boolean
  results:       PlatformResult[]
  copied:        string | number | null
  regenerating:  string | null
  onCopy:        (text: string, key: string | number) => void
  onRegen:       (platform: Platform, idx: number) => void
  onSchedule:    (text: string, platform: Platform) => void
  onVoiceOver?:  (text: string) => void
  onLikeness?:   (text: string) => void
}

function resultToFullText(r: CaptionResult): string {
  return r.hashtags.length > 0 ? `${r.body}\n\n${r.hashtags.join(' ')}` : r.body
}

export default function WriterResults({ loading, results, copied, regenerating, onCopy, onRegen, onSchedule, onVoiceOver, onLikeness }: Props) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <div className="w-8 h-8 border-[3px] border-brand-azure border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-medium text-brand-navy">Writing your content…</p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center mb-4">
          <PenSquare size={26} className="text-brand-orange" />
        </div>
        <p className="font-semibold text-brand-navy mb-1">Your content appears here</p>
        <p className="text-sm text-gray-400 max-w-xs">Pick a topic or enter details above, select a platform, and generate.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {results.map(({ platform, results: captionResults }) => {
        const isSeries = captionResults.length > 1
        return (
          <div key={platform}>
            {results.length > 1 && (
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{PLATFORM_LABEL[platform]}</p>
                {isSeries && (
                  <button type="button" onClick={() => onCopy(captionResults.map(resultToFullText).join('\n\n---\n\n'), `${platform}-all`)}
                    className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline">
                    {copied === `${platform}-all` ? <><Check size={11} />Copied all</> : <><Copy size={11} />Copy all</>}
                  </button>
                )}
              </div>
            )}
            {results.length === 1 && (
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
                  {isSeries ? `${captionResults.length}-Part Series` : 'Caption'}
                </p>
                {isSeries && (
                  <button type="button" onClick={() => onCopy(captionResults.map(resultToFullText).join('\n\n---\n\n'), `${platform}-all`)}
                    className="flex items-center gap-1.5 text-xs text-brand-azure hover:underline">
                    {copied === `${platform}-all` ? <><Check size={11} />Copied all</> : <><Copy size={11} />Copy all</>}
                  </button>
                )}
              </div>
            )}
            <div className="space-y-4">
              {captionResults.map((result, i) => (
                <CaptionCard
                  key={i}
                  result={result}
                  platform={platform}
                  captionIdx={i}
                  isSeries={isSeries}
                  copied={copied}
                  isRegen={regenerating === `${platform}-${i}`}
                  onCopy={onCopy}
                  onRegen={() => onRegen(platform, i)}
                  onSchedule={() => onSchedule(resultToFullText(result), platform)}
                  onVoiceOver={onVoiceOver ? () => onVoiceOver(resultToFullText(result)) : undefined}
                  onLikeness={onLikeness ? () => onLikeness(resultToFullText(result)) : undefined}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
