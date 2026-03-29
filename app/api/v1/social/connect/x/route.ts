import { NextResponse }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'

export async function POST(_req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const accessToken = process.env.TWITTER_ACCESS_TOKEN
  if (!process.env.TWITTER_API_KEY || !accessToken || !process.env.TWITTER_API_SECRET || !process.env.TWITTER_ACCESS_TOKEN_SECRET) {
    return NextResponse.json({ message: 'X credentials not configured' }, { status: 503 })
  }

  // X OAuth 1.0a access tokens are formatted as "<userId>-<secret>".
  // Extract the user ID directly — avoids a read API call (blocked on Free tier).
  const userId  = accessToken.split('-')[0]
  const handle  = process.env.TWITTER_HANDLE ?? '@lhc_capital'

  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'X', accountId: userId } },
    create: { tenantId: session.user.tenantId, platform: 'X', accountName: handle, accountId: userId, accessToken: 'oauth1' },
    update: { accountName: handle, accessToken: 'oauth1' },
  })

  return NextResponse.json({ connected: `X: ${handle}` })
}
