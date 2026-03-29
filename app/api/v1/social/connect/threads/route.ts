import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'

// POST — manual token paste (no OAuth redirect needed)
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { token } = await req.json()
  if (!token?.trim()) return NextResponse.json({ message: 'Token required' }, { status: 400 })

  // Fetch profile from Threads Graph API
  const meRes  = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username&access_token=${encodeURIComponent(token.trim())}`)
  const me     = await meRes.json()

  if (!meRes.ok || me.error) {
    return NextResponse.json({ message: me.error?.message ?? 'Invalid token — could not fetch Threads profile' }, { status: 400 })
  }

  const userId   = String(me.id)
  const username = me.username ? `@${me.username}` : `Threads (${userId})`

  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'THREADS', accountId: userId } },
    create: { tenantId: session.user.tenantId, platform: 'THREADS', accountName: username, accountId: userId, accessToken: token.trim() },
    update: { accountName: username, accessToken: token.trim() },
  })

  return NextResponse.json({ connected: username })
}
