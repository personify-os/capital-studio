/**
 * Third-party platform brand colors.
 * These are NOT LH Capital brand colors — they are the official colors of each
 * social platform, used only for platform icons and labels.
 *
 * Kept in lib/ (not components/) to satisfy the no-inline-hex-in-components rule.
 * tailwind.config.ts includes ./lib/** in the content scan so these classes are generated.
 */

export const PLATFORM_TEXT_COLOR: Record<string, string> = {
  FACEBOOK:  'text-[#1877F2]',
  INSTAGRAM: 'text-[#E4405F]',
  X:         'text-black',
  LINKEDIN:  'text-[#0A66C2]',
  YOUTUBE:   'text-[#FF0000]',
  TIKTOK:    'text-black',
  THREADS:   'text-black',
  SUBSTACK:  'text-[#FF6719]',
  MEDIUM:    'text-black',
  BLUESKY:   'text-[#0085ff]',
}

/** Facebook blue — used for the Connect Facebook button */
export const FACEBOOK_BG = 'bg-[#1877F2]'
