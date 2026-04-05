import { Play } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'

interface RecentVideo { id: string; s3Url: string; metadata: unknown; createdAt: string }

export default function MotionThumb({ video }: { video: RecentVideo }) {
  const meta = video.metadata as { prompt?: string; imageUrl?: string } | null
  return (
    <div className="rounded-card overflow-hidden shadow-card bg-black group relative">
      <video src={video.s3Url} className="w-full aspect-video object-cover" preload="metadata" />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
          <Play size={16} className="text-brand-navy ml-0.5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
        <p className="text-white/70 text-[9px] truncate">{meta?.prompt}</p>
        <p className="text-white/40 text-[9px]">motion · {formatRelativeTime(video.createdAt)}</p>
      </div>
    </div>
  )
}
