import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withTenant } from '@/lib/db'
import { z } from 'zod'

const bodySchema = z.object({
  ids:    z.array(z.string().min(1)).min(1).max(200),
  action: z.literal('delete'),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input' }, { status: 400 })
  const { ids } = parsed.data
  const tenantId = session.user.tenantId

  try {
    const count = await withTenant(tenantId, async (tx) => {
      // Detach any scheduled posts that point at these assets first (FK is SET NULL-
      // safe via assetId nullable, but clear them so the scheduler reflects reality).
      await tx.scheduledPost.updateMany({ where: { tenantId, assetId: { in: ids } }, data: { assetId: null } })
      const res = await tx.asset.deleteMany({ where: { id: { in: ids }, tenantId } })
      return res.count
    })
    return NextResponse.json({ ok: true, count })
  } catch (err) {
    console.error('[assets/bulk]', err)
    return NextResponse.json({ message: 'Bulk delete failed.' }, { status: 500 })
  }
}
