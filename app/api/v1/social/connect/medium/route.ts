import { NextResponse }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'
import { getMediumProfile } from '@/services/social'
import { encryptToken }     from '@/lib/crypto'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { cookie } = await req.json()
  if (!cookie?.trim()) return NextResponse.json({ message: 'Session cookie required' }, { status: 400 })

  let profile: { id: string; name: string }
  try {
    profile = await getMediumProfile(cookie.trim())
  } catch (err: any) {
    return NextResponse.json({ message: err.message ?? 'Invalid session cookie' }, { status: 400 })
  }

  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'MEDIUM', accountId: profile.id } },
    create: { tenantId: session.user.tenantId, platform: 'MEDIUM', accountName: profile.name, accountId: profile.id, accessToken: encryptToken(cookie.trim()) },
    update: { accountName: profile.name, accessToken: encryptToken(cookie.trim()) },
  })

  return NextResponse.json({ connected: profile.name })
}
