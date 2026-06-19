'use client'

import { useState } from 'react'
import { X } from 'lucide-react'
import { refreshAccounts, type ConnectCallback } from './shared'

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
