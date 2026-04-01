import { NextResponse }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'
import { encryptToken }     from '@/lib/crypto'
import { getTikTokProfile } from '@/services/social'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL!))

  const { searchParams } = new URL(req.url)
  const code  = searchParams.get('code')
  const error = searchParams.get('error')

  if (error || !code) {
    return NextResponse.redirect(new URL('/scheduler?error=tiktok_denied', process.env.NEXTAUTH_URL!))
  }

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/v1/social/connect/tiktok/callback`

  // Exchange code for tokens
  const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      client_key:    process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      code,
      grant_type:    'authorization_code',
      redirect_uri:  redirectUri,
    }).toString(),
  })
  const tokens = await tokenRes.json()
  if (!tokenRes.ok || tokens.error || !tokens.access_token) {
    return NextResponse.redirect(new URL('/scheduler?error=tiktok_token', process.env.NEXTAUTH_URL!))
  }

  // Get TikTok profile
  let profile: { id: string; name: string }
  try {
    profile = await getTikTokProfile(tokens.access_token)
  } catch {
    return NextResponse.redirect(new URL('/scheduler?error=tiktok_profile', process.env.NEXTAUTH_URL!))
  }

  const combined = `${tokens.access_token}|||${tokens.refresh_token}`
  // Track refresh token expiry (365 days); access token auto-refreshed on each publish
  const tokenExpiresAt = new Date(Date.now() + (tokens.refresh_expires_in ?? 365 * 24 * 60 * 60) * 1000)

  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'TIKTOK', accountId: profile.id } },
    create: { tenantId: session.user.tenantId, platform: 'TIKTOK', accountName: profile.name, accountId: profile.id, accessToken: encryptToken(combined), expiresAt: tokenExpiresAt },
    update: { accountName: profile.name, accessToken: encryptToken(combined), expiresAt: tokenExpiresAt },
  })

  return NextResponse.redirect(new URL('/scheduler?connected=tiktok', process.env.NEXTAUTH_URL!))
}
