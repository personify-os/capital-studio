'use client'

import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  SocialAccount,
  PLATFORM_ICON, PLATFORM_COLOR, PLATFORM_META,
} from '../types'

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
