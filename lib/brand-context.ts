/**
 * Server-only — imports Prisma.
 * Resolves a BrandConfig for a specific tenant by merging:
 *   1. Static base config from lib/brands.ts
 *   2. User overrides saved in the Brand Vault DB (BrandProfile.config)
 *
 * Brand Vault fields that override static config:
 *   tagline, tone, audience, products, logoUrl
 * Brand Vault `guidelines` is prepended as the first knowledge-base entry.
 */

import { prisma } from '@/lib/db'
import { getBrandConfig, type BrandConfig, type BrandId } from '@/lib/brands'
import { BrandType } from '@prisma/client'

const BRAND_TYPE_MAP: Record<BrandId, BrandType> = {
  lhcapital: BrandType.LHC,
  simrp:     BrandType.SIMRP,
  personal:  BrandType.PERSONAL,
}

export async function resolveBrandConfig(
  brandId:  BrandId,
  tenantId: string,
): Promise<BrandConfig> {
  const base = getBrandConfig(brandId)
  const type = BRAND_TYPE_MAP[brandId]

  let profile: { config: unknown; logoUrl: string | null } | null = null
  try {
    profile = await prisma.brandProfile.findFirst({
      where:   { tenantId, type },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      select:  { config: true, logoUrl: true },
    })
  } catch (err) {
    // Non-fatal: fall back to static config on DB error
    console.error('[brand-context] DB lookup failed:', err)
  }

  if (!profile) return base

  const cfg = (profile.config ?? {}) as Record<string, unknown>

  const overrides: Partial<BrandConfig> = {}

  if (typeof cfg.tagline      === 'string' && cfg.tagline)        overrides.tagline     = cfg.tagline
  if (typeof cfg.tone         === 'string' && cfg.tone)           overrides.tone        = cfg.tone
  if (typeof cfg.audience     === 'string' && cfg.audience)       overrides.audience    = cfg.audience
  if (typeof cfg.visualStyle  === 'string' && cfg.visualStyle)    overrides.visualStyle = cfg.visualStyle
  if (Array.isArray(cfg.products)    && cfg.products.length)      overrides.products    = cfg.products    as string[]
  if (Array.isArray(cfg.keyMessages) && cfg.keyMessages.length)   overrides.keyMessages = cfg.keyMessages as string[]
  if (profile.logoUrl)                                            overrides.logoUrl     = profile.logoUrl

  // Merge stored color overrides — only valid hex strings replace base values
  if (cfg.colors && typeof cfg.colors === 'object' && !Array.isArray(cfg.colors)) {
    const stored = cfg.colors as Record<string, unknown>
    const isHex  = (v: unknown): v is string => typeof v === 'string' && /^#[0-9a-f]{3,8}$/i.test(v)
    overrides.colors = {
      ...base.colors,
      ...(isHex(stored.primary)   ? { primary:   stored.primary }   : {}),
      ...(isHex(stored.secondary) ? { secondary: stored.secondary } : {}),
      ...(isHex(stored.accent)    ? { accent:    stored.accent }    : {}),
      ...(isHex(stored.dark)      ? { dark:      stored.dark }      : {}),
      ...(isHex(stored.light)     ? { light:     stored.light }     : {}),
    }
  }

  // Merge stored font overrides
  if (cfg.fonts && typeof cfg.fonts === 'object' && !Array.isArray(cfg.fonts)) {
    const stored = cfg.fonts as Record<string, unknown>
    overrides.fonts = {
      heading: typeof stored.heading === 'string' && stored.heading ? stored.heading : base.fonts.heading,
      body:    typeof stored.body    === 'string' && stored.body    ? stored.body    : base.fonts.body,
    }
  }

  // Prepend free-form guidelines as the first knowledge-base entry so it gets
  // the highest prompt weight. Static KB still follows as structured facts.
  const guidelinesEntry = typeof cfg.guidelines === 'string' && cfg.guidelines.trim()
    ? cfg.guidelines.trim()
    : null

  const knowledgeBase = guidelinesEntry
    ? [guidelinesEntry, ...base.knowledgeBase]
    : base.knowledgeBase

  return { ...base, ...overrides, knowledgeBase }
}
