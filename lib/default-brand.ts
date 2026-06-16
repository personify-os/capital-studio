import type { Prisma } from '@prisma/client'
import type { BrandId } from '@/lib/brands'

const TYPE_TO_ID: Record<string, BrandId> = {
  LHC:      'lhcapital',
  SIMRP:    'simrp',
  ESPA:     'espa',
  PERSONAL: 'personal',
}

/**
 * Resolve the tenant's default brand (the one flagged isDefault in the Brand
 * Vault) as a BrandId for pre-selecting in the generation modules.
 * Falls back to 'lhcapital'. `tx` is the tenant-scoped client from withTenant().
 */
export async function getDefaultBrandId(tx: Prisma.TransactionClient, tenantId: string): Promise<BrandId> {
  try {
    const def = await tx.brandProfile.findFirst({
      where:  { tenantId, isDefault: true },
      select: { type: true },
    })
    return def ? (TYPE_TO_ID[def.type] ?? 'lhcapital') : 'lhcapital'
  } catch {
    return 'lhcapital'
  }
}
