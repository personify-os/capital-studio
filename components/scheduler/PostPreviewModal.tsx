'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduledPost, STATUS_CONFIG, PLATFORM_ICON, PLATFORM_COLOR, PLATFORM_META } from './types'

interface Props {
  post:    ScheduledPost
  onClose: () => void
}

// A faithful read-only preview of a scheduled/published post.
export default function PostPreviewModal({ post, onClose }: Props) {
  const Icon          = PLATFORM_ICON[post.socialAccount.platform]
  const status        = STATUS_CONFIG[post.status]
  const PIcon         = status.icon
  const platformLabel = PLATFORM_META.find((p) => p.platform === post.socialAccount.platform)?.label ?? post.socialAccount.platform
  const when          = new Date(post.scheduledFor).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg bg-white rounded-card shadow-card-hover overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5 min-w-0">
            <Icon size={16} className={cn('flex-shrink-0', PLATFORM_COLOR[post.socialAccount.platform])} />
            <div className="min-w-0">
              <p className="font-semibold text-brand-navy text-sm truncate">{post.socialAccount.accountName}</p>
              <p className="text-[11px] text-gray-400 leading-none">{platformLabel}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 flex-shrink-0">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-2">
            <span className={cn('flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', status.color)}>
              <PIcon size={10} /> {status.label}
            </span>
            <span className="text-[11px] text-gray-400">{post.status === 'PUBLISHED' ? 'Published' : 'Scheduled for'} {when}</span>
          </div>

          {post.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.imageUrl} alt="" className="w-full rounded-lg border border-gray-100 object-cover max-h-80" />
          )}

          {post.caption
            ? <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.caption}</p>
            : <p className="text-sm text-gray-400 italic">No caption.</p>}

          {post.errorMessage && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{post.errorMessage}</p>
          )}
          {post.status === 'PUBLISHED' && post.platformPostId && (
            <p className="text-[11px] text-green-600">Platform post ID: {post.platformPostId}</p>
          )}
        </div>
      </div>
    </div>
  )
}
