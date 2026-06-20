import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, withTenant } from '@/lib/db'
import { z } from 'zod'
import { CAPTION_MODEL_IDS, IMAGE_STYLE_IDS } from '@/lib/content-plan-options'

const hexColor = z.string().regex(/^#[0-9a-fA-F]{3,8}$/)

const patchSchema = z.object({
  tagline:       z.string().max(200).optional(),
  tone:          z.string().max(500).optional(),
  audience:      z.string().max(500).optional(),
  products:      z.array(z.string()).optional(),
  guidelines:    z.string().max(10000).optional(),
  visualStyle:   z.string().max(1000).optional(),
  keyMessages:   z.array(z.string().max(500)).max(30).optional(),
  knowledgeBase: z.array(z.string().max(600)).max(40).optional(),
  includeLogo:   z.boolean().optional(),
  isDefault:     z.boolean().optional(),
  logoUrl:       z.string().url().optional().or(z.literal('')),
  logoVariants:  z.array(z.object({ label: z.string().max(50), url: z.string().url() })).max(10).optional(),
  colors:        z.object({
    primary:   hexColor.optional(),
    secondary: hexColor.optional(),
    accent:    hexColor.optional(),
    dark:      hexColor.optional(),
    light:     hexColor.optional(),
  }).optional(),
  fonts:         z.object({
    heading: z.string().max(100).optional(),
    body:    z.string().max(100).optional(),
  }).optional(),
  contentDefaults: z.object({
    captionModel: z.enum(CAPTION_MODEL_IDS).optional(),
    imageStyle:   z.enum(IMAGE_STYLE_IDS).optional(),
  }).optional(),
})

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  // Verify ownership
  let existing: { config: unknown } | null
  try {
    existing = await withTenant(session.user.tenantId, (tx) => tx.brandProfile.findFirst({
      where: { id: params.id, tenantId: session.user.tenantId },
    }))
  } catch (err) {
    console.error('[brands/PATCH] findFirst error:', err)
    return NextResponse.json({ message: 'Database error.' }, { status: 500 })
  }
  if (!existing) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  const currentConfig = (existing.config as Record<string, unknown>) ?? {}
  const updates: Record<string, unknown> = {}

  const { logoUrl, isDefault, ...configFields } = parsed.data

  // Merge config fields (top-level columns are handled separately, not in config)
  const newConfig: Record<string, unknown> = { ...currentConfig }
  for (const [k, v] of Object.entries(configFields)) {
    if (v !== undefined) newConfig[k] = v
  }

  updates.config = newConfig
  if (logoUrl !== undefined) updates.logoUrl = logoUrl || null
  if (isDefault !== undefined) updates.isDefault = isDefault

  let brand: Awaited<ReturnType<typeof prisma.brandProfile.update>>
  try {
    if (isDefault === true) {
      // One default per tenant: clear the others, set this one — atomically.
      brand = await withTenant(session.user.tenantId, async (tx) => {
        await tx.brandProfile.updateMany({
          where: { tenantId: session.user.tenantId, id: { not: params.id } },
          data:  { isDefault: false },
        })
        return tx.brandProfile.update({
          where: { id: params.id, tenantId: session.user.tenantId },
          data:  updates,
        })
      })
    } else {
      brand = await withTenant(session.user.tenantId, (tx) => tx.brandProfile.update({
        where: { id: params.id, tenantId: session.user.tenantId },
        data:  updates,
      }))
    }
  } catch (err) {
    console.error('[brands/PATCH] update error:', err)
    return NextResponse.json({ message: 'Failed to save changes.' }, { status: 500 })
  }

  return NextResponse.json({ brand })
}
