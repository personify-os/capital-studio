'use client'

import { useState } from 'react'
import { Facebook, AlertCircle, X, Plus, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PLATFORM_TEXT_COLOR } from '@/lib/platform-colors'
import Button from '@/components/ui/Button'
import {
  Platform, SocialAccount,
  PLATFORM_ICON, PLATFORM_COLOR, PLATFORM_META, GenericIcon,
} from './types'

type ConnectCallback = (accts: SocialAccount[]) => void

// ─── Shared ────────────────────────────────────────────────────────────────────

function ModalShell({ title, icon, onClose, children }: {
  title:    string
  icon?:    React.ReactNode
  onClose:  () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md bg-white rounded-card shadow-card-hover overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            {icon}
            <p className="font-semibold text-brand-navy text-sm">{title}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-red-700">{message}</p>
    </div>
  )
}

function ModalFooter({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
      <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        Cancel
      </button>
      {children}
    </div>
  )
}

async function refreshAccounts(): Promise<SocialAccount[]> {
  const res = await fetch('/api/v1/social/accounts')
  const j   = await res.json()
  return j.accounts
}

// ─── Threads ───────────────────────────────────────────────────────────────────

export function ConnectThreadsModal({ onClose, onConnected }: { onClose: () => void; onConnected: ConnectCallback }) {
  const [token,   setToken]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleConnect() {
    if (!token.trim()) return
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/v1/social/connect/threads', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message ?? 'Connection failed'); return }
      onConnected(await refreshAccounts()); onClose()
    } catch { setError('Network error. Please try again.') }
    finally   { setLoading(false) }
  }

  const ThreadsIcon = PLATFORM_ICON['THREADS']
  return (
    <ModalShell title="Connect Threads" icon={<ThreadsIcon size={16} className="text-black" />} onClose={onClose}>
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
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="THQWJRxxxxxxxxxxxxxxxx..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
        </div>
        {error && <ErrorBanner message={error} />}
      </div>
      <ModalFooter onClose={onClose}>
        <Button size="sm" loading={loading} disabled={!token.trim()} onClick={handleConnect}>Connect</Button>
      </ModalFooter>
    </ModalShell>
  )
}

// ─── Facebook ──────────────────────────────────────────────────────────────────

export function ConnectFacebookModal({ onClose, onConnected }: { onClose: () => void; onConnected: ConnectCallback }) {
  const [token,   setToken]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleConnect() {
    if (!token.trim()) return
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/v1/social/connect/facebook', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userToken: token.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message ?? 'Connection failed'); return }
      onConnected(await refreshAccounts()); onClose()
    } catch { setError('Network error. Please try again.') }
    finally   { setLoading(false) }
  }

  return (
    <ModalShell title="Connect Facebook & Instagram" icon={<Facebook size={16} className={PLATFORM_TEXT_COLOR.FACEBOOK} />} onClose={onClose}>
      <div className="p-5 space-y-4">
        <div className="bg-blue-50 rounded-lg p-3.5 text-xs text-blue-800 space-y-1.5">
          <p className="font-semibold">How to get your access token:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Go to <span className="font-mono">developers.facebook.com</span> → Your App → Tools</li>
            <li>Under &quot;Select Token Permissions&quot;, enable <span className="font-mono">pages_manage_posts</span>, <span className="font-mono">pages_read_engagement</span>, and <span className="font-mono">instagram_basic</span></li>
            <li>Click &quot;Get Token&quot; and paste it below</li>
          </ol>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">User Access Token</label>
          <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="EAAxxxxxxxxxxxxxxxx..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
        </div>
        {error && <ErrorBanner message={error} />}
      </div>
      <ModalFooter onClose={onClose}>
        <Button size="sm" loading={loading} disabled={!token.trim()} onClick={handleConnect}>Connect Pages</Button>
      </ModalFooter>
    </ModalShell>
  )
}

// ─── Bluesky ───────────────────────────────────────────────────────────────────

