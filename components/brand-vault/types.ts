export type BrandType = 'LHC' | 'SIMRP' | 'ESPA' | 'PERSONAL'

export interface BrandProfile {
  id:        string
  type:      BrandType
  name:      string
  logoUrl:   string | null
  config:    any
  isDefault: boolean
}

export type LogoVariant = { label: string; url: string }

export type BrandConfig = {
  colors?:        Record<string, string>
  fonts?:         Record<string, string>
  tagline?:       string
  tone?:          string
  audience?:      string
  products?:      string[]
  guidelines?:    string
  visualStyle?:   string
  keyMessages?:   string[]
  knowledgeBase?: string[]
  documentUrl?:   string
  documentName?:  string
  logoVariants?:  LogoVariant[]
}

export const TYPE_LABELS: Record<BrandType, string> = {
  LHC:      'LH Capital',
  SIMRP:    'The SIMRP',
  ESPA:     'ESPA by BizPower',
  PERSONAL: 'Personal Brand',
}

export const TYPE_COLORS: Record<BrandType, string> = {
  LHC:      'bg-brand-azure/10 text-brand-azure border-brand-azure/20',
  SIMRP:    'bg-brand-light/10 text-brand-light border-brand-light/20',
  ESPA:     'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20',
  PERSONAL: 'bg-brand-green/10 text-brand-green border-brand-green/20',
}
