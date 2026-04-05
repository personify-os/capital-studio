import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const accounts = await prisma.socialAccount.findMany({
      where:   { tenantId: session.user.tenantId },
      orderBy: { createdAt: 'asc' },
      select:  { id: true, platform: true, accountName: true, accountId: true, createdAt: true, expiresAt: true },
    })
    return NextResponse.json({ accounts })
  } catch (err) {
    console.error('[accounts/GET]', err)
    return NextResponse.json({ message: 'Failed to load accounts.' }, { status: 500 })
  }
}
