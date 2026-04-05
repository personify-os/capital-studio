'use client'

import { useState, useCallback, useEffect } from 'react'
import { CheckCircle2, XCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Props, ScheduledPost, type ConnectModalId,
} from '@/components/scheduler/types'
import {
  ConnectPickerModal, ConnectFacebookModal, ConnectThreadsModal,
  ConnectLinkedInModal, ConnectXModal, ConnectMediumModal,
  ConnectSubstackModal, ConnectBlueskyModal,
} from '@/components/scheduler/ConnectModals'
import SchedulerComposer from '@/components/scheduler/SchedulerComposer'
import SchedulerFeed from '@/components/scheduler/SchedulerFeed'

export default function SchedulerClient({ initialAccounts, initialPosts, libraryAssets }: Props) {
  const [accounts,     setAccounts]     = useState(initialAccounts)
  const [posts,        setPosts]        = useState(initialPosts)
  const [connectModal, setConnectModal] = useState<ConnectModalId | null>(null)
  const [oauthBanner,  setOauthBanner]  = useState<string | null>(null)
  const [tab,          setTab]          = useState<'upcoming' | 'published'>('upcoming')
  const [view,         setView]         = useState<'list' | 'calendar'>('list')

  // Composer state
  const [caption,       setCaption]       = useState('')
  const [igCaption,     setIgCaption]     = useState('')
  const [imageUrl,      setImageUrl]      = useState('')
  const [selectedAccts, setSelectedAccts] = useState<string[]>([])
  const [scheduledFor,  setScheduledFor]  = useState(() => {
    const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0)
    return d.toISOString().slice(0, 16)
  })
  const [scheduling,    setScheduling]    = useState(false)
  const [scheduleError, setScheduleError] = useState('')
  const [pickerOpen,    setPickerOpen]    = useState(false)

  const hasFacebook = selectedAccts.some((id) => accounts.find((a) => a.id === id)?.platform === 'FACEBOOK')

  useEffect(() => {
    const params    = new URLSearchParams(window.location.search)
    const connected = params.get('connected')
    const error     = params.get('error')
    if (connected) {
      setOauthBanner(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`)
      fetch('/api/v1/social/accounts')
        .then((r) => r.json())
        .then((j) => { if (j.accounts) setAccounts(j.accounts) })
        .catch((err) => console.error('[scheduler] account refresh failed:', err))
      window.history.replaceState({}, '', '/scheduler')
    } else if (error) {
      setOauthBanner(`Connection failed: ${error.replace(/_/g, ' ')}`)
      window.history.replaceState({}, '', '/scheduler')
    }
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem('schedulerDraft')
      if (!raw) return
      localStorage.removeItem('schedulerDraft')
      const draft = JSON.parse(raw) as { caption?: string; platform?: string; imageUrl?: string }
      if (draft.caption)  setCaption(draft.caption)
      if (draft.imageUrl) setImageUrl(draft.imageUrl)
      const parts = [draft.caption && 'caption', draft.imageUrl && 'image'].filter(Boolean)
      if (parts.length) {
        setOauthBanner(`${parts.map((p) => p!.charAt(0).toUpperCase() + p!.slice(1)).join(' + ')} loaded — select an account and schedule it!`)
      }
    } catch { /* ignore malformed draft */ }
  }, [])

  const handleDisconnect = useCallback(async (id: string) => {
    await fetch(`/api/v1/social/accounts/${id}`, { method: 'DELETE' })
    setAccounts((prev) => prev.filter((x) => x.id !== id))
    setSelectedAccts((prev) => prev.filter((x) => x !== id))
  }, [])

  const handleSchedule = useCallback(async (publishNow = false) => {
    if (!caption.trim() || selectedAccts.length === 0) return
    setScheduling(true); setScheduleError('')
    try {
      const res  = await fetch('/api/v1/social/posts', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          socialAccountIds: selectedAccts,
          caption:          caption.trim(),
          instagramCaption: igCaption.trim() || undefined,
          imageUrl:         imageUrl.trim() || undefined,
          scheduledFor:     publishNow ? new Date().toISOString() : new Date(scheduledFor).toISOString(),
        }),
      })
      const json = await res.json()
      if (!res.ok) { setScheduleError(json.message ?? 'Failed to schedule'); return }

      setPosts((prev) => [...prev, ...(json.posts as ScheduledPost[])])

      if (publishNow) {
        for (const p of json.posts as ScheduledPost[]) {
          const pubRes  = await fetch(`/api/v1/social/posts/${p.id}/publish`, { method: 'POST' })
          const pubJson = await pubRes.json()
          if (pubRes.ok) {
            setPosts((prev) => prev.map((x) => x.id === p.id
              ? { ...x, status: 'PUBLISHED', publishedAt: new Date().toISOString(), platformPostId: pubJson.platformPostId ?? null }
              : x))
          } else {
            setPosts((prev) => prev.map((x) => x.id === p.id ? { ...x, status: 'FAILED', errorMessage: pubJson.message } : x))
          }
        }
      }

      setCaption(''); setIgCaption(''); setImageUrl(''); setSelectedAccts([])
    } finally {
      setScheduling(false)
    }
  }, [caption, igCaption, imageUrl, selectedAccts, scheduledFor])

  async function handleDelete(id: string) {
    const res = await fetch(`/api/v1/social/posts/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setPosts((prev) => prev.filter((p) => p.id !== id))
    } else {
      const json = await res.json().catch(() => ({}))
      setOauthBanner(`Delete failed: ${json.message ?? 'unknown error'}`)
    }
  }

  async function handlePublish(id: string) {
    const res  = await fetch(`/api/v1/social/posts/${id}/publish`, { method: 'POST' })
    const json = await res.json()
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p.id === id
        ? { ...p, status: 'PUBLISHED', publishedAt: new Date().toISOString(), platformPostId: json.platformPostId ?? null }
        : p))
    } else {
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: 'FAILED', errorMessage: json.message } : p))
    }
  }

  return (
    <div className="flex bg-app-bg">
      {oauthBanner && (
        <div className={cn(
          'fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg text-sm font-medium',
          oauthBanner.includes('failed') ? 'bg-red-50 border border-red-200 text-red-700' : 'bg-green-50 border border-green-200 text-green-700',
        )}>
          {oauthBanner.includes('failed') ? <XCircle size={15} /> : <CheckCircle2 size={15} />}
          {oauthBanner}
          <button type="button" onClick={() => setOauthBanner(null)} className="ml-1 opacity-60 hover:opacity-100"><X size={13} /></button>
        </div>
      )}

      {connectModal === 'picker'   && <ConnectPickerModal accounts={accounts} onClose={() => setConnectModal(null)} onSelect={(p) => setConnectModal(p)} />}
      {connectModal === 'facebook' && <ConnectFacebookModal onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}
      {connectModal === 'threads'  && <ConnectThreadsModal  onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}
      {connectModal === 'linkedin' && <ConnectLinkedInModal onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}
      {connectModal === 'x'        && <ConnectXModal        onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}
      {connectModal === 'medium'   && <ConnectMediumModal   onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}
      {connectModal === 'substack' && <ConnectSubstackModal onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}
      {connectModal === 'bluesky'  && <ConnectBlueskyModal  onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}

      <SchedulerComposer
        accounts={accounts}           selectedAccts={selectedAccts}
        onToggleAccount={(id) => setSelectedAccts((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])}
        onOpenModal={(m) => setConnectModal(m)}
        onDisconnect={handleDisconnect}
        caption={caption}             onCaption={setCaption}
        igCaption={igCaption}         onIgCaption={setIgCaption}
        hasFacebook={hasFacebook}
        imageUrl={imageUrl}           onImageUrl={setImageUrl}
        libraryAssets={libraryAssets}
        pickerOpen={pickerOpen}       onPickerOpen={setPickerOpen}
        scheduledFor={scheduledFor}   onScheduledFor={setScheduledFor}
        scheduling={scheduling}       scheduleError={scheduleError}
        onSchedule={() => handleSchedule(false)}
        onScheduleNow={() => handleSchedule(true)}
      />

      <SchedulerFeed
        posts={posts}
        tab={tab}          onTabChange={setTab}
        view={view}        onViewChange={setView}
        onDelete={handleDelete}
        onPublish={handlePublish}
      />
    </div>
  )
}
