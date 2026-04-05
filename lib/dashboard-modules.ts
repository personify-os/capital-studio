import {
  ImageIcon, Film, Mic, Layers, PenSquare, Calendar,
  BookOpen, FolderOpen, Clapperboard, Music, BarChart3,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface ModuleConfig {
  href:        string
  icon:        LucideIcon
  label:       string
  description: string
  gradient:    string
  accent:      string
  badge?:      string
}

export const MODULES: ModuleConfig[] = [
  {
    href:        '/writer',
    icon:        PenSquare,
    label:       'Content Writer',
    description: 'AI captions, emails, and long-form content series',
    gradient:    'from-[#041740] via-[#0a2a60] to-[#041740]',
    accent:      '#89a8c4',
  },
  {
    href:        '/images',
    icon:        ImageIcon,
    label:       'Image Studio',
    description: 'Generate stunning AI images with Flux, Imagen 4, and more',
    gradient:    'from-[#0475ae] via-[#045a8a] to-[#023456]',
    accent:      '#46C3B2',
  },
  {
    href:        '/graphics',
    icon:        Layers,
    label:       'Graphics Studio',
    description: 'Branded social graphics, flyers, and email headers',
    gradient:    'from-[#ed6835] via-[#c44d1a] to-[#7a2d0a]',
    accent:      '#fbbf80',
  },
  {
    href:        '/videos',
    icon:        Film,
    label:       'Video Studio',
    description: 'Generate cinematic AI videos with Kling, Veo, and MiniMax',
    gradient:    'from-[#1a1a2e] via-[#16213e] to-[#0f3460]',
    accent:      '#689EB8',
  },
  {
    href:        '/motion',
    icon:        Clapperboard,
    label:       'Motion Studio',
    description: 'Animate any image with Kling AI — add cinematic motion to stills',
    gradient:    'from-[#2d1b69] via-[#1a0a3e] to-[#0d0020]',
    accent:      '#a78bfa',
    badge:       'New',
  },
  {
    href:        '/audio',
    icon:        Mic,
    label:       'VoiceOver Studio',
    description: 'Professional AI voiceovers with ElevenLabs',
    gradient:    'from-[#00c4cc] via-[#007b80] to-[#003d40]',
    accent:      '#DAF2EF',
  },
  {
    href:        '/music',
    icon:        Music,
    label:       'Music Studio',
    description: 'Generate background music for videos with Suno AI',
    gradient:    'from-[#7c3aed] via-[#5b21b6] to-[#3b0764]',
    accent:      '#c4b5fd',
    badge:       'New',
  },
  {
    href:        '/scheduler',
    icon:        Calendar,
    label:       'Social Scheduler',
    description: 'Schedule and publish to 9 platforms from one place',
    gradient:    'from-[#005851] via-[#007a70] to-[#003d3a]',
    accent:      '#46C3B2',
  },
  {
    href:        '/brand-vault',
    icon:        BookOpen,
    label:       'Brand Vault',
    description: 'Brand assets, guidelines, logos, and knowledge base',
    gradient:    'from-[#1e3a5f] via-[#2a4f80] to-[#1a2d4a]',
    accent:      '#93c5fd',
  },
  {
    href:        '/library',
    icon:        FolderOpen,
    label:       'Content Library',
    description: 'All your generated images, videos, audio, and graphics',
    gradient:    'from-[#374151] via-[#4b5563] to-[#1f2937]',
    accent:      '#d1d5db',
  },
  {
    href:        '/analytics',
    icon:        BarChart3,
    label:       'Analytics',
    description: 'Track content created by module, model, count, and cost',
    gradient:    'from-[#0f4c75] via-[#1b262c] to-[#0a1628]',
    accent:      '#60a5fa',
  },
]
