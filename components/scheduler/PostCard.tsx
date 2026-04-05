'use client'

import { useState } from 'react'
import { Send, Trash2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScheduledPost, STATUS_CONFIG, PLATFORM_ICON, PLATFORM_COLOR } from './types'

interface PostCardProps {
  post:      ScheduledPost
  onDelete:  () => void
  onPublish: () => void
}

export default function PostCard({ post, onDelete, onPublish }: PostCardProps) {
  const [publishing, setPublishing] = useState(false)
  const status = STATUS_CONFIG[post.status]
  const Icon   = PLATFORM_ICON[post.socialAccount.platform]
  const PIcon  = status.icon

  async function handlePublish() {
    setPublishing(true)
    await onPublish()
    setPublishing(false)
  }

  const scheduledDate = new Date(post.scheduledFor)
  const isPast        = scheduledDate < new Date()

  return (
    <div className="bg-white rounded-card shadow-card p-4">
      <div className="flex items-start gap-3">
        {post.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.imageUrl} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <Icon size={14} className={cn('flex-shrink-0', PLATFORM_COLOR[post.socialAccount.platform])} />
            <span className="text-xs font-medium text-brand-navy truncate">{post.socialAccount.accountName}</span>
            <span className={cn('ml-auto flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border', status.color)}>
              <PIcon size={10} /> {status.label}
            </span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">{post.caption}</p>
          <p className="text-[10px] text-gray-400 mt-1.5">
            {isPast && post.status !== 'PUBLISHED' ? 'Was ' : ''}
            {scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </p>
          {post.errorMessage && (
            <p className="text-[10px] text-red-600 mt-1 truncate">{post.errorMessage}</p>
          )}
        </div>
      </div>
      {post.status !== 'PUBLISHED' && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            type="button"
            onClick={handlePublish}
            disabled={publishing}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-azure hover:text-brand-navy transition-colors disabled:opacity-50"
          >
            {publishing
              ? <><div className="w-3 h-3 border-2 border-brand-azure/30 border-t-brand-azure rounded-full animate-spin" />Publishing…</>
              : <><Send size={11} />Publish Now</>
            }
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Delete this scheduled post?')) onDelete()
            }}
            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors ml-auto"
          >
            <Trash2 size={11} />
          </button>
        </div>
      )}
      {post.status === 'PUBLISHED' && post.platformPostId && (
        <p className="text-[10px] text-green-600 mt-2 pt-2 border-t border-gray-100 flex items-center gap-1">
          <CheckCircle2 size={10} /> Post ID: {post.platformPostId}
        </p>
      )}
    </div>
  )
}
