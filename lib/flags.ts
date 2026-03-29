/**
 * Feature flags — controlled via environment variables.
 * Set FLAG_<NAME>=true to enable, or FLAG_<NAME>=false to disable.
 * Flags that default ON use the `!== 'false'` pattern.
 * Flags that default OFF use the `=== 'true'` pattern.
 */

export const flags = {
  // Core modules — ON by default
  analytics:      process.env.FLAG_ANALYTICS       !== 'false',
  musicGeneration:process.env.FLAG_MUSIC_GENERATION !== 'false',
  socialScheduler:process.env.FLAG_SOCIAL_SCHEDULER !== 'false',

  // Phase 2 modules — OFF by default until fully wired
  videoGeneration:process.env.FLAG_VIDEO_GENERATION === 'true',
  voiceover:      process.env.FLAG_VOICEOVER        === 'true',
  motionVideo:    process.env.FLAG_MOTION_VIDEO     === 'true',
  likenessVideo:  process.env.FLAG_LIKENESS_VIDEO   === 'true',

  // Social platforms — ON by default, disable per-platform if credentials missing
  socialFacebook: process.env.FLAG_SOCIAL_FACEBOOK  !== 'false',
  socialInstagram:process.env.FLAG_SOCIAL_INSTAGRAM !== 'false',
  socialThreads:  process.env.FLAG_SOCIAL_THREADS   !== 'false',
  socialLinkedIn: process.env.FLAG_SOCIAL_LINKEDIN  !== 'false',
  socialX:        process.env.FLAG_SOCIAL_X         !== 'false',
  socialYouTube:  process.env.FLAG_SOCIAL_YOUTUBE   === 'true',
  socialTikTok:   process.env.FLAG_SOCIAL_TIKTOK    === 'true',
} as const

export type FeatureFlag = keyof typeof flags
