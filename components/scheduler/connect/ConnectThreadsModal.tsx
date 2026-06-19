'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { PLATFORM_ICON } from '../types'
import { ModalShell, ErrorBanner, ModalFooter, refreshAccounts, type ConnectCallback } from './shared'

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
