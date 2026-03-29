import { NextResponse }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'
import { getLinkedInProfile } from '@/services/social'
import { encryptToken }      from '@/lib/crypto'
import { z }                 from 'zod'

const schema = z.object({ accessToken: z.string().min(1) })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input' }, { status: 400 })

  const { accessToken } = parsed.data

  let profile: { id: string; name: string }
  try {
    profile = await getLinkedInProfile(accessToken)
  } catch (err: any) {
    return NextResponse.json({ message: err.message ?? 'Failed to fetch LinkedIn profile' }, { status: 400 })
  }

  const encryptedToken = encryptToken(accessToken)
  await prisma.socialAccount.upsert({
    where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'LINKEDIN', accountId: profile.id } },
    create: { tenantId: session.user.tenantId, platform: 'LINKEDIN', accountName: profile.name, accountId: profile.id, accessToken: encryptedToken },
    update: { accountName: profile.name, accessToken: encryptedToken },
  })

  return NextResponse.json({ connected: `LinkedIn: ${profile.name}` })
}
