import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getFacebookPages, exchangeForLongLivedToken } from '@/services/social'
import { encryptToken } from '@/lib/crypto'
import { z } from 'zod'

const schema = z.object({ userToken: z.string().min(1) })

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input' }, { status: 400 })

  let token = parsed.data.userToken

  // Exchange for long-lived token if app credentials are configured
  if (process.env.META_APP_ID && process.env.META_APP_SECRET) {
    try { token = await exchangeForLongLivedToken(token) } catch { /* use original token */ }
  }

  let pages
  try {
    pages = await getFacebookPages(token)
  } catch (err: any) {
    return NextResponse.json({ message: err.message ?? 'Failed to fetch pages' }, { status: 400 })
  }

  const ALLOWED_PAGES = ['lh capital', 'the simrp']
  const allowedPages  = pages.filter((p) => ALLOWED_PAGES.some((name) => p.name.toLowerCase().includes(name)))

  const created: string[] = []

  for (const page of allowedPages) {
    // Upsert Facebook Page account
    const encryptedPageToken = encryptToken(page.access_token)
    await prisma.socialAccount.upsert({
      where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'FACEBOOK', accountId: page.id } },
      create: { tenantId: session.user.tenantId, platform: 'FACEBOOK', accountName: page.name, accountId: page.id, accessToken: encryptedPageToken },
      update: { accountName: page.name, accessToken: encryptedPageToken },
    })
    created.push(`Facebook: ${page.name}`)

    // Upsert Instagram Business Account if linked
    if (page.instagram_business_account?.id) {
      const igId = page.instagram_business_account.id
      await prisma.socialAccount.upsert({
        where:  { tenantId_platform_accountId: { tenantId: session.user.tenantId, platform: 'INSTAGRAM', accountId: igId } },
        create: { tenantId: session.user.tenantId, platform: 'INSTAGRAM', accountName: `${page.name} (Instagram)`, accountId: igId, accessToken: encryptedPageToken },
        update: { accountName: `${page.name} (Instagram)`, accessToken: encryptedPageToken },
      })
      created.push(`Instagram: ${page.name}`)
    }
  }

  return NextResponse.json({ connected: created })
}
