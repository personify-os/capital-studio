import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const bodySchema = z.object({
  startDate: z.string().min(1), // YYYY-MM-DD or ISO
  items: z.array(z.object({
    assetId:  z.string().optional(),
    day:      z.string().optional(),
    platform: z.string(),
    body:     z.string().min(1),
  })).min(1).max(60),
})

// POST /api/v1/plan/schedule — turn generated plan posts into DRAFT scheduled
// posts, dated by their Day number from a chosen start date. Drafts never
// auto-publish; the user reviews and promotes them in the Scheduler.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input' }, { status: 400 })
  const { startDate, items } = parsed.data

  const base = new Date(startDate)
  if (isNaN(base.getTime())) return NextResponse.json({ message: 'Invalid start date' }, { status: 400 })

  // Map each connected platform → an account id (first one wins).
  const accounts = await prisma.socialAccount.findMany({
    where:  { tenantId: session.user.tenantId },
    select: { id: true, platform: true },
  })
  const accountByPlatform = new Map<string, string>()
  for (const a of accounts) if (!accountByPlatform.has(a.platform)) accountByPlatform.set(a.platform, a.id)

  const toCreate: { socialAccountId: string; caption: string; assetId: string | null; scheduledFor: Date }[] = []
  const missing = new Set<string>()

  items.forEach((item, idx) => {
    const platform = item.platform.toUpperCase()
    const accountId = accountByPlatform.get(platform)
    if (!accountId) { missing.add(platform); return }
    const dayNum = parseInt(item.day ?? '', 10)
    const offset = Number.isFinite(dayNum) && dayNum > 0 ? dayNum - 1 : idx
    const when = new Date(base)
    when.setDate(when.getDate() + offset)
    toCreate.push({ socialAccountId: accountId, caption: item.body, assetId: item.assetId ?? null, scheduledFor: when })
  })

  let created = 0
  if (toCreate.length) {
    try {
      const res = await prisma.$transaction(
        toCreate.map((d) => prisma.scheduledPost.create({
          data: {
            tenantId:        session.user.tenantId,
            socialAccountId: d.socialAccountId,
            caption:         d.caption,
            assetId:         d.assetId,
            scheduledFor:    d.scheduledFor,
            status:          'DRAFT',
          },
        })),
      )
      created = res.length
    } catch (err) {
      console.error('[plan/schedule] failed:', err)
      return NextResponse.json({ message: 'Failed to create scheduled drafts.' }, { status: 500 })
    }
  }

  return NextResponse.json({
    created,
    skipped: items.length - created,
    missingPlatforms: [...missing],
  })
}
