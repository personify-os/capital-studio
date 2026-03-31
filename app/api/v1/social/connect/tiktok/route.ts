import { NextResponse }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.redirect(new URL('/login', process.env.NEXTAUTH_URL!))

  const redirectUri = `${process.env.NEXTAUTH_URL}/api/v1/social/connect/tiktok/callback`

  const params = new URLSearchParams({
    client_key:    process.env.TIKTOK_CLIENT_KEY!,
    redirect_uri:  redirectUri,
    response_type: 'code',
    scope:         'user.info.basic,video.publish,video.upload',
    state:         session.user.tenantId,
  })

  return NextResponse.redirect(`https://www.tiktok.com/v2/auth/authorize/?${params}`)
}
