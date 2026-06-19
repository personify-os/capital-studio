'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { GenericIcon } from '../types'
import { ModalShell, ErrorBanner, ModalFooter, refreshAccounts, type ConnectCallback } from './shared'

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
