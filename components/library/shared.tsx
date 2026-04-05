import { cn } from '@/lib/utils'

export interface Asset {
  id:          string
  type:        string
  brandId:     string | null
  s3Url:       string | null
  htmlContent: string | null
  metadata:    unknown
  createdAt:   string
}

export const BRAND_DOT: Record<string, string> = {
  lhcapital: 'bg-brand-azure',
  simrp:     'bg-brand-light',
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
