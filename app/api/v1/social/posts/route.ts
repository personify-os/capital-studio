import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  socialAccountIds: z.array(z.string()).min(1),
  caption:          z.string().min(1).max(2200),
  imageUrl:         z.string().url().optional(),
  assetId:          z.string().optional(),
  scheduledFor:     z.string().datetime(),
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

  const { socialAccountIds, caption, imageUrl, assetId, scheduledFor } = parsed.data

  // Verify all accounts belong to this tenant
  const accounts = await prisma.socialAccount.findMany({
    where: { id: { in: socialAccountIds }, tenantId: session.user.tenantId },
  })
  if (accounts.length !== socialAccountIds.length) {
    return NextResponse.json({ message: 'Invalid accounts' }, { status: 400 })
  }

  // Create one ScheduledPost per account
  const posts = await prisma.$transaction(
    socialAccountIds.map((accountId) =>
      prisma.scheduledPost.create({
        data: {
          tenantId:       session.user.tenantId,
          socialAccountId: accountId,
          caption,
          imageUrl:        imageUrl ?? null,
          assetId:         assetId ?? null,
          scheduledFor:    new Date(scheduledFor),
          status:          'SCHEDULED',
        },
        include: { socialAccount: { select: { id: true, platform: true, accountName: true } } },
      }),
    ),
  )

  return NextResponse.json({ posts }, { status: 201 })
}
