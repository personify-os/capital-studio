'use client'

import { useState, useCallback } from 'react'
import {
  Calendar, Plus, Trash2, Send, CheckCircle2, XCircle, Clock,
  Facebook, Instagram, AlertCircle, X, Link as LinkIcon, Eye,
  ChevronLeft, ChevronRight, LayoutList, CalendarDays,
} from 'lucide-react'
import { cn, formatRelativeTime } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Textarea from '@/components/ui/Textarea'

// ─── Types ────────────────────────────────────────────────────────────────────

type Platform   = 'FACEBOOK' | 'INSTAGRAM' | 'X' | 'LINKEDIN' | 'YOUTUBE' | 'TIKTOK' | 'THREADS' | 'SUBSTACK' | 'MEDIUM'
type PostStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED'

interface SocialAccount { id: string; platform: Platform; accountName: string; accountId: string; createdAt: string }
interface ScheduledPost {
  id: string; caption: string | null; imageUrl: string | null; assetId: string | null
  scheduledFor: string; status: PostStatus; publishedAt: string | null
  createdAt: string; errorMessage: string | null; platformPostId: string | null
  socialAccount: { id: string; platform: Platform; accountName: string }
}
interface LibraryAsset { id: string; type: string; s3Url: string; metadata: unknown }

interface Props {
  initialAccounts:  SocialAccount[]
  initialPosts:     ScheduledPost[]
  libraryAssets:    LibraryAsset[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Wraps a raw SVG path so `size` prop works like Lucide icons
function svgIcon(path: string, props?: Record<string, unknown>) {
  return function SvgIcon({ size = 16, className, ...rest }: { size?: number; className?: string; [k: string]: unknown }) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className} {...props} {...rest}>
        <path d={path} />
      </svg>
    )
  }
}

const GenericIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size} className={className}>
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
  </svg>
)

const PLATFORM_ICON: Record<Platform, React.ElementType> = {
  FACEBOOK:  Facebook,
  INSTAGRAM: Instagram,
  X:         svgIcon('M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.402 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z'),
  LINKEDIN:  svgIcon('M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'),
  YOUTUBE:   svgIcon('M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'),
  TIKTOK:    svgIcon('M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'),
  THREADS:   svgIcon('M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.378-.887h-.018c-.852 0-1.676.228-2.101.592L7.47 8.802c.853-.439 1.895-.6h.017c1.474.008 2.714.473 3.597 1.343 1.09 1.075 1.535 2.6 1.517 4.8-.016 1.73-.485 3.118-1.393 4.12-1.01 1.115-2.535 1.705-4.567 1.756-2.055-.055-3.676-.67-4.807-1.825C.34 17.843-.037 15.83 0 13.355v-.034c-.037-2.474.34-4.486 1.433-5.631C2.56 6.527 4.18 5.91 6.235 5.855 8.26 5.91 9.77 6.487 10.79 7.575c1.107 1.182 1.59 2.852 1.561 5.077v.053l-.003.015c.04 1.665-.358 2.933-1.183 3.771-.812.824-1.976 1.233-3.46 1.233h-.013c-.896-.002-1.697-.166-2.397-.487a2.6 2.6 0 0 1-1.437-1.437c-.322-.7-.486-1.503-.487-2.4v-.013c0-1.454.399-2.61 1.187-3.436.8-.84 1.977-1.274 3.504-1.274h.01a5.51 5.51 0 0 1 1.85.285v-.017c-.146-1.267-.607-2.14-1.387-2.617-.623-.388-1.451-.584-2.474-.584-1.55 0-2.695.469-3.404 1.393C2.6 8.595 2.24 9.778 2.21 11.195c.03 2.893.66 5.025 1.875 6.34 1.099 1.19 2.748 1.802 4.906 1.818 1.73-.016 3.055-.49 3.933-1.408.904-.944 1.36-2.346 1.357-4.167.003-1.813-.44-3.188-1.319-4.085-.913-.935-2.265-1.413-4.014-1.428z'),
  SUBSTACK:  GenericIcon,
  MEDIUM:    GenericIcon,
}

