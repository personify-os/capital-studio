'use client'

import { useState } from 'react'
import { Facebook } from 'lucide-react'
import { PLATFORM_TEXT_COLOR } from '@/lib/platform-colors'
import Button from '@/components/ui/Button'
import { ModalShell, ErrorBanner, ModalFooter, refreshAccounts, type ConnectCallback } from './shared'

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
