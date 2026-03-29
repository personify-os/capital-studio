import { NextResponse }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'
import { encryptToken }     from '@/lib/crypto'

const THREADS_GRAPH = 'https://graph.threads.net'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/login`)

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/scheduler?error=threads_denied`)
  }

  const appId       = process.env.THREADS_APP_ID!
  const appSecret   = process.env.THREADS_APP_SECRET!
  const redirectUri = `${process.env.NEXTAUTH_URL}/api/v1/social/connect/threads/callback`

  // Step 1: exchange code for short-lived token
  const tokenRes  = await fetch(`${THREADS_GRAPH}/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id:     appId,
      client_secret: appSecret,
      grant_type:    'authorization_code',
      redirect_uri:  redirectUri,
      code,
    }).toString(),
  })
  const tokenJson = await tokenRes.json()
  if (!tokenRes.ok || tokenJson.error) {
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/scheduler?error=threads_token`)
  }

  const shortToken = tokenJson.access_token as string
  const userId     = String(tokenJson.user_id)

  // Step 2: exchange for long-lived token (60 days)
  const llRes  = await fetch(
    `${THREADS_GRAPH}/access_token?grant_type=th_exchange_token&client_secret=${appSecret}&access_token=${encodeURIComponent(shortToken)}`
  )
  const llJson = await llRes.json()
  const longToken = llRes.ok && !llJson.error ? (llJson.access_token as string) : shortToken

  // Step 3: fetch account username
  const meRes  = await fetch(`${THREADS_GRAPH}/v1.0/me?fields=id,username&access_token=${encodeURIComponent(longToken)}`)
  const me     = await meRes.json()
  const username = me.username ? `@${me.username}` : `Threads (${userId})`

  // Step 4: upsert SocialAccount (token encrypted at rest)
  const encryptedToken = encryptToken(longToken)
  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'THREADS', accountId: userId } },
    create: { tenantId: session.user.tenantId, platform: 'THREADS', accountName: username, accountId: userId, accessToken: encryptedToken },
    update: { accountName: username, accessToken: encryptedToken },
  })

  return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/scheduler?connected=threads`)
}
