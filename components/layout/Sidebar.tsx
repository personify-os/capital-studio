'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  ImageIcon,
  PenSquare,
  Layers,
  Calendar,
  BookOpen,
  FolderOpen,
  Film,
  Mic,
  Clapperboard,
  Music,
  BarChart3,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/images',      icon: ImageIcon,        label: 'Image Studio' },
  { href: '/videos',      icon: Film,             label: 'Video Studio' },
  { href: '/motion',      icon: Clapperboard,     label: 'Motion Studio' },
  { href: '/audio',       icon: Mic,              label: 'VoiceOver Studio' },
  { href: '/music',       icon: Music,            label: 'Music Studio' },
  { href: '/graphics',    icon: Layers,           label: 'Graphics Studio' },
  { href: '/writer',      icon: PenSquare,        label: 'Content Writer' },
  { href: '/scheduler',   icon: Calendar,         label: 'Social Scheduler' },
  { href: '/brand-vault', icon: BookOpen,         label: 'Brand Vault' },
  { href: '/library',     icon: FolderOpen,       label: 'Content Library' },
  { href: '/analytics',   icon: BarChart3,         label: 'Analytics' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[var(--sidebar-width)] flex-shrink-0 h-screen flex flex-col bg-[#041740] sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/capital-studio-icon.svg" alt="Capital Studio" className="w-full h-full" />
          </div>
          <div className="leading-none">
            <p className="text-white font-semibold text-sm">Capital Studio</p>
            <p className="text-[#689EB8] text-[10px] mt-0.5">by LH Capital</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-hide">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-azure text-white'
                  : 'text-[#89a8c4] hover:text-white hover:bg-white/10',
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-[#89a8c4] hover:text-white hover:bg-white/10 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
