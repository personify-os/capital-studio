import { NextResponse }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'
import { getXProfile }      from '@/services/social'

export async function POST(_req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  if (!process.env.TWITTER_API_KEY || !process.env.TWITTER_ACCESS_TOKEN) {
    return NextResponse.json({ message: 'X credentials not configured' }, { status: 503 })
  }

  let profile: { id: string; name: string }
  try {
    profile = await getXProfile()
  } catch (err: any) {
    return NextResponse.json({ message: err.message ?? 'Failed to fetch X profile' }, { status: 400 })
  }

  // Store a placeholder token — actual auth uses OAuth 1.0a env vars at publish time
  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'X', accountId: profile.id } },
    create: { tenantId: session.user.tenantId, platform: 'X', accountName: profile.name, accountId: profile.id, accessToken: 'oauth1' },
    update: { accountName: profile.name, accessToken: 'oauth1' },
  })

  return NextResponse.json({ connected: `X: ${profile.name}` })
}
