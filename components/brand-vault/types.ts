export type BrandType = 'LHC' | 'SIMRP' | 'PERSONAL'

export interface BrandProfile {
  id:        string
  type:      BrandType
  name:      string
  logoUrl:   string | null
  config:    any
  isDefault: boolean
}

export const TYPE_LABELS: Record<BrandType, string> = {
  LHC:      'LH Capital',
  SIMRP:    'The SIMRP',
  PERSONAL: 'Personal Brand',
}

export const TYPE_COLORS: Record<BrandType, string> = {
  LHC:      'bg-brand-azure/10 text-brand-azure border-brand-azure/20',
  SIMRP:    'bg-brand-light/10 text-brand-light border-brand-light/20',
  PERSONAL: 'bg-brand-green/10 text-brand-green border-brand-green/20',
}
