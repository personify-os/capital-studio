import { NextResponse }     from 'next/server'
import { getServerSession }  from 'next-auth'
import { authOptions }       from '@/lib/auth'
import { prisma }            from '@/lib/db'
import { getBlueskyProfile } from '@/services/social'
import { encryptToken }      from '@/lib/crypto'
import { z }                 from 'zod'

const schema = z.object({
  handle:      z.string().min(1),
  appPassword: z.string().min(1),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Handle and app password are required' }, { status: 400 })

  const { handle, appPassword } = parsed.data

  let profile: { id: string; name: string }
  try {
    profile = await getBlueskyProfile(handle, appPassword)
  } catch (err: any) {
    return NextResponse.json({ message: err.message ?? 'Invalid credentials' }, { status: 400 })
  }

  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'BLUESKY', accountId: profile.id } },
    create: { tenantId: session.user.tenantId, platform: 'BLUESKY', accountName: profile.name, accountId: profile.id, accessToken: encryptToken(appPassword) },
    update: { accountName: profile.name, accessToken: encryptToken(appPassword) },
  })

  return NextResponse.json({ connected: profile.name })
}
