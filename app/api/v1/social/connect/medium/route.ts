import { NextResponse }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'
import { getMediumProfile } from '@/services/social'
import { encryptToken }     from '@/lib/crypto'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { uid, sid } = await req.json()
  if (!uid?.trim() || !sid?.trim()) return NextResponse.json({ message: 'Both uid and sid cookies are required' }, { status: 400 })

  let profile: { id: string; name: string }
  try {
    profile = await getMediumProfile(uid.trim(), sid.trim())
  } catch (err: any) {
    return NextResponse.json({ message: err.message ?? 'Invalid session cookies' }, { status: 400 })
  }

  // Store uid:sid combined so publishToMedium can split them
  const combined = `${uid.trim()}:${sid.trim()}`

  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'MEDIUM', accountId: profile.id } },
    create: { tenantId: session.user.tenantId, platform: 'MEDIUM', accountName: profile.name, accountId: profile.id, accessToken: encryptToken(combined) },
    update: { accountName: profile.name, accessToken: encryptToken(combined) },
  })

  return NextResponse.json({ connected: profile.name })
}
