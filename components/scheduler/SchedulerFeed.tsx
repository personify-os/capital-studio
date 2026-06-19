'use client'

import { Calendar, LayoutList, CalendarDays, CheckCircle2, Trash2, FileText, Send, X } from 'lucide-react'
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
  onPreview:    (post: ScheduledPost) => void
  selectedIds:      string[]
  onToggleSelect:   (id: string) => void
  onSelectMany:     (ids: string[]) => void
  onClearSelection: () => void
  onBulkDelete:     () => void
  onBulkDraft:      () => void
  onBulkPublish:    () => void
  bulkBusy:         boolean
}

export default function SchedulerFeed({
  posts, tab, onTabChange, view, onViewChange, onDelete, onPublish, onPreview,
  selectedIds, onToggleSelect, onSelectMany, onClearSelection, onBulkDelete, onBulkDraft, onBulkPublish, bulkBusy,
}: Props) {
  const upcoming  = posts.filter((p) => p.status === 'SCHEDULED' || p.status === 'DRAFT' || p.status === 'FAILED')
  const published = posts.filter((p) => p.status === 'PUBLISHED')
  const list      = tab === 'upcoming' ? upcoming : published
  const selectedSet = new Set(selectedIds)
  const allSelected = list.length > 0 && list.every((p) => selectedSet.has(p.id))

  const renderGrid = (items: ScheduledPost[]) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
      {items.map((p) => (
        <PostCard
          key={p.id} post={p}
          onDelete={() => onDelete(p.id)}
          onPublish={() => onPublish(p.id)}
          onPreview={() => onPreview(p)}
          selected={selectedSet.has(p.id)}
          onToggleSelect={() => onToggleSelect(p.id)}
        />
      ))}
    </div>
  )

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
              className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors', view === 'list' ? 'bg-white text-brand-navy shadow-xs' : 'text-gray-500 hover:text-gray-700')}>
              <LayoutList size={13} /> List
            </button>
            <button type="button" onClick={() => onViewChange('calendar')}
              className={cn('flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors', view === 'calendar' ? 'bg-white text-brand-navy shadow-xs' : 'text-gray-500 hover:text-gray-700')}>
              <CalendarDays size={13} /> Calendar
            </button>
          </div>
        </div>
      </div>

      {/* Bulk action bar */}
      {view === 'list' && selectedIds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4 bg-brand-navy text-white rounded-card px-4 py-2.5 shadow-card">
          <span className="text-xs font-semibold">{selectedIds.length} selected</span>
          <button type="button" onClick={() => onSelectMany(list.map((p) => p.id))} disabled={allSelected}
            className="text-[11px] font-medium text-white/80 hover:text-white disabled:opacity-40">Select all {list.length}</button>
          <button type="button" onClick={onClearSelection} className="text-[11px] font-medium text-white/80 hover:text-white">Clear</button>
          <div className="ml-auto flex items-center gap-2">
            {tab === 'upcoming' && (
              <>
                <button type="button" onClick={onBulkPublish} disabled={bulkBusy}
                  className="flex items-center gap-1.5 text-[11px] font-semibold bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                  <Send size={12} /> Publish
                </button>
                <button type="button" onClick={onBulkDraft} disabled={bulkBusy}
                  className="flex items-center gap-1.5 text-[11px] font-semibold bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-lg disabled:opacity-50">
                  <FileText size={12} /> Mark Draft
                </button>
              </>
            )}
            <button type="button" onClick={onBulkDelete} disabled={bulkBusy}
              className="flex items-center gap-1.5 text-[11px] font-semibold bg-red-500/80 hover:bg-red-500 px-2.5 py-1.5 rounded-lg disabled:opacity-50">
              <Trash2 size={12} /> Delete
            </button>
            <button type="button" onClick={onClearSelection} className="text-white/70 hover:text-white"><X size={14} /></button>
          </div>
        </div>
      )}

      {view === 'calendar' && <CalendarView posts={list} />}

      {view === 'list' && tab === 'upcoming' && (
        upcoming.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-full bg-brand-navy/10 flex items-center justify-center mb-4">
              <Calendar size={26} className="text-brand-navy" />
            </div>
            <p className="font-semibold text-brand-navy mb-1">No posts scheduled</p>
            <p className="text-sm text-gray-400">Write a caption on the left and schedule your first post.</p>
          </div>
        ) : renderGrid(upcoming)
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
        ) : renderGrid(published)
      )}
    </div>
  )
}
