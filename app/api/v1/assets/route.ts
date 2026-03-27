import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const querySchema = z.object({
  type:  z.enum(['IMAGE', 'GRAPHIC', 'VIDEO', 'AUDIO', 'VOICEOVER', 'DOCUMENT']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(24),
  page:  z.coerce.number().int().min(1).default(1),
})

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) return NextResponse.json({ message: 'Invalid query' }, { status: 400 })

  const { type, limit, page } = parsed.data
  const skip = (page - 1) * limit

  const [assets, total] = await Promise.all([
    prisma.asset.findMany({
      where:   { tenantId: session.user.tenantId, status: 'READY', ...(type ? { type } : {}) },
      orderBy: { createdAt: 'desc' },
      skip,
      take:    limit,
      select:  { id: true, type: true, s3Url: true, htmlContent: true, metadata: true, createdAt: true },
    }),
    prisma.asset.count({
      where: { tenantId: session.user.tenantId, status: 'READY', ...(type ? { type } : {}) },
    }),
  ])

  return NextResponse.json({
    assets: (assets as { id: string; type: string; s3Url: string | null; htmlContent: string | null; metadata: unknown; createdAt: Date }[])
      .map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
    pagination: { total, page, limit, pages: Math.ceil(total / limit) },
  })
}
