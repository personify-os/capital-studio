import { NextResponse }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { prisma }           from '@/lib/db'

// POST — user pastes their Substack publish-by-email address
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { email, publication } = await req.json()
  if (!email?.trim()) return NextResponse.json({ message: 'Email address required' }, { status: 400 })

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.trim())) {
    return NextResponse.json({ message: 'Invalid email address' }, { status: 400 })
  }

  const displayName = publication?.trim() ? publication.trim() : email.trim()

  await prisma.socialAccount.upsert({
    where: {
      tenantId_platform_accountId: {
        tenantId:  session.user.tenantId,
        platform:  'SUBSTACK',
        accountId: email.trim().toLowerCase(),
      },
    },
    create: {
      tenantId:    session.user.tenantId,
      platform:    'SUBSTACK',
      accountName: displayName,
      accountId:   email.trim().toLowerCase(),
      accessToken: email.trim().toLowerCase(), // email is the "token" — no secret needed
    },
    update: {
      accountName: displayName,
      accessToken: email.trim().toLowerCase(),
    },
  })

  return NextResponse.json({ connected: displayName })
}
