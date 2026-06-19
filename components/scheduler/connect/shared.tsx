'use client'

import { AlertCircle, X } from 'lucide-react'
import type { SocialAccount } from '../types'

export type ConnectCallback = (accts: SocialAccount[]) => void

export function ModalShell({ title, icon, onClose, children }: {
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

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
      <AlertCircle size={13} className="text-red-500 mt-0.5 flex-shrink-0" />
      <p className="text-xs text-red-700">{message}</p>
    </div>
  )
}

export function ModalFooter({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100">
      <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
        Cancel
      </button>
      {children}
    </div>
  )
}

export async function refreshAccounts(): Promise<SocialAccount[]> {
  const res = await fetch('/api/v1/social/accounts')
  const j   = await res.json()
  return j.accounts
}
