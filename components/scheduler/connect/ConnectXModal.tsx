'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { refreshAccounts, type ConnectCallback } from './shared'

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
