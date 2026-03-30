import { NextResponse }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'
import { getMediumProfile } from '@/services/social'
import { encryptToken }     from '@/lib/crypto'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { token } = await req.json()
  if (!token?.trim()) return NextResponse.json({ message: 'Token required' }, { status: 400 })

  let profile: { id: string; name: string }
  try {
    profile = await getMediumProfile(token.trim())
  } catch (err: any) {
    return NextResponse.json({ message: err.message ?? 'Invalid token' }, { status: 400 })
  }

  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'MEDIUM', accountId: profile.id } },
    create: { tenantId: session.user.tenantId, platform: 'MEDIUM', accountName: profile.name, accountId: profile.id, accessToken: encryptToken(token.trim()) },
    update: { accountName: profile.name, accessToken: encryptToken(token.trim()) },
  })

  return NextResponse.json({ connected: profile.name })
}
