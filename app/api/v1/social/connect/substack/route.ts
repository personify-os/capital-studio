import { NextResponse }      from 'next/server'
import { getServerSession }   from 'next-auth'
import { authOptions }        from '@/lib/auth'
import { prisma }             from '@/lib/db'
import { getSubstackProfile } from '@/services/social'
import { encryptToken }       from '@/lib/crypto'

// POST — user pastes their Substack subdomain + connect.sid session cookie
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { subdomain, cookie } = await req.json()
  if (!subdomain?.trim()) return NextResponse.json({ message: 'Publication URL required' }, { status: 400 })
  if (!cookie?.trim())    return NextResponse.json({ message: 'Session cookie required' }, { status: 400 })

  // Strip full URL down to subdomain if user pastes whole URL
  const slug = subdomain.trim()
    .replace(/^https?:\/\//, '')
    .replace(/\.substack\.com.*$/, '')
    .replace(/\/$/, '')

  let profile: { id: string; name: string }
  try {
    profile = await getSubstackProfile(slug, cookie.trim())
  } catch (err: any) {
    return NextResponse.json({ message: err.message ?? 'Invalid session' }, { status: 400 })
  }

  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'SUBSTACK', accountId: slug } },
    create: { tenantId: session.user.tenantId, platform: 'SUBSTACK', accountName: profile.name, accountId: slug, accessToken: encryptToken(cookie.trim()) },
    update: { accountName: profile.name, accessToken: encryptToken(cookie.trim()) },
  })

  return NextResponse.json({ connected: profile.name })
}
