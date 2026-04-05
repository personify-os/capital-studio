'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  LayoutDashboard, ImageIcon, PenSquare, Layers, Calendar, BookOpen,
  FolderOpen, Film, Mic, Clapperboard, Music, BarChart3, ChevronDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SidebarFlags {
  videoGeneration: boolean
  motionVideo:     boolean
  voiceover:       boolean
  musicGeneration: boolean
  analytics:       boolean
  socialScheduler: boolean
}

interface Props {
  flags?: SidebarFlags
}

interface NavItem {
  href:  string
  icon:  LucideIcon
  label: string
}

interface NavSection {
  id:    string
  label: string
  items: NavItem[]
}

export default function Sidebar({ flags }: Props) {
  const pathname  = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  const toggle = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }))

  const sections: NavSection[] = [
    {
      id:    'main',
      label: 'Main',
      items: [
        { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard'      },
        { href: '/writer',    icon: PenSquare,        label: 'Content Writer' },
      ],
    },
    {
      id:    'create',
      label: 'Create',
      items: [
        { href: '/images',   icon: ImageIcon,   label: 'Image Studio'     },
        { href: '/graphics', icon: Layers,      label: 'Graphics Studio'  },
        ...(flags?.videoGeneration ?? true
          ? [{ href: '/videos', icon: Film, label: 'Video Studio' }] : []),
        ...(flags?.motionVideo ?? true
          ? [{ href: '/motion', icon: Clapperboard, label: 'Motion Studio' }] : []),
        ...(flags?.voiceover ?? true
          ? [{ href: '/audio', icon: Mic, label: 'VoiceOver Studio' }] : []),
        ...(flags?.musicGeneration ?? true
          ? [{ href: '/music', icon: Music, label: 'Music Studio' }] : []),
      ],
    },
    {
      id:    'manage',
      label: 'Manage',
      items: [
        ...(flags?.socialScheduler ?? true
          ? [{ href: '/scheduler', icon: Calendar, label: 'Social Scheduler' }] : []),
        { href: '/brand-vault', icon: BookOpen,   label: 'Brand Vault'      },
        { href: '/library',     icon: FolderOpen, label: 'Content Library'  },
        ...(flags?.analytics ?? true
          ? [{ href: '/analytics', icon: BarChart3, label: 'Analytics' }] : []),
      ],
    },
  ]

  return (
    <aside className="w-[var(--sidebar-width)] flex-shrink-0 h-screen flex flex-col bg-brand-navy sticky top-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logos/capital-studio-icon-sidebar.png" alt="Capital Studio" className="w-full h-full" />
          </div>
          <div className="leading-none">
            <p className="text-white font-semibold text-sm">Capital Studio</p>
            <p className="text-brand-light text-[10px] mt-0.5">by LH Capital</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto scrollbar-hide">
        {sections.map(({ id, label, items }) => {
          const isCollapsed = !!collapsed[id]
          return (
            <div key={id} className={id !== 'main' ? 'mt-2' : ''}>
              {/* Section header — "main" has no label */}
              {id !== 'main' && (
                <button
                  onClick={() => toggle(id)}
                  className="flex items-center justify-between w-full px-3 py-1 mb-0.5 text-[10px] font-semibold text-white/30 uppercase tracking-widest hover:text-white/50 transition-colors"
                >
                  {label}
                  <ChevronDown
                    size={11}
                    className={cn('transition-transform duration-150', isCollapsed && '-rotate-90')}
                  />
                </button>
              )}

              {!isCollapsed && (
                <div className="space-y-0.5">
                  {items.map(({ href, icon: Icon, label: itemLabel }) => {
                    const active = pathname === href || pathname.startsWith(href + '/')
                    return (
                      <Link
                        key={href}
                        href={href}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                          active
                            ? 'bg-brand-azure text-white'
                            : 'text-brand-muted hover:text-white hover:bg-white/10',
                        )}
                      >
                        <Icon size={16} className="flex-shrink-0" />
                        {itemLabel}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
