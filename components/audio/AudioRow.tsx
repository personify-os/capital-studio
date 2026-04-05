import { Download } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

export interface RecentAudio { id: string; s3Url: string; metadata: { text?: string; voiceName?: string; title?: string; brandId?: string } | null; createdAt: string }

export default function AudioRow({ audio }: { audio: RecentAudio }) {
  const meta = audio.metadata
  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-brand-navy truncate">{meta?.text ?? 'Voiceover'}</p>
          <p className="text-[10px] text-gray-400 mt-0.5">{meta?.voiceName} · {formatRelativeTime(audio.createdAt)}</p>
        </div>
        <a href={audio.s3Url} download className="text-brand-azure hover:text-brand-navy flex-shrink-0">
          <Download size={14} />
        </a>
      </div>
      <audio src={audio.s3Url} controls className="w-full h-8" style={{ height: '32px' }} />
    </div>
  )
}
