export type ContentType    = 'caption' | 'series'
export type ContentPillar = 'awareness' | 'education' | 'case-study' | 'compliance' | 'promotional'
export type Platform    = 'instagram' | 'facebook' | 'linkedin' | 'x' | 'youtube' | 'tiktok' | 'threads' | 'substack' | 'medium' | 'bluesky'
export type Tone        = 'professional' | 'casual' | 'inspirational' | 'educational'
export type SeriesCount = 3 | 5 | 10

export interface CaptionResult   { body: string; hashtags: string[]; altText?: string }
export interface CaptionResponse { result?: CaptionResult; results?: CaptionResult[] }
export interface PlatformResult  { platform: Platform; results: CaptionResult[] }

export const PLATFORM_CHAR_LIMIT: Record<Platform, number> = {
  instagram: 2200,
  facebook:  0,
  linkedin:  3000,
  x:         280,
  youtube:   5000,
  tiktok:    2200,
  threads:   500,
  substack:  0,
  medium:    0,
  bluesky:   300,
}

export const PLATFORMS: { value: Platform; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'linkedin',  label: 'LinkedIn' },
  { value: 'facebook',  label: 'Facebook' },
  { value: 'x',         label: 'X (Twitter)' },
  { value: 'youtube',   label: 'YouTube' },
  { value: 'tiktok',    label: 'TikTok' },
  { value: 'threads',   label: 'Threads' },
  { value: 'substack',  label: 'Substack' },
  { value: 'medium',    label: 'Medium' },
  { value: 'bluesky',   label: 'Bluesky' },
]

export const PLATFORM_LABEL = Object.fromEntries(
  PLATFORMS.map((p) => [p.value, p.label])
) as Record<Platform, string>

export const TONES: { value: Tone; label: string }[] = [
  { value: 'professional',  label: 'Professional' },
  { value: 'educational',   label: 'Educational' },
  { value: 'inspirational', label: 'Inspirational' },
  { value: 'casual',        label: 'Casual' },
]

export const CONTENT_PILLARS: { value: ContentPillar; label: string; description: string }[] = [
  {
    value:       'awareness',
    label:       'Awareness',
    description: 'Problem-focused. Surface the issue (overpaying taxes, missing benefits) without pitching the solution yet. Creates curiosity.',
  },
  {
    value:       'education',
    label:       'Education',
    description: 'Plain-language breakdown of IRS codes, how the SIMRP works, and what redirecting payroll taxes actually means. Credentialed and detailed.',
  },
  {
    value:       'case-study',
    label:       'Case Study',
    description: 'Real outcomes. Specific numbers, before/after framing, client type and industry. Story-driven credibility.',
  },
  {
    value:       'compliance',
    label:       'Compliance & Trust',
    description: 'Authoritative. IRS citations, legal clarity, direct objection handling. Addresses skepticism head-on with evidence.',
  },
  {
    value:       'promotional',
    label:       'Promotional',
    description: 'Direct offer. Clear CTA (schedule a call, get an analysis). Specific benefit promise. For bottom-of-funnel audiences.',
  },
]
