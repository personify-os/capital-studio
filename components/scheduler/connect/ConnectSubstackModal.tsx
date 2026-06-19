'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import { GenericIcon } from '../types'
import { ModalShell, ErrorBanner, ModalFooter, refreshAccounts, type ConnectCallback } from './shared'

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
