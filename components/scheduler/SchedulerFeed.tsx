'use client'

import { Calendar, LayoutList, CalendarDays, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import PostCard from '@/components/scheduler/PostCard'
import CalendarView from '@/components/scheduler/CalendarView'
import { type ScheduledPost } from '@/components/scheduler/types'

interface Props {
  posts:        ScheduledPost[]
  tab:          'upcoming' | 'published'
  onTabChange:  (v: 'upcoming' | 'published') => void
  view:         'list' | 'calendar'
  onViewChange: (v: 'list' | 'calendar') => void
  onDelete:     (id: string) => void
  onPublish:    (id: string) => void
}

export default function SchedulerFeed({ posts, tab, onTabChange, view, onViewChange, onDelete, onPublish }: Props) {
  const upcoming  = posts.filter((p) => p.status === 'SCHEDULED' || p.status === 'DRAFT' || p.status === 'FAILED')
  const published = posts.filter((p) => p.status === 'PUBLISHED')

  return (
    <div className="flex-1 p-6 min-w-0">
      <div className="flex items-center gap-4 mb-5 border-b border-gray-200">
        {([
          { id: 'upcoming',  label: 'Upcoming',  count: upcoming.length },
          { id: 'published', label: 'Published', count: published.length },
        ] as const).map((t) => (
          <button key={t.id} type="button" onClick={() => onTabChange(t.id)}
            className={cn(
              'pb-3 text-sm font-semibold border-b-2 transition-colors -mb-px',
              tab === t.id ? 'border-brand-azure text-brand-azure' : 'border-transparent text-gray-400 hover:text-gray-600',
            )}>
            {t.label}
            {t.count > 0 && (
              <span className={cn('ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full', tab === t.id ? 'bg-brand-azure text-white' : 'bg-gray-100 text-gray-500')}>
                {t.count}
              </span>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-3 pb-3">
          <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
            <button type="button" onClick={() => onViewChange('list')}
              className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors', view === 'list' ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <LayoutList size={13} /> List
            </button>
            <button type="button" onClick={() => onViewChange('calendar')}
              className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors', view === 'calendar' ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700')}>
              <CalendarDays size={13} /> Calendar
            </button>
          </div>
        </div>
      </div>

      {view === 'calendar' && <CalendarView posts={tab === 'upcoming' ? upcoming : published} />}

      {view === 'list' && tab === 'upcoming' && (
        upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-navy/10 flex items-center justify-center mb-4">
              <Calendar size={26} className="text-brand-navy" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">No posts scheduled</p>
            <p className="text-sm text-gray-400">Write a caption on the left and schedule your first post.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcoming.map((p) => <PostCard key={p.id} post={p} onDelete={() => onDelete(p.id)} onPublish={() => onPublish(p.id)} />)}
          </div>
        )
      )}

      {view === 'list' && tab === 'published' && (
        published.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <CheckCircle2 size={26} className="text-green-500" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">No published posts yet</p>
            <p className="text-sm text-gray-400">Published posts will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {published.map((p) => <PostCard key={p.id} post={p} onDelete={() => onDelete(p.id)} onPublish={() => onPublish(p.id)} />)}
          </div>
        )
      )}
    </div>
  )
}
