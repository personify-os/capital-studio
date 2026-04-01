import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  socialAccountIds:  z.array(z.string()).min(1),
  caption:           z.string().min(1).max(63206), // Facebook's actual limit
  instagramCaption:  z.string().min(1).max(2200).optional(),
  imageUrl:          z.string().url().optional(),
  assetId:           z.string().optional(),
  scheduledFor:      z.string().datetime(),
})

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const posts = await prisma.scheduledPost.findMany({
    where:   { tenantId: session.user.tenantId },
    orderBy: { scheduledFor: 'asc' },
    include: { socialAccount: { select: { id: true, platform: true, accountName: true } } },
    take:    100,
  })

  return NextResponse.json({ posts })
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input' }, { status: 400 })

  const { socialAccountIds, caption, instagramCaption, imageUrl, assetId, scheduledFor } = parsed.data

  // Verify all accounts belong to this tenant
  const accounts = await prisma.socialAccount.findMany({
    where: { id: { in: socialAccountIds }, tenantId: session.user.tenantId },
  })
  if (accounts.length !== socialAccountIds.length) {
    return NextResponse.json({ message: 'Invalid accounts' }, { status: 400 })
  }

  // For each selected FACEBOOK account, auto-include its paired Instagram account
  const facebookAccounts = accounts.filter((a) => a.platform === 'FACEBOOK')
  const extraInstagramPosts: { accountId: string; igCaption: string }[] = []

  if (facebookAccounts.length > 0) {
    const igAccounts = await prisma.socialAccount.findMany({
      where: { tenantId: session.user.tenantId, platform: 'INSTAGRAM' },
    })

    for (const fb of facebookAccounts) {
      // Match by naming convention: "Page Name" → "Page Name (Instagram)"
      const paired = igAccounts.find((ig) => ig.accountName === `${fb.accountName} (Instagram)`)
      if (paired && !socialAccountIds.includes(paired.id)) {
        extraInstagramPosts.push({
          accountId: paired.id,
          igCaption: instagramCaption ?? caption.slice(0, 2200),
        })
      }
    }
  }

  const postDate = new Date(scheduledFor)

  const allPostData = [
    ...socialAccountIds.map((accountId) => ({
      tenantId:        session.user.tenantId,
      socialAccountId: accountId,
      caption,
      imageUrl:        imageUrl ?? null,
      assetId:         assetId ?? null,
      scheduledFor:    postDate,
      status:          'SCHEDULED' as const,
    })),
    ...extraInstagramPosts.map(({ accountId, igCaption }) => ({
      tenantId:        session.user.tenantId,
      socialAccountId: accountId,
      caption:         igCaption,
      imageUrl:        imageUrl ?? null,
      assetId:         assetId ?? null,
      scheduledFor:    postDate,
      status:          'SCHEDULED' as const,
    })),
  ]

  const posts = await prisma.$transaction(
    allPostData.map((data) =>
      prisma.scheduledPost.create({
        data,
        include: { socialAccount: { select: { id: true, platform: true, accountName: true } } },
      }),
    ),
  )

  return NextResponse.json({ posts }, { status: 201 })
}
