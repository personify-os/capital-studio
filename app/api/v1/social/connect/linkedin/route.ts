import { NextResponse }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'
import { encryptToken }     from '@/lib/crypto'
import { z }                from 'zod'

const schema = z.object({
  accessToken: z.string().min(1),
  personId:    z.string().min(1),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Access token and Person ID are required' }, { status: 400 })

  const { accessToken, personId } = parsed.data

  // Strip urn:li:person: prefix if user pasted the full URN
  const id = personId.replace('urn:li:person:', '').trim()

  const tokenExpiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days
  try {
    await prisma.socialAccount.upsert({
      where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'LINKEDIN', accountId: id } },
      create: { tenantId: session.user.tenantId, platform: 'LINKEDIN', accountName: 'LinkedIn Account', accountId: id, accessToken: encryptToken(accessToken), expiresAt: tokenExpiresAt },
      update: { accountName: 'LinkedIn Account', accessToken: encryptToken(accessToken), expiresAt: tokenExpiresAt },
    })
  } catch (err) {
    console.error('[social/connect/linkedin]', err)
    return NextResponse.json({ message: 'Failed to save LinkedIn account.' }, { status: 500 })
  }

  return NextResponse.json({ connected: 'LinkedIn Account' })
}
