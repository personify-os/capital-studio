import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withTenant } from '@/lib/db'

export async function DELETE(_req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  // Delete associated scheduled posts first to avoid FK constraint
  try {
    await withTenant(session.user.tenantId, async (tx) => {
      await tx.scheduledPost.deleteMany({ where: { socialAccountId: params.id, tenantId: session.user.tenantId } })
      await tx.socialAccount.deleteMany({ where: { id: params.id, tenantId: session.user.tenantId } })
    })
  } catch (err) {
    console.error('[accounts/DELETE]', err)
    return NextResponse.json({ message: 'Failed to disconnect account.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
