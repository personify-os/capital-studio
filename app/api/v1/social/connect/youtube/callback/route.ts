import { NextResponse }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'
import { encryptToken }     from '@/lib/crypto'
import { getYouTubeChannel } from '@/services/social'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL!))

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/scheduler?error=youtube_denied', process.env.NEXTAUTH_URL!))
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/v1/social/connect/youtube/callback`

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      code,
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri:  redirectUri,
      grant_type:    'authorization_code',
    }).toString(),
  })
  const tokens = await tokenRes.json()
  if (!tokenRes.ok || !tokens.access_token) {
    return NextResponse.redirect(new URL('/scheduler?error=youtube_token', process.env.NEXTAUTH_URL!))
  }

  // Get channel info
  let channel: { id: string; name: string }
  try {
    channel = await getYouTubeChannel(tokens.access_token)
  } catch {
    return NextResponse.redirect(new URL('/scheduler?error=youtube_channel', process.env.NEXTAUTH_URL!))
  }

  const combined = `${tokens.access_token}|||${tokens.refresh_token}`

  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'YOUTUBE', accountId: channel.id } },
    create: { tenantId: session.user.tenantId, platform: 'YOUTUBE', accountName: channel.name, accountId: channel.id, accessToken: encryptToken(combined) },
    update: { accountName: channel.name, accessToken: encryptToken(combined) },
  })

  return NextResponse.redirect(new URL('/scheduler?connected=youtube', process.env.NEXTAUTH_URL!))
}
