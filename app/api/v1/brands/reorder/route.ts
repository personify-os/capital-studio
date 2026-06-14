import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1).max(50),
})

// POST /api/v1/brands/reorder — persist the user's drag-and-drop brand order.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const parsed = reorderSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input' }, { status: 400 })

  const { orderedIds } = parsed.data

  // Only reorder profiles that actually belong to this tenant.
  const owned = await prisma.brandProfile.findMany({
    where:  { tenantId: session.user.tenantId, id: { in: orderedIds } },
    select: { id: true },
  })
  const ownedIds = new Set(owned.map((b) => b.id))

  try {
    await prisma.$transaction(
      orderedIds
        .filter((id) => ownedIds.has(id))
        .map((id, index) =>
          prisma.brandProfile.update({
            where: { id, tenantId: session.user.tenantId },
            data:  { sortOrder: index },
          }),
        ),
    )
  } catch (err) {
    console.error('[brands/reorder] error:', err)
    return NextResponse.json({ message: 'Failed to save order.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