const PLATFORM_COLOR: Record<Platform, string> = {
  FACEBOOK:  'text-[#1877F2]',
  INSTAGRAM: 'text-[#E4405F]',
  X:         'text-black',
  LINKEDIN:  'text-[#0A66C2]',
  YOUTUBE:   'text-[#FF0000]',
  TIKTOK:    'text-black',
  THREADS:   'text-black',
  SUBSTACK:  'text-[#FF6719]',
  MEDIUM:    'text-black',
}

const STATUS_CONFIG: Record<PostStatus, { label: string; icon: React.ElementType; color: string }> = {
  DRAFT:     { label: 'Draft',     icon: Clock,         color: 'text-gray-400 bg-gray-50 border-gray-200' },
  SCHEDULED: { label: 'Scheduled', icon: Clock,         color: 'text-brand-azure bg-brand-azure/5 border-brand-azure/20' },
  PUBLISHED: { label: 'Published', icon: CheckCircle2,  color: 'text-green-600 bg-green-50 border-green-200' },
  FAILED:    { label: 'Failed',    icon: XCircle,       color: 'text-red-600 bg-red-50 border-red-200' },
}

// ─── Connect Threads Modal ─────────────────────────────────────────────────────

function ConnectThreadsModal({ onClose, onConnected }: { onClose: () => void; onConnected: (accts: SocialAccount[]) => void }) {
  const [token,   setToken]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleConnect() {
    if (!token.trim()) return
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/v1/social/connect/threads', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: token.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message ?? 'Connection failed'); return }
      const acctRes  = await fetch('/api/v1/social/accounts')
      const acctJson = await acctRes.json()
      onConnected(acctJson.accounts)
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const ThreadsIcon = PLATFORM_ICON['THREADS']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-card shadow-card-hover overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <ThreadsIcon size={16} className="text-black" />
            <p className="font-semibold text-brand-navy text-sm">Connect Threads</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3.5 text-xs text-gray-700 space-y-1.5">
            <p className="font-semibold">How to get your Threads token:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Go to <span className="font-mono text-[11px]">developers.facebook.com</span> → Capital Studio app</li>
              <li>Click <strong>Use cases</strong> → <strong>Access the Threads API</strong> → <strong>Settings</strong></li>
              <li>Scroll to <strong>User Token Generator</strong> → add yourself as a tester</li>
              <li>Click <strong>Generate Token</strong> next to your name</li>
              <li>Paste the token below</li>
            </ol>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Threads Access Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="THQWJRxxxxxxxxxxxxxxxx..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <Button size="sm" loading={loading} disabled={!token.trim()} onClick={handleConnect}>
            Connect
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Connect Facebook Modal ────────────────────────────────────────────────────

function ConnectFacebookModal({ onClose, onConnected }: { onClose: () => void; onConnected: (accts: SocialAccount[]) => void }) {
  const [token,   setToken]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleConnect() {
    if (!token.trim()) return
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/v1/social/connect/facebook', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ userToken: token.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message ?? 'Connection failed'); return }
      // Refresh accounts list
      const acctRes  = await fetch('/api/v1/social/accounts')
      const acctJson = await acctRes.json()
      onConnected(acctJson.accounts)
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-card shadow-card-hover overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <Facebook size={16} className="text-[#1877F2]" />
            <p className="font-semibold text-brand-navy text-sm">Connect Facebook & Instagram</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-blue-50 rounded-lg p-3.5 text-xs text-blue-800 space-y-1.5">
            <p className="font-semibold">How to get your access token:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Go to <span className="font-mono">developers.facebook.com</span> → Your App → Tools</li>
              <li>Under "Select Token Permissions", enable <span className="font-mono">pages_manage_posts</span>, <span className="font-mono">pages_read_engagement</span>, and <span className="font-mono">instagram_basic</span></li>
              <li>Click "Get Token" and paste it below</li>
            </ol>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">User Access Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="EAAxxxxxxxxxxxxxxxx..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <Button size="sm" loading={loading} disabled={!token.trim()} onClick={handleConnect}>
            Connect Pages
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Connect Medium Modal ──────────────────────────────────────────────────────

function ConnectMediumModal({ onClose, onConnected }: { onClose: () => void; onConnected: (accts: SocialAccount[]) => void }) {
  const [token,   setToken]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleConnect() {
    if (!token.trim()) return
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/v1/social/connect/medium', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: token.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message ?? 'Connection failed'); return }
      const acctRes  = await fetch('/api/v1/social/accounts')
      const acctJson = await acctRes.json()
      onConnected(acctJson.accounts)
      onClose()
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-card shadow-card-hover overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <GenericIcon size={16} className="text-black" />
            <p className="font-semibold text-brand-navy text-sm">Connect Medium</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3.5 text-xs text-gray-700 space-y-1.5">
            <p className="font-semibold">How to get your Medium integration token:</p>
            <ol className="list-decimal list-inside space-y-1 text-gray-600">
              <li>Go to <span className="font-mono text-[11px]">medium.com</span> → click your profile photo → Settings</li>
              <li>Scroll to <strong>Integration tokens</strong> at the bottom</li>
              <li>Enter a description (e.g. "Capital Studio") and click <strong>Get integration token</strong></li>
              <li>Paste the token below</li>
            </ol>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Integration Token</label>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="2b41e47c3b4d..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
            />
          </div>
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{error}</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <Button size="sm" loading={loading} disabled={!token.trim()} onClick={handleConnect}>
            Connect Medium
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Post Card ─────────────────────────────────────────────────────────────────

function PostCard({ post, onDelete, onPublish }: { post: ScheduledPost; onDelete: () => void; onPublish: () => void }) {
  const [publishing, setPublishing] = useState(false)
  const status  = STATUS_CONFIG[post.status]
  const Icon    = PLATFORM_ICON[post.socialAccount.platform]
  const PIcon   = status.icon

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
            {isPast && post.status !== 'PUBLISHED' ? 'Was ' : ''}{scheduledDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
            onClick={onDelete}
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

// ─── Connect Platform Picker ───────────────────────────────────────────────────

const PLATFORM_META: { platform: Platform; label: string; live: boolean }[] = [
  { platform: 'FACEBOOK',  label: 'Facebook & Instagram', live: true },
  { platform: 'THREADS',   label: 'Threads',              live: true },
  { platform: 'LINKEDIN',  label: 'LinkedIn',             live: true },
  { platform: 'X',         label: 'X (Twitter)',          live: true },
  { platform: 'INSTAGRAM', label: 'Instagram',            live: false },
  { platform: 'YOUTUBE',   label: 'YouTube',              live: false },
  { platform: 'TIKTOK',    label: 'TikTok',               live: false },
  { platform: 'SUBSTACK',  label: 'Substack',             live: false },
  { platform: 'MEDIUM',    label: 'Medium',               live: true },
]

function ConnectPickerModal({
  accounts,
  onClose,
  onSelect,
}: {
  accounts: SocialAccount[]
  onClose: () => void
  onSelect: (platform: 'facebook' | 'threads' | 'linkedin' | 'x' | 'medium') => void
}) {
  const connectedPlatforms = new Set(accounts.map((a) => a.platform))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-card shadow-card-hover overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-semibold text-brand-navy text-sm">Connect a Platform</p>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5 grid grid-cols-3 gap-2">
          {PLATFORM_META.map(({ platform, label, live }) => {
            const Icon      = PLATFORM_ICON[platform]
            const connected = connectedPlatforms.has(platform)
            if (platform === 'INSTAGRAM') return null // bundled with Facebook

            return (
              <button
                key={platform}
                type="button"
                disabled={!live && !connected}
                onClick={() => {
                  if (!live) return
                  if (platform === 'FACEBOOK')  { onClose(); onSelect('facebook')  }
                  if (platform === 'THREADS')   { onClose(); onSelect('threads')   }
                  if (platform === 'LINKEDIN')  { onClose(); onSelect('linkedin')  }
                  if (platform === 'X')         { onClose(); onSelect('x')         }
                }}
                className={cn(
                  'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-center',
                  connected
                    ? 'border-green-300 bg-green-50'
                    : live
                      ? 'border-gray-200 hover:border-brand-azure hover:bg-brand-azure/5 cursor-pointer'
                      : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed',
                )}
              >
                <Icon size={20} className={cn(PLATFORM_COLOR[platform])} />
                <span className="text-[10px] font-medium text-gray-700 leading-tight">{label}</span>
                {connected && <span className="text-[9px] text-green-600 font-semibold">Connected</span>}
                {!live && !connected && <span className="text-[9px] text-gray-400">Soon</span>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Connect LinkedIn Modal ────────────────────────────────────────────────────

function ConnectLinkedInModal({ onClose, onConnected }: { onClose: () => void; onConnected: (a: SocialAccount[]) => void }) {
  const [token,   setToken]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const res  = await fetch('/api/v1/social/connect/linkedin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ accessToken: token.trim() }) })
    const json = await res.json()
    if (!res.ok) { setError(json.message ?? 'Failed'); setLoading(false); return }
    const accts = await fetch('/api/v1/social/accounts').then((r) => r.json())
    onConnected(accts); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-card shadow-card-hover overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-semibold text-brand-navy text-sm">Connect LinkedIn</p>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} className="text-gray-500" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 space-y-1">
            <p className="font-semibold">How to get your LinkedIn access token:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
              <li>Go to <span className="font-medium">LinkedIn Developer Portal</span> → your app</li>
              <li>Enable the <span className="font-medium">&quot;Share on LinkedIn&quot;</span> product</li>
              <li>Open the <span className="font-medium">OAuth 2.0 Tools</span> tab</li>
              <li>Generate a token with <span className="font-medium">w_member_social</span> scope</li>
              <li>Paste the token below</li>
            </ol>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Access Token</label>
            <textarea
              rows={3}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="AQV..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure resize-none"
            />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading || !token.trim()} className="w-full py-2.5 bg-brand-azure hover:bg-brand-navy disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors">
            {loading ? 'Connecting…' : 'Connect LinkedIn'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Connect X Modal ───────────────────────────────────────────────────────────

function ConnectXModal({ onClose, onConnected }: { onClose: () => void; onConnected: (a: SocialAccount[]) => void }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleConnect() {
    setLoading(true); setError(null)
    const res  = await fetch('/api/v1/social/connect/x', { method: 'POST' })
    const json = await res.json()
    if (!res.ok) { setError(json.message ?? 'Failed'); setLoading(false); return }
    const accts = await fetch('/api/v1/social/accounts').then((r) => r.json())
    onConnected(accts); onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm bg-white rounded-card shadow-card-hover overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <p className="font-semibold text-brand-navy text-sm">Connect X (Twitter)</p>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100"><X size={16} className="text-gray-500" /></button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-500">Connects using the X credentials configured for Capital Studio.</p>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          <button type="button" onClick={handleConnect} disabled={loading} className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors">
            {loading ? 'Connecting…' : 'Connect X'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Calendar View ─────────────────────────────────────────────────────────────

function CalendarView({ posts }: { posts: ScheduledPost[] }) {
  const today = new Date()
  const [year,  setYear]  = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  function prevMonth() {
    if (month === 0) { setYear((y) => y - 1); setMonth(11) }
    else setMonth((m) => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setYear((y) => y + 1); setMonth(0) }
    else setMonth((m) => m + 1)
  }

  const monthName = new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstDay  = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrev  = new Date(year, month, 0).getDate()

  // Group posts by date key
  const postsByDate: Record<string, ScheduledPost[]> = {}
  for (const p of posts) {
    const d   = new Date(p.scheduledFor)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    postsByDate[key] = [...(postsByDate[key] ?? []), p]
  }

  type Cell = { day: number; currentMonth: boolean; date: string }
  const cells: Cell[] = []
  const prevM = month === 0 ? 11 : month - 1
  const prevY = month === 0 ? year - 1 : year
  for (let i = firstDay - 1; i >= 0; i--) {
    const d = daysInPrev - i
    cells.push({ day: d, currentMonth: false, date: `${prevY}-${String(prevM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true, date: `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
  }
  const nextM = month === 11 ? 0 : month + 1
  const nextY = month === 11 ? year + 1 : year
  for (let d = 1; cells.length < 42; d++) {
    cells.push({ day: d, currentMonth: false, date: `${nextY}-${String(nextM + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}` })
  }

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

  return (
    <div>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-1">
          <button type="button" onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-semibold text-brand-navy min-w-[168px] text-center">{monthName}</span>
          <button type="button" onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
        <button
          type="button"
          onClick={() => { setYear(today.getFullYear()); setMonth(today.getMonth()) }}
          className="text-xs font-medium text-brand-azure border border-brand-azure/30 px-2.5 py-1 rounded-lg hover:bg-brand-azure/5 transition-colors"
        >
          Today
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 uppercase pb-2">{d}</div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-gray-100 rounded-xl overflow-hidden border border-gray-100">
        {cells.map((cell, i) => {
          const dayPosts = postsByDate[cell.date] ?? []
          const isToday  = cell.date === todayStr
          return (
            <div key={i} className={cn('bg-white min-h-[90px] p-1.5', !cell.currentMonth && 'bg-gray-50/60')}>
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 mx-auto',
                isToday ? 'bg-brand-azure text-white' : cell.currentMonth ? 'text-gray-700' : 'text-gray-300',
              )}>
                {cell.day}
              </div>
              <div className="space-y-0.5">
                {dayPosts.slice(0, 3).map((p) => (
                  <div
                    key={p.id}
                    title={p.caption ?? ''}
                    className={cn(
                      'text-[9px] px-1 py-0.5 rounded truncate font-medium',
                      p.status === 'PUBLISHED'
                        ? 'bg-green-100 text-green-700'
                        : p.status === 'FAILED'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-brand-azure/10 text-brand-azure',
                    )}
                  >
                    {p.caption ?? '(no caption)'}
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <div className="text-[9px] text-gray-400 font-medium pl-1">+{dayPosts.length - 3} more</div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function SchedulerClient({ initialAccounts, initialPosts, libraryAssets }: Props) {
  const [accounts,         setAccounts]         = useState(initialAccounts)
  const [posts,            setPosts]            = useState(initialPosts)
  const [connectModal,     setConnectModal]     = useState<'picker' | 'facebook' | 'threads' | 'linkedin' | 'x' | 'medium' | null>(null)
  const [tab,              setTab]              = useState<'upcoming' | 'published'>('upcoming')
  const [view,             setView]             = useState<'list' | 'calendar'>('list')

  // Composer state
  const [caption,       setCaption]       = useState('')
  const [imageUrl,      setImageUrl]      = useState('')
  const [selectedAccts, setSelectedAccts] = useState<string[]>([])
  const [scheduledFor,  setScheduledFor]  = useState(() => {
    const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0)
    return d.toISOString().slice(0, 16) // YYYY-MM-DDTHH:mm
  })
  const [scheduling,    setScheduling]    = useState(false)
  const [scheduleError, setScheduleError] = useState('')
  const [pickerOpen,    setPickerOpen]    = useState(false)

  function toggleAccount(id: string) {
    setSelectedAccts((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

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
          imageUrl:         imageUrl.trim() || undefined,
          scheduledFor:     publishNow ? new Date().toISOString() : new Date(scheduledFor).toISOString(),
        }),
      })
      const json = await res.json()
      if (!res.ok) { setScheduleError(json.message ?? 'Failed to schedule'); return }

      setPosts((prev) => [...prev, ...(json.posts as ScheduledPost[])])

      if (publishNow) {
        // Immediately publish each created post
        for (const p of json.posts as ScheduledPost[]) {
          const pubRes = await fetch(`/api/v1/social/posts/${p.id}/publish`, { method: 'POST' })
          const pubJson = await pubRes.json()
          if (pubRes.ok) {
            setPosts((prev) => prev.map((x) => x.id === p.id ? { ...x, status: 'PUBLISHED', publishedAt: new Date().toISOString(), platformPostId: pubJson.platformPostId ?? null } : x))
          }
        }
      }

      setCaption(''); setImageUrl(''); setSelectedAccts([])
    } finally {
      setScheduling(false)
    }
  }, [caption, imageUrl, selectedAccts, scheduledFor])

  async function handleDelete(id: string) {
    await fetch(`/api/v1/social/posts/${id}`, { method: 'DELETE' })
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  async function handlePublish(id: string) {
    const res  = await fetch(`/api/v1/social/posts/${id}/publish`, { method: 'POST' })
    const json = await res.json()
    if (res.ok) {
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: 'PUBLISHED', publishedAt: new Date().toISOString(), platformPostId: json.platformPostId ?? null } : p))
    } else {
      setPosts((prev) => prev.map((p) => p.id === id ? { ...p, status: 'FAILED', errorMessage: json.message } : p))
    }
  }

  const upcoming  = posts.filter((p) => p.status === 'SCHEDULED' || p.status === 'DRAFT' || p.status === 'FAILED')
  const published = posts.filter((p) => p.status === 'PUBLISHED')

  return (
    <div className="flex bg-app-bg">
      {connectModal === 'picker' && (
        <ConnectPickerModal
          accounts={accounts}
          onClose={() => setConnectModal(null)}
          onSelect={(p) => setConnectModal(p)}
        />
      )}
      {connectModal === 'facebook'  && <ConnectFacebookModal  onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}
      {connectModal === 'threads'   && <ConnectThreadsModal   onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}
      {connectModal === 'linkedin'  && <ConnectLinkedInModal  onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}
      {connectModal === 'x'         && <ConnectXModal         onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}
      {connectModal === 'medium'    && <ConnectMediumModal    onClose={() => setConnectModal(null)} onConnected={(a) => setAccounts(a)} />}

      {/* ── Left: composer ───────────────────────────────────────────── */}
      <div className="w-[400px] flex-shrink-0 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto overflow-x-hidden p-5 border-r border-gray-100 bg-white">
        <div className="space-y-4 pb-4">

          {/* Account selector */}
          <div className="bg-gray-50 rounded-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Post to</p>
              <button
                type="button"
                onClick={() => setConnectModal('picker')}
                className="flex items-center gap-1 text-[10px] text-brand-azure hover:text-brand-navy font-semibold transition-colors"
              >
                <Plus size={11} /> Connect
              </button>
            </div>
            {accounts.length === 0 ? (
              <button
                type="button"
                onClick={() => setConnectModal('picker')}
                className="flex items-center justify-center gap-2 w-full px-3 py-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand-azure hover:text-brand-azure transition-colors text-xs font-medium"
              >
                <Plus size={13} /> Connect a platform
              </button>
            ) : (
              <div className="space-y-1.5">
                {accounts.map((a) => {
                  const Icon = PLATFORM_ICON[a.platform]
                  const sel  = selectedAccts.includes(a.id)
                  return (
                    <div key={a.id} className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => toggleAccount(a.id)}
                        className={cn(
                          'flex-1 flex items-center gap-2.5 px-3 py-2 rounded-lg border-2 text-left transition-all',
                          sel ? 'border-brand-azure bg-brand-azure/5' : 'border-gray-200 hover:border-brand-light',
                        )}
                      >
                        <Icon size={14} className={cn('flex-shrink-0', PLATFORM_COLOR[a.platform])} />
                        <span className={cn('text-xs font-medium flex-1', sel ? 'text-brand-azure' : 'text-gray-700')}>{a.accountName}</span>
                        {sel && <CheckCircle2 size={13} className="text-brand-azure" />}
                      </button>
                      <button
                        type="button"
                        title="Disconnect"
                        onClick={async () => {
                          await fetch(`/api/v1/social/accounts/${a.id}`, { method: 'DELETE' })
                          setAccounts((prev) => prev.filter((x) => x.id !== a.id))
                          setSelectedAccts((prev) => prev.filter((x) => x !== a.id))
                        }}
                        className="p-1.5 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Caption */}
          <div className="bg-gray-50 rounded-card p-4">
            <Textarea
              label="Caption"
              placeholder="Write your post caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={5}
              maxLength={2200}
              currentLength={caption.length}
            />
          </div>

          {/* Image */}
          <div className="bg-gray-50 rounded-card p-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-3">Image <span className="normal-case font-normal text-gray-400">(optional)</span></p>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Paste image URL..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setPickerOpen((v) => !v)}
                className="flex items-center gap-1 px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-600 hover:border-brand-azure hover:text-brand-azure transition-colors"
              >
                <Eye size={12} /> Library
              </button>
            </div>
            {pickerOpen && libraryAssets.length > 0 && (
              <div className="grid grid-cols-4 gap-1.5 mt-2 max-h-36 overflow-y-auto">
                {libraryAssets.map((a) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={a.id}
                    src={a.s3Url}
                    alt=""
                    className={cn('w-full aspect-square object-cover rounded cursor-pointer border-2 transition-all', imageUrl === a.s3Url ? 'border-brand-azure' : 'border-transparent hover:border-brand-azure')}
                    onClick={() => { setImageUrl(a.s3Url); setPickerOpen(false) }}
                  />
                ))}
              </div>
            )}
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="mt-2 w-full h-28 object-cover rounded-lg" onError={() => setImageUrl('')} />
            )}
          </div>

          {/* Schedule time */}
          <div className="bg-gray-50 rounded-card p-4">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest mb-2">Scheduled Time</p>
            <input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent"
            />
          </div>

          {scheduleError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-700">{scheduleError}</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="lg"
              disabled={!caption.trim() || selectedAccts.length === 0 || scheduling}
              loading={scheduling}
              onClick={() => handleSchedule(false)}
            >
              <Calendar size={14} /> Schedule
            </Button>
            <Button
              variant="secondary"
              size="lg"
              disabled={!caption.trim() || selectedAccts.length === 0 || scheduling}
              onClick={() => handleSchedule(true)}
              title="Publish immediately"
            >
              <Send size={14} />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Right: posts & accounts ───────────────────────────────────── */}
      <div className="flex-1 p-6 min-w-0">

        {/* Header: tabs + view toggle */}
        <div className="flex items-center gap-4 mb-5 border-b border-gray-200">
          {/* Upcoming/Published tabs — list view only */}
          {view === 'list' && ([
            { id: 'upcoming',  label: 'Upcoming',  count: upcoming.length },
            { id: 'published', label: 'Published', count: published.length },
          ] as const).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                'pb-3 text-sm font-semibold border-b-2 transition-colors -mb-px',
                tab === t.id ? 'border-brand-azure text-brand-azure' : 'border-transparent text-gray-400 hover:text-gray-600',
              )}
            >
              {t.label}
              {t.count > 0 && (
                <span className={cn('ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full', tab === t.id ? 'bg-brand-azure text-white' : 'bg-gray-100 text-gray-500')}>
                  {t.count}
                </span>
              )}
            </button>
          ))}

          {/* Push right */}
          <div className="ml-auto flex items-center gap-3 pb-3">
            {/* Calendar / List toggle */}
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setView('list')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
                  view === 'list' ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                <LayoutList size={13} /> List
              </button>
              <button
                type="button"
                onClick={() => setView('calendar')}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-colors',
                  view === 'calendar' ? 'bg-white text-brand-navy shadow-sm' : 'text-gray-500 hover:text-gray-700',
                )}
              >
                <CalendarDays size={13} /> Calendar
              </button>
            </div>

            {/* Connected accounts summary */}
            {accounts.map((a) => {
              const Icon = PLATFORM_ICON[a.platform]
              return (
                <div key={a.id} className={cn('flex items-center gap-1 text-[11px] font-medium', PLATFORM_COLOR[a.platform])}>
                  <Icon size={12} /> <span className="text-gray-500">{a.accountName}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Calendar view */}
        {view === 'calendar' && <CalendarView posts={posts} />}

        {/* List view */}
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
              {upcoming.map((p) => (
                <PostCard key={p.id} post={p} onDelete={() => handleDelete(p.id)} onPublish={() => handlePublish(p.id)} />
              ))}
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
              {published.map((p) => (
                <PostCard key={p.id} post={p} onDelete={() => handleDelete(p.id)} onPublish={() => handlePublish(p.id)} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}
