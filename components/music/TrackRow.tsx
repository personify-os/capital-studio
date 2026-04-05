import { Download } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export interface RecentTrack {
  id:        string
  s3Url:     string
  metadata:  { title?: string; model?: string; description?: string; style?: string; instrumental?: boolean; source?: string } | null
  createdAt: string
}

export default function TrackRow({ track }: { track: RecentTrack }) {
  const meta = track.metadata

  const displayTitle = meta?.title || meta?.description?.slice(0, 60) || 'Untitled Track'

  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-brand-navy truncate">{displayTitle}</p>
          <div className="flex items-center gap-2 mt-1">
            {meta?.model && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-badge bg-brand-azure/10 text-brand-azure text-[9px] font-semibold uppercase tracking-wide">
                {meta.model}
              </span>
            )}
            {meta?.instrumental && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-badge bg-gray-100 text-gray-500 text-[9px] font-medium">
                Instrumental
              </span>
            )}
            <span className="text-[10px] text-gray-400">{formatRelativeTime(track.createdAt)}</span>
          </div>
        </div>
        <a href={track.s3Url} download className="text-brand-azure hover:text-brand-navy flex-shrink-0">
          <Download size={14} />
        </a>
      </div>
      <audio src={track.s3Url} controls className="w-full h-8" style={{ height: '32px' }} />
    </div>
  )
}
