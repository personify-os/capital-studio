'use client'

import { useState, useRef, useEffect } from 'react'
import { signOut } from 'next-auth/react'
import { LogOut, ChevronDown } from 'lucide-react'

interface Props {
  name:  string
  email: string
}

export default function TopbarUserMenu({ name, email }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Account menu"
      >
        {/* LHC icon */}
        <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logos/capital-studio-icon-sidebar.png" alt="Capital Studio" className="w-full h-full" />
        </div>
        <span className="text-sm text-gray-700 font-medium hidden sm:block max-w-[140px] truncate">
          {name || email}
        </span>
        <ChevronDown
          size={13}
          className={`text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-50">
          <div className="px-3 py-2.5 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-800 truncate">{name || 'LH Capital'}</p>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">{email}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
