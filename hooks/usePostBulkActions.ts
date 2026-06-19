'use client'

import { useState, type Dispatch, type SetStateAction } from 'react'
import type { ScheduledPost } from '@/components/scheduler/types'

interface Args {
  posts:     ScheduledPost[]
  setPosts:  Dispatch<SetStateAction<ScheduledPost[]>>
  setBanner: (msg: string) => void
}

// Selection state + bulk operations for the scheduler feed. Delete/draft go
// through the single bulk endpoint; publish loops the per-post publish route so
// each platform result is reflected individually.
export function usePostBulkActions({ posts, setPosts, setBanner }: Args) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkBusy,    setBulkBusy]    = useState(false)

  const toggleSelect   = (id: string) => setSelectedIds((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id])
  const selectMany     = (ids: string[]) => setSelectedIds(ids)
  const clearSelection = () => setSelectedIds([])

  async function bulkStatus(action: 'delete' | 'draft') {
    if (!selectedIds.length) return
    const ids = new Set(selectedIds)
    setBulkBusy(true)
    try {
      const res = await fetch('/api/v1/social/posts/bulk', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action }),
      })
      if (!res.ok) { setBanner(`Bulk ${action} failed.`); return }
      if (action === 'delete') {
        setPosts((prev) => prev.filter((p) => !ids.has(p.id)))
      } else {
        setPosts((prev) => prev.map((p) => ids.has(p.id) && p.status !== 'PUBLISHED'
          ? { ...p, status: 'DRAFT', errorMessage: null } : p))
      }
      clearSelection()
    } catch { setBanner(`Bulk ${action} failed.`) }
    finally   { setBulkBusy(false) }
  }

  async function bulkPublish() {
    const targets = posts.filter((p) => selectedIds.includes(p.id) && p.status !== 'PUBLISHED')
    if (!targets.length) { clearSelection(); return }
    setBulkBusy(true)
    try {
      for (const p of targets) {
        const res  = await fetch(`/api/v1/social/posts/${p.id}/publish`, { method: 'POST' })
        const json = await res.json().catch(() => ({}))
        setPosts((prev) => prev.map((x) => x.id === p.id
          ? (res.ok
              ? { ...x, status: 'PUBLISHED', publishedAt: new Date().toISOString(), platformPostId: json.platformPostId ?? null }
              : { ...x, status: 'FAILED', errorMessage: json.message ?? 'Publish failed' })
          : x))
      }
      clearSelection()
    } finally { setBulkBusy(false) }
  }

  return {
    selectedIds, bulkBusy,
    toggleSelect, selectMany, clearSelection,
    bulkDelete:  () => bulkStatus('delete'),
    bulkDraft:   () => bulkStatus('draft'),
    bulkPublish,
  }
}
