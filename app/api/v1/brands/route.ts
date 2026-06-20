import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, withTenant } from '@/lib/db'
import { z } from 'zod'
import { BRAND_TYPE_TO_ID, type ContentDefaults } from '@/lib/content-plan-options'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['LHC', 'SIMRP', 'ESPA', 'PERSONAL']),
})

// Returns each brand's saved Content Plan defaults, keyed by BrandId. The default
// profile per type wins (orderBy isDefault desc), so the account has one shared set.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const brands = await withTenant(session.user.tenantId, (tx) => tx.brandProfile.findMany({
      where:   { tenantId: session.user.tenantId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
      select:  { type: true, config: true },
    }))
    const defaults: Record<string, ContentDefaults> = {}
    for (const b of brands) {
      const id = BRAND_TYPE_TO_ID[b.type]
      if (!id || id in defaults) continue
      const cd = (b.config as { contentDefaults?: ContentDefaults } | null)?.contentDefaults
      if (cd && (cd.captionModel || cd.imageStyle)) defaults[id] = { captionModel: cd.captionModel, imageStyle: cd.imageStyle }
    }
    return NextResponse.json({ defaults })
  } catch (err) {
    console.error('[brands/GET]', err)
    return NextResponse.json({ message: 'Failed to load brands.' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  let brand: Awaited<ReturnType<typeof prisma.brandProfile.create>>
  try {
    brand = await withTenant(session.user.tenantId, (tx) => tx.brandProfile.create({
      data: {
        tenantId:  session.user.tenantId,
        type:      parsed.data.type,
        name:      parsed.data.name,
        isDefault: false,
        config:    {},
      },
    }))
  } catch (err) {
    console.error('[brands/POST]', err)
    return NextResponse.json({ message: 'Failed to create brand.' }, { status: 500 })
  }

  return NextResponse.json({ brand }, { status: 201 })
}
