// Shared Content Plan generation options — used by PlanClient, the brand PATCH
// schema, the brands GET endpoint, and the Brand Vault defaults UI.

export type CaptionModelId = 'claude-haiku-4-5-20251001' | 'claude-sonnet-4-6' | 'claude-opus-4-8'
export const CAPTION_MODEL_IDS = ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-8'] as const
export const CAPTION_MODELS: { id: CaptionModelId; label: string }[] = [
  { id: 'claude-haiku-4-5-20251001', label: 'Claude Haiku · fast' },
  { id: 'claude-sonnet-4-6',         label: 'Claude Sonnet · balanced' },
  { id: 'claude-opus-4-8',           label: 'Claude Opus · best' },
]

export type ImageStyleId = 'claude-design' | 'recraft' | 'photo'
export const IMAGE_STYLE_IDS = ['claude-design', 'recraft', 'photo'] as const
export const IMAGE_STYLES: Record<ImageStyleId, { model: string; label: string; mode: 'design' | 'photo' }> = {
  // Ideogram renders flat, full-bleed editorial typography (the OSPRY-style look);
  // Recraft leans illustrated/poster-mockup; flux is photographic.
  'claude-design': { model: 'ideogram-v3', label: 'Claude Design',        mode: 'design' },
  'recraft':       { model: 'recraft-v3',  label: 'Recraft (illustrated)', mode: 'design' },
  'photo':         { model: 'flux-pro',    label: 'Photo',                 mode: 'photo'  },
}

export interface ContentDefaults {
  captionModel?: CaptionModelId
  imageStyle?:   ImageStyleId
}

export const DEFAULT_CAPTION_MODEL: CaptionModelId = 'claude-haiku-4-5-20251001'
export const DEFAULT_IMAGE_STYLE:   ImageStyleId   = 'claude-design'

// BrandType (DB) → BrandId (Content Plan / UI)
export const BRAND_TYPE_TO_ID: Record<string, string> = {
  LHC: 'lhcapital', SIMRP: 'simrp', ESPA: 'espa', PERSONAL: 'personal',
}
