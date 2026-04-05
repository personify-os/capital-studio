import { Facebook, Instagram, CheckCircle2, XCircle, Clock } from 'lucide-react'
import { PLATFORM_TEXT_COLOR } from '@/lib/platform-colors'

// ─── Types ────────────────────────────────────────────────────────────────────

export type Platform      = 'FACEBOOK' | 'INSTAGRAM' | 'X' | 'LINKEDIN' | 'YOUTUBE' | 'TIKTOK' | 'THREADS' | 'SUBSTACK' | 'MEDIUM' | 'BLUESKY'
export type PostStatus    = 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'PUBLISHED' | 'FAILED'
export type ConnectModalId = 'picker' | 'facebook' | 'threads' | 'linkedin' | 'x' | 'medium' | 'substack' | 'bluesky'

export interface SocialAccount {
  id: string; platform: Platform; accountName: string; accountId: string
  createdAt: string; expiresAt: string | null
}
export interface ScheduledPost {
  id: string; caption: string | null; imageUrl: string | null; assetId: string | null
  scheduledFor: string; status: PostStatus; publishedAt: string | null
  createdAt: string; errorMessage: string | null; platformPostId: string | null
  socialAccount: { id: string; platform: Platform; accountName: string }
}
export interface LibraryAsset { id: string; type: string; s3Url: string; metadata: unknown }
export interface Props {
  initialAccounts: SocialAccount[]
  initialPosts:    ScheduledPost[]
  libraryAssets:   LibraryAsset[]
}

// ─── Icon helpers ─────────────────────────────────────────────────────────────

export function svgIcon(path: string) {
  return function SvgIcon({ size = 16, className }: { size?: number; className?: string }) {
    return (
      <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} className={className}>
        <path d={path} />
      </svg>
    )
  }
}

export const GenericIcon = ({ size = 16, className }: { size?: number; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width={size} height={size} className={className}>
    <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
  </svg>
)

// ─── Constants ────────────────────────────────────────────────────────────────

export const PLATFORM_ICON: Record<Platform, React.ElementType> = {
  FACEBOOK:  Facebook,
  INSTAGRAM: Instagram,
  X:         svgIcon('M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.402 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.261 5.635zm-1.161 17.52h1.833L7.084 4.126H5.117z'),
  LINKEDIN:  svgIcon('M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z'),
  YOUTUBE:   svgIcon('M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z'),
  TIKTOK:    svgIcon('M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z'),
  THREADS:   svgIcon('M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.378-.887h-.018c-.852 0-1.676.228-2.101.592L7.47 8.802c.853-.439 1.895-.6h.017c1.474.008 2.714.473 3.597 1.343 1.09 1.075 1.535 2.6 1.517 4.8-.016 1.73-.485 3.118-1.393 4.12-1.01 1.115-2.535 1.705-4.567 1.756-2.055-.055-3.676-.67-4.807-1.825C.34 17.843-.037 15.83 0 13.355v-.034c-.037-2.474.34-4.486 1.433-5.631C2.56 6.527 4.18 5.91 6.235 5.855 8.26 5.91 9.77 6.487 10.79 7.575c1.107 1.182 1.59 2.852 1.561 5.077v.053l-.003.015c.04 1.665-.358 2.933-1.183 3.771-.812.824-1.976 1.233-3.46 1.233h-.013c-.896-.002-1.697-.166-2.397-.487a2.6 2.6 0 0 1-1.437-1.437c-.322-.7-.486-1.503-.487-2.4v-.013c0-1.454.399-2.61 1.187-3.436.8-.84 1.977-1.274 3.504-1.274h.01a5.51 5.51 0 0 1 1.85.285v-.017c-.146-1.267-.607-2.14-1.387-2.617-.623-.388-1.451-.584-2.474-.584-1.55 0-2.695.469-3.404 1.393C2.6 8.595 2.24 9.778 2.21 11.195c.03 2.893.66 5.025 1.875 6.34 1.099 1.19 2.748 1.802 4.906 1.818 1.73-.016 3.055-.49 3.933-1.408.904-.944 1.36-2.346 1.357-4.167.003-1.813-.44-3.188-1.319-4.085-.913-.935-2.265-1.413-4.014-1.428z'),
  SUBSTACK:  GenericIcon,
  MEDIUM:    GenericIcon,
  BLUESKY:   svgIcon('M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z'),
}

export const PLATFORM_COLOR: Record<Platform, string> = PLATFORM_TEXT_COLOR as Record<Platform, string>

export const STATUS_CONFIG: Record<PostStatus, { label: string; icon: React.ElementType; color: string }> = {
  DRAFT:      { label: 'Draft',      icon: Clock,        color: 'text-gray-400 bg-gray-50 border-gray-200' },
  SCHEDULED:  { label: 'Scheduled',  icon: Clock,        color: 'text-brand-azure bg-brand-azure/5 border-brand-azure/20' },
  PROCESSING: { label: 'Publishing', icon: Clock,        color: 'text-amber-600 bg-amber-50 border-amber-200' },
  PUBLISHED:  { label: 'Published',  icon: CheckCircle2, color: 'text-green-600 bg-green-50 border-green-200' },
  FAILED:     { label: 'Failed',     icon: XCircle,      color: 'text-red-600 bg-red-50 border-red-200' },
}

export const PLATFORM_META: { platform: Platform; label: string; live: boolean }[] = [
  { platform: 'FACEBOOK',  label: 'Facebook & Instagram', live: true },
  { platform: 'THREADS',   label: 'Threads',              live: true },
  { platform: 'LINKEDIN',  label: 'LinkedIn',             live: true },
  { platform: 'X',         label: 'X (Twitter)',          live: true },
  { platform: 'INSTAGRAM', label: 'Instagram',            live: false },
  { platform: 'YOUTUBE',   label: 'YouTube',              live: true },
  { platform: 'TIKTOK',    label: 'TikTok',               live: true },
  { platform: 'SUBSTACK',  label: 'Substack',             live: true },
  { platform: 'MEDIUM',    label: 'Medium',               live: true },
  { platform: 'BLUESKY',   label: 'Bluesky',              live: true },
]

// ─── Token expiry helpers ─────────────────────────────────────────────────────

export function tokenStatus(expiresAt: string | null): 'ok' | 'soon' | 'expired' {
  if (!expiresAt) return 'ok'
  const ms = new Date(expiresAt).getTime() - Date.now()
  if (ms <= 0)                        return 'expired'
  if (ms <= 7 * 24 * 60 * 60 * 1000) return 'soon'
  return 'ok'
}

export function reconnectPlatform(platform: Platform): 'facebook' | 'threads' | 'linkedin' | 'oauth-tiktok' | 'oauth-youtube' | null {
  if (platform === 'FACEBOOK' || platform === 'INSTAGRAM') return 'facebook'
  if (platform === 'THREADS')  return 'threads'
  if (platform === 'LINKEDIN') return 'linkedin'
  if (platform === 'TIKTOK')   return 'oauth-tiktok'
  if (platform === 'YOUTUBE')  return 'oauth-youtube'
  return null
}
