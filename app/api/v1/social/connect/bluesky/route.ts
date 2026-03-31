import { NextResponse }     from 'next/server'
import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { prisma }            from '@/lib/db'
import { getBlueskyProfile } from '@/services/social'
import { encryptToken }      from '@/lib/crypto'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { handle, appPassword } = await req.json()
  if (!handle?.trim())      return NextResponse.json({ message: 'Handle required' }, { status: 400 })
  if (!appPassword?.trim()) return NextResponse.json({ message: 'App password required' }, { status: 400 })

  let profile: { id: string; name: string }
  try {
    profile = await getBlueskyProfile(handle.trim(), appPassword.trim())
  } catch (err: any) {
    return NextResponse.json({ message: err.message ?? 'Invalid credentials' }, { status: 400 })
  }

  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'BLUESKY', accountId: profile.id } },
    create: { tenantId: session.user.tenantId, platform: 'BLUESKY', accountName: profile.name, accountId: profile.id, accessToken: encryptToken(appPassword.trim()) },
    update: { accountName: profile.name, accessToken: encryptToken(appPassword.trim()) },
  })

  return NextResponse.json({ connected: profile.name })
}