export function ConnectBlueskyModal({ onClose, onConnected }: { onClose: () => void; onConnected: ConnectCallback }) {
  const [handle,      setHandle]      = useState('')
  const [appPassword, setAppPassword] = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')

  async function handleConnect() {
    if (!handle.trim() || !appPassword.trim()) return
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/v1/social/connect/bluesky', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: handle.trim(), appPassword: appPassword.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message ?? 'Connection failed'); return }
      onConnected(await refreshAccounts()); onClose()
    } catch { setError('Network error. Please try again.') }
    finally   { setLoading(false) }
  }

  return (
    <ModalShell title="Connect Bluesky" icon={<GenericIcon size={16} className="text-sky-500" />} onClose={onClose}>
      <div className="p-5 space-y-4">
        <div className="bg-gray-50 rounded-lg p-3.5 text-xs text-gray-700 space-y-1.5">
          <p className="font-semibold">How to create a Bluesky App Password:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-600">
            <li>Go to <span className="font-mono text-[11px]">bsky.app</span> → Settings → Privacy and Security</li>
            <li>Click <strong>App Passwords</strong> → <strong>Add App Password</strong></li>
            <li>Name it &quot;Capital Studio&quot; and copy the generated password</li>
            <li>Paste it below — never use your main account password</li>
          </ol>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Bluesky Handle</label>
          <input type="text" value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="yourname.bsky.social"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">App Password</label>
          <input type="password" value={appPassword} onChange={(e) => setAppPassword(e.target.value)} placeholder="xxxx-xxxx-xxxx-xxxx"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
        </div>
        {error && <ErrorBanner message={error} />}
      </div>
      <ModalFooter onClose={onClose}>
        <Button size="sm" loading={loading} disabled={!handle.trim() || !appPassword.trim()} onClick={handleConnect}>Connect Bluesky</Button>
      </ModalFooter>
    </ModalShell>
  )
}

// ─── Substack ──────────────────────────────────────────────────────────────────

export function ConnectSubstackModal({ onClose, onConnected }: { onClose: () => void; onConnected: ConnectCallback }) {
  const [subdomain, setSubdomain] = useState('')
  const [cookie,    setCookie]    = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  async function handleConnect() {
    if (!subdomain.trim() || !cookie.trim()) return
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/v1/social/connect/substack', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subdomain: subdomain.trim(), cookie: cookie.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message ?? 'Connection failed'); return }
      onConnected(await refreshAccounts()); onClose()
    } catch { setError('Network error. Please try again.') }
    finally   { setLoading(false) }
  }

  return (
    <ModalShell title="Connect Substack" icon={<GenericIcon size={16} className="text-brand-orange" />} onClose={onClose}>
      <div className="p-5 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <strong>Note:</strong> This uses your Substack session. You&apos;ll need to reconnect if you log out of Substack.
        </div>
        <div className="bg-gray-50 rounded-lg p-3.5 text-xs text-gray-700 space-y-1.5">
          <p className="font-semibold">How to get your session cookie:</p>
          <ol className="list-decimal list-inside space-y-1 text-gray-600">
            <li>Open <span className="font-mono text-[11px]">substack.com</span> in Chrome while logged in</li>
            <li>Press <strong>F12</strong> → Application tab → Cookies → <span className="font-mono text-[11px]">https://substack.com</span></li>
            <li>Find <strong>substack.sid</strong> and copy its value</li>
            <li>Paste below along with your publication subdomain</li>
          </ol>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Publication URL</label>
          <input type="text" value={subdomain} onChange={(e) => setSubdomain(e.target.value)} placeholder="lhccapital.substack.com or lhccapital"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">substack.sid Cookie Value</label>
          <input type="password" value={cookie} onChange={(e) => setCookie(e.target.value)} placeholder="s%3A..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
        </div>
        {error && <ErrorBanner message={error} />}
      </div>
      <ModalFooter onClose={onClose}>
        <Button size="sm" loading={loading} disabled={!subdomain.trim() || !cookie.trim()} onClick={handleConnect}>Connect Substack</Button>
      </ModalFooter>
    </ModalShell>
  )
}

// ─── Medium ────────────────────────────────────────────────────────────────────

export function ConnectMediumModal({ onClose, onConnected }: { onClose: () => void; onConnected: ConnectCallback }) {
  const [uid,     setUid]     = useState('')
  const [sid,     setSid]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleConnect() {
    if (!uid.trim() || !sid.trim()) return
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/v1/social/connect/medium', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: uid.trim(), sid: sid.trim() }),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message ?? 'Connection failed'); return }
      onConnected(await refreshAccounts()); onClose()
    } catch { setError('Network error. Please try again.') }
    finally   { setLoading(false) }
  }

  return (
    <ModalShell title="Connect Medium" icon={<GenericIcon size={16} className="text-black" />} onClose={onClose}>
      <div className="p-5 space-y-4">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-800 space-y-1.5">
          <p className="font-semibold">How to get your Medium cookies:</p>
          <ol className="list-decimal list-inside space-y-1 text-amber-700">
            <li>Log in to <span className="font-mono text-[11px]">medium.com</span> in Chrome</li>
            <li>Press <strong>F12</strong> → <strong>Application</strong> tab → <strong>Cookies</strong> → <strong>https://medium.com</strong></li>
            <li>Find <strong>uid</strong> (your numeric user ID) and copy its value</li>
            <li>Find <strong>sid</strong> (your session token) and copy its value</li>
          </ol>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">uid cookie</label>
            <input type="text" value={uid} onChange={(e) => setUid(e.target.value)} placeholder="123456789"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">sid cookie</label>
            <input type="password" value={sid} onChange={(e) => setSid(e.target.value)} placeholder="1:abc123..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure focus:border-transparent" />
          </div>
        </div>
        {error && <ErrorBanner message={error} />}
      </div>
      <ModalFooter onClose={onClose}>
        <Button size="sm" loading={loading} disabled={!uid.trim() || !sid.trim()} onClick={handleConnect}>Connect Medium</Button>
      </ModalFooter>
    </ModalShell>
  )
}

