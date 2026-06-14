import { cn } from '@/lib/utils'
import { CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react'

export interface ScheduledPostSummary {
  status:       string         // DRAFT | SCHEDULED | PROCESSING | PUBLISHED | FAILED
  platform:     string         // FACEBOOK | INSTAGRAM | ...
  scheduledFor: string         // ISO
  publishedAt:  string | null  // ISO
}

export interface Asset {
  id:             string
  type:           string
  brandId:        string | null
  s3Url:          string | null
  htmlContent:    string | null
  metadata:       unknown
  createdAt:      string
  scheduledPosts?: ScheduledPostSummary[]
}

const PLATFORM_LABEL: Record<string, string> = {
  FACEBOOK: 'Facebook', INSTAGRAM: 'Instagram', THREADS: 'Threads', LINKEDIN: 'LinkedIn',
  X: 'X', MEDIUM: 'Medium', SUBSTACK: 'Substack', BLUESKY: 'Bluesky', YOUTUBE: 'YouTube', TIKTOK: 'TikTok',
}

function platformLabel(p: string): string {
  return PLATFORM_LABEL[p] ?? p.charAt(0) + p.slice(1).toLowerCase()
}

function formatPostDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

// Pick the dominant status for a compact summary: a published post wins, then
// scheduled, then failed/processing, then draft.
const STATUS_RANK: Record<string, number> = { PUBLISHED: 5, SCHEDULED: 4, FAILED: 3, PROCESSING: 2, DRAFT: 1 }

type StatusVisual = { label: string; cls: string; icon: typeof CheckCircle2 }
const STATUS_VISUAL: Record<string, StatusVisual> = {
  PUBLISHED:  { label: 'Posted',     cls: 'bg-green-50 text-green-700 border-green-200',     icon: CheckCircle2 },
  SCHEDULED:  { label: 'Scheduled',  cls: 'bg-brand-azure/10 text-brand-azure border-brand-azure/20', icon: Clock },
  PROCESSING: { label: 'Posting…',   cls: 'bg-amber-50 text-amber-700 border-amber-200',     icon: Loader2 },
  FAILED:     { label: 'Failed',     cls: 'bg-red-50 text-red-600 border-red-200',           icon: AlertCircle },
  DRAFT:      { label: 'Draft',      cls: 'bg-gray-100 text-gray-500 border-gray-200',       icon: Clock },
}

function dominant(posts: ScheduledPostSummary[]): ScheduledPostSummary | null {
  if (!posts.length) return null
  return [...posts].sort((a, b) => (STATUS_RANK[b.status] ?? 0) - (STATUS_RANK[a.status] ?? 0))[0]
}

/** Compact single chip summarising an asset's posting status (for grid cards). */
export function PostStatusBadge({ posts, className }: { posts?: ScheduledPostSummary[]; className?: string }) {
  const top = dominant(posts ?? [])
  if (!top) return null
  const v = STATUS_VISUAL[top.status] ?? STATUS_VISUAL.DRAFT
  const Icon = v.icon
  const count = (posts ?? []).length
  return (
    <span
      title={(posts ?? []).map((p) => `${STATUS_VISUAL[p.status]?.label ?? p.status} · ${platformLabel(p.platform)} · ${formatPostDate(p.publishedAt ?? p.scheduledFor)}`).join('\n')}
      className={cn('inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border', v.cls, className)}
    >
      <Icon size={9} className={top.status === 'PROCESSING' ? 'animate-spin' : ''} />
      {v.label}{count > 1 ? ` ·${count}` : ''}
    </span>
  )
}

/** Detailed per-post lines (platform · status · date) for list rows. */
export function PostStatusList({ posts, className }: { posts?: ScheduledPostSummary[]; className?: string }) {
  if (!posts?.length) return null
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {posts.map((p, i) => {
        const v = STATUS_VISUAL[p.status] ?? STATUS_VISUAL.DRAFT
        const Icon = v.icon
        const when = p.status === 'PUBLISHED' ? (p.publishedAt ?? p.scheduledFor) : p.scheduledFor
        return (
          <span key={i} className={cn('inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full border', v.cls)}>
            <Icon size={9} className={p.status === 'PROCESSING' ? 'animate-spin' : ''} />
            {v.label} · {platformLabel(p.platform)} · {formatPostDate(when)}
          </span>
        )
      })}
    </div>
  )
}

export const BRAND_DOT: Record<string, string> = {
  lhcapital: 'bg-brand-azure',
  simrp:     'bg-brand-light',
  espa:      'bg-brand-emerald',
  personal:  'bg-brand-green',
}

export function getAssetBrand(asset: Asset): string | null {
  if (asset.brandId) return asset.brandId
  return (asset.metadata as Record<string, unknown> | null)?.brandId as string | null ?? null
}

export function BrandDot({ asset }: { asset: Asset }) {
  const brandId = getAssetBrand(asset)
  if (!brandId || !BRAND_DOT[brandId]) return null
  return <span className={cn('absolute top-1.5 left-1.5 w-2 h-2 rounded-full z-20 ring-1 ring-white', BRAND_DOT[brandId])} />
}
