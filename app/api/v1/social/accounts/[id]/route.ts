import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  // Delete associated scheduled posts first to avoid FK constraint
  try {
    await prisma.$transaction([
      prisma.scheduledPost.deleteMany({ where: { socialAccountId: params.id, tenantId: session.user.tenantId } }),
      prisma.socialAccount.deleteMany({ where: { id: params.id, tenantId: session.user.tenantId } }),
    ])
  } catch (err) {
    console.error('[accounts/DELETE]', err)
    return NextResponse.json({ message: 'Failed to disconnect account.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