// ─── LinkedIn ──────────────────────────────────────────────────────────────────

export function ConnectLinkedInModal({ onClose, onConnected }: { onClose: () => void; onConnected: ConnectCallback }) {
  const [token,    setToken]    = useState('')
  const [personId, setPersonId] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function fetchPersonId() {
    if (!token.trim()) return
    setFetching(true); setError(null)
    const res  = await fetch('/api/v1/social/connect/linkedin/inspect', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: token.trim() }),
    })
    const json = await res.json()
    setFetching(false)
    if (!res.ok) { setError(json.message ?? 'Could not fetch person ID'); return }
    setPersonId(json.personId)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError(null)
    const res  = await fetch('/api/v1/social/connect/linkedin', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: token.trim(), personId: personId.trim() }),
    })
    const json = await res.json()
    if (!res.ok) { setError(json.message ?? 'Failed'); setLoading(false); return }
    onConnected(await refreshAccounts()); onClose()
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
            <p className="font-semibold">How to connect LinkedIn:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-blue-600">
              <li>Go to <span className="font-medium">LinkedIn Developer Portal</span> → your app → Auth</li>
              <li>Open <span className="font-medium">OAuth 2.0 Tools</span> → generate token with <span className="font-medium">w_member_social</span></li>
              <li>Copy and paste the token below</li>
              <li>Click <span className="font-medium">Fetch automatically</span> to fill in your Person ID</li>
            </ol>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Access Token</label>
            <textarea rows={3} value={token} onChange={(e) => setToken(e.target.value)} placeholder="AQV..."
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure resize-none" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide">Person ID</label>
              <button type="button" onClick={fetchPersonId} disabled={!token.trim() || fetching}
                className="text-[10px] font-medium text-brand-azure hover:underline disabled:opacity-40">
                {fetching ? 'Fetching…' : 'Fetch automatically →'}
              </button>
            </div>
            <input type="text" value={personId} onChange={(e) => setPersonId(e.target.value)}
              placeholder="Click 'Fetch automatically' or paste manually"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-brand-azure" />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading || !token.trim() || !personId.trim()}
            className="w-full py-2.5 bg-brand-azure hover:bg-brand-navy disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors">
            {loading ? 'Connecting…' : 'Connect LinkedIn'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── X (Twitter) ──────────────────────────────────────────────────────────────

export function ConnectXModal({ onClose, onConnected }: { onClose: () => void; onConnected: ConnectCallback }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  async function handleConnect() {
    setLoading(true); setError(null)
    const res  = await fetch('/api/v1/social/connect/x', { method: 'POST' })
    const json = await res.json()
    if (!res.ok) { setError(json.message ?? 'Failed'); setLoading(false); return }
    onConnected(await refreshAccounts()); onClose()
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
          <button type="button" onClick={handleConnect} disabled={loading}
            className="w-full py-2.5 bg-gray-900 hover:bg-black disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors">
            {loading ? 'Connecting…' : 'Connect X'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Platform Picker ───────────────────────────────────────────────────────────

export function ConnectPickerModal({ accounts, onClose, onSelect }: {
  accounts: SocialAccount[]
  onClose:  () => void
  onSelect: (platform: 'facebook' | 'threads' | 'linkedin' | 'x' | 'medium' | 'substack' | 'bluesky') => void
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
            if (platform === 'INSTAGRAM') return null

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
                  if (platform === 'MEDIUM')    { onClose(); onSelect('medium')    }
                  if (platform === 'SUBSTACK')  { onClose(); onSelect('substack')  }
                  if (platform === 'BLUESKY')   { onClose(); onSelect('bluesky')   }
                  if (platform === 'YOUTUBE')   { window.location.href = '/api/v1/social/connect/youtube' }
                  if (platform === 'TIKTOK')    { window.location.href = '/api/v1/social/connect/tiktok'  }
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

