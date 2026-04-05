'use client'

import { Copy, Check, RefreshCw, Calendar, ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { type Platform, type CaptionResult, PLATFORM_CHAR_LIMIT } from './types'

interface CaptionCardProps {
  result:     CaptionResult
  platform:   Platform
  captionIdx: number
  isSeries:   boolean
  copied:     string | number | null
  isRegen:    boolean
  onCopy:     (text: string, key: string) => void
  onRegen:    () => void
  onSchedule: () => void
}

export default function CaptionCard({
  result, platform, captionIdx, isSeries, copied, isRegen, onCopy, onRegen, onSchedule,
}: CaptionCardProps) {
  const fullText  = result.hashtags.length > 0
    ? `${result.body}\n\n${result.hashtags.join(' ')}`
    : result.body
  const charLimit = PLATFORM_CHAR_LIMIT[platform]
  const charCount = fullText.length
  const overLimit = charLimit > 0 && charCount > charLimit
  const nearLimit = charLimit > 0 && charCount > charLimit * 0.9
  const regenKey  = `${platform}-${captionIdx}`

  return (
    <div className="bg-white rounded-card shadow-card p-4">
      {isSeries && (
        <p className="text-[10px] font-semibold text-brand-azure uppercase tracking-widest mb-2">
          Post {captionIdx + 1}
        </p>
      )}

      {/* Caption body */}
      <p className="text-sm text-brand-navy whitespace-pre-wrap leading-relaxed">{result.body}</p>

      {/* Hashtags row */}
      {result.hashtags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {result.hashtags.map((tag) => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-brand-azure/10 text-brand-azure font-medium">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Alt text */}
      {result.altText && (
        <div className="mt-2 flex items-start gap-1.5 bg-gray-50 rounded-lg px-2.5 py-1.5">
          <ImageIcon size={10} className="text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-[10px] text-gray-400 leading-snug italic">{result.altText}</p>
          <button
            type="button"
            onClick={() => onCopy(result.altText!, `${regenKey}-alt`)}
            className="ml-auto flex-shrink-0 text-[9px] text-gray-400 hover:text-brand-azure transition-colors"
          >
            {copied === `${regenKey}-alt` ? <Check size={9} /> : <Copy size={9} />}
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 pt-3 mt-2 border-t border-gray-100">
        {charLimit > 0 && (
          <span className={cn(
            'text-[10px] font-mono tabular-nums',
            overLimit ? 'text-red-500 font-semibold' : nearLimit ? 'text-amber-500' : 'text-gray-300',
          )}>
            {charCount}/{charLimit}
          </span>
        )}
        <button
          type="button"
          onClick={() => onCopy(fullText, regenKey)}
          className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-brand-azure bg-gray-50 border border-gray-200 px-2 py-1 rounded transition-colors"
        >
          {copied === regenKey ? <><Check size={10} />Copied</> : <><Copy size={10} />Copy</>}
        </button>
        <button
          type="button"
          disabled={isRegen}
          onClick={onRegen}
          className="flex items-center gap-1 text-[10px] font-medium text-gray-400 hover:text-brand-azure bg-gray-50 border border-gray-200 px-2 py-1 rounded transition-colors disabled:opacity-40"
          title="Regenerate this caption"
        >
          <RefreshCw size={10} className={isRegen ? 'animate-spin' : ''} />
          {isRegen ? 'Writing…' : 'Retry'}
        </button>
        <button
          type="button"
          onClick={onSchedule}
          className="flex items-center gap-1 text-[10px] font-medium text-brand-azure hover:text-brand-navy bg-brand-azure/5 border border-brand-azure/20 px-2 py-1 rounded transition-colors ml-auto"
        >
          <Calendar size={10} />Schedule
        </button>
      </div>
    </div>
  )
}
