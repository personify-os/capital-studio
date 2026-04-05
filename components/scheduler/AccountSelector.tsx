'use client'

import { Plus, CheckCircle2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  type SocialAccount, type ConnectModalId,
  PLATFORM_ICON, PLATFORM_COLOR, PLATFORM_META,
  tokenStatus, reconnectPlatform,
} from '@/components/scheduler/types'

interface Props {
  accounts:       SocialAccount[]
  selectedAccts:  string[]
  onToggle:       (id: string) => void
  onOpenModal:    (modal: ConnectModalId) => void
  onDisconnect:   (id: string) => Promise<void>
}

export default function AccountSelector({ accounts, selectedAccts, onToggle, onOpenModal, onDisconnect }: Props) {
  return (
    <div className="bg-gray-50 rounded-card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-widest">Post to</p>
        <button type="button" onClick={() => onOpenModal('picker')}
          className="flex items-center gap-1 text-[10px] text-brand-azure hover:text-brand-navy font-semibold transition-colors">
          <Plus size={11} /> Connect
        </button>
      </div>

      {accounts.length === 0 ? (
        <button type="button" onClick={() => onOpenModal('picker')}
          className="flex items-center justify-center gap-2 w-full px-3 py-4 rounded-lg border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand-azure hover:text-brand-azure transition-colors text-xs font-medium">
          <Plus size={13} /> Connect a platform
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-1.5">
          {accounts.filter((a) => a.platform !== 'INSTAGRAM').map((a) => {
            const Icon          = PLATFORM_ICON[a.platform]
            const sel           = selectedAccts.includes(a.id)
            const platformLabel = PLATFORM_META.find((p) => p.platform === a.platform)?.label ?? a.platform
            const expiry        = tokenStatus(a.expiresAt)
            const reconnectTo   = reconnectPlatform(a.platform)

            if (expiry === 'expired' && reconnectTo) {
              return (
                <div key={a.id} className="group relative">
                  <div className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-red-200 bg-red-50">
                    <Icon size={12} className="flex-shrink-0 text-red-400" />
                    <div className="text-left min-w-0 flex-1">
                      <div className="text-[11px] font-semibold leading-none text-red-600 truncate">{a.accountName}</div>
                      <button type="button"
                        onClick={() => {
                          if (reconnectTo === 'oauth-tiktok')       { window.location.href = '/api/v1/social/connect/tiktok'  }
                          else if (reconnectTo === 'oauth-youtube') { window.location.href = '/api/v1/social/connect/youtube' }
                          else if (reconnectTo)                     { onOpenModal(reconnectTo) }
                        }}
                        className="text-[9px] font-semibold text-red-500 hover:text-red-700 underline leading-none mt-0.5 block">
                        Reconnect
                      </button>
                    </div>
                  </div>
                  <button type="button" title="Disconnect" onClick={() => onDisconnect(a.id)}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400">
                    <X size={10} />
                  </button>
                </div>
              )
            }

            return (
              <div key={a.id} className="group relative">
                <button type="button" onClick={() => onToggle(a.id)}
                  className={cn(
                    'w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition-all',
                    sel ? 'border-brand-azure bg-brand-azure/10'
                      : expiry === 'soon' ? 'border-amber-300 bg-amber-50 hover:border-amber-400'
                      : 'border-gray-200 bg-white hover:border-brand-light',
                  )}>
                  <Icon size={12} className={cn('flex-shrink-0', sel ? 'text-brand-azure' : PLATFORM_COLOR[a.platform])} />
                  <div className="text-left min-w-0 flex-1">
                    <div className={cn('text-[11px] font-semibold leading-none truncate', sel ? 'text-brand-azure' : 'text-gray-800')}>{a.accountName}</div>
                    <div className={cn('text-[9px] leading-none mt-0.5', expiry === 'soon' ? 'text-amber-500' : 'text-gray-400')}>
                      {expiry === 'soon' ? (
                        <>
                          Expiring soon ·{' '}
                          {reconnectTo && (
                            <button type="button"
                              onClick={(e) => { e.stopPropagation()
                                if (reconnectTo === 'oauth-tiktok')       window.location.href = '/api/v1/social/connect/tiktok'
                                else if (reconnectTo === 'oauth-youtube') window.location.href = '/api/v1/social/connect/youtube'
                                else if (reconnectTo)                     onOpenModal(reconnectTo)
                              }}
                              className="underline font-semibold text-amber-600 hover:text-amber-700">
                              Reconnect
                            </button>
                          )}
                        </>
                      ) : platformLabel}
                    </div>
                  </div>
                  {sel && <CheckCircle2 size={10} className="text-brand-azure ml-0.5 flex-shrink-0" />}
                </button>
                <button type="button" title="Disconnect" onClick={() => onDisconnect(a.id)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400">
                  <X size={10} />
                </button>
              </div>
            )
          })}
          {accounts.some((a) => a.platform === 'INSTAGRAM') && (
            <p className="text-[9px] text-gray-400 mt-1.5 px-0.5">
              Instagram is posted automatically when you select its linked Facebook page.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
