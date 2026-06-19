import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withTenant } from '@/lib/db'
import { z } from 'zod'

// Bulk status-only operations on scheduled posts. Publishing is intentionally
// NOT handled here — it hits external platform APIs per post and is driven from
// the client via the existing /posts/[id]/publish route so each result surfaces.
const bodySchema = z.object({
  ids:    z.array(z.string().min(1)).min(1).max(200),
  action: z.enum(['delete', 'draft']),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input' }, { status: 400 })
  const { ids, action } = parsed.data
  const tenantId = session.user.tenantId

  try {
    const count = await withTenant(tenantId, async (tx) => {
      if (action === 'delete') {
        const res = await tx.scheduledPost.deleteMany({ where: { id: { in: ids }, tenantId } })
        return res.count
      }
      // 'draft' — revert to DRAFT so the cron won't publish it. Never touch
      // posts that already published.
      const res = await tx.scheduledPost.updateMany({
        where: { id: { in: ids }, tenantId, status: { not: 'PUBLISHED' } },
        data:  { status: 'DRAFT', errorMessage: null },
      })
      return res.count
    })
    return NextResponse.json({ ok: true, count })
  } catch (err) {
    console.error('[posts/bulk]', err)
    return NextResponse.json({ message: 'Bulk action failed.' }, { status: 500 })
  }
}
