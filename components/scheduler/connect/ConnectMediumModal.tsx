'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { GenericIcon } from '../types'
import { ModalShell, ErrorBanner, ModalFooter, refreshAccounts, type ConnectCallback } from './shared'

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
