import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  await prisma.scheduledPost.deleteMany({
    where: { id: params.id, tenantId: session.user.tenantId },
  })

  return NextResponse.json({ ok: true })
}
