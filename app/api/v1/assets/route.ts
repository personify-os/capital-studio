import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

const querySchema = z.object({
  type:   z.enum(['IMAGE', 'GRAPHIC', 'VIDEO', 'MOTION', 'AUDIO', 'VOICEOVER', 'MUSIC', 'DOCUMENT', 'CAPTION', 'LIKENESS']).optional(),
  search: z.string().max(100).optional(),
  limit:  z.coerce.number().int().min(1).max(100).default(24),
  page:   z.coerce.number().int().min(1).default(1),
})

type AssetRow = {
  id: string; type: string; brandId: string | null
  s3Url: string | null; htmlContent: string | null
  metadata: unknown; createdAt: string
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const parsed = querySchema.safeParse(Object.fromEntries(searchParams))
  if (!parsed.success) return NextResponse.json({ message: 'Invalid query' }, { status: 400 })

  const { type, search, limit, page } = parsed.data
  const skip = (page - 1) * limit

  try {
    // Server-side full-text search via JSONB cast — returns up to 100 matches, no pagination
    if (search && search.trim()) {
      const q     = `%${search.trim()}%`
      const typeFilter = type ? Prisma.sql`AND type = ${type}::"AssetType"` : Prisma.sql``
      const rows: AssetRow[] = await prisma.$queryRaw(Prisma.sql`
        SELECT id, type, "brandId", "s3Url", "htmlContent", metadata, "createdAt"::text AS "createdAt"
        FROM "Asset"
        WHERE "tenantId" = ${session.user.tenantId}
          AND status = 'READY'
          ${typeFilter}
          AND CAST(metadata AS TEXT) ILIKE ${q}
        ORDER BY "createdAt" DESC
        LIMIT 100
      `)
      return NextResponse.json({ assets: rows, pagination: { total: rows.length, page: 1, limit: 100, pages: 1 } })
    }

    // Normal paginated fetch
    const where = { tenantId: session.user.tenantId, status: 'READY' as const, ...(type ? { type } : {}) }
    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take:    limit,
        select:  { id: true, type: true, brandId: true, s3Url: true, htmlContent: true, metadata: true, createdAt: true },
      }),
      prisma.asset.count({ where }),
    ])

    return NextResponse.json({
      assets:     assets.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() })),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('[assets/GET]', err)
    return NextResponse.json({ message: 'Failed to load assets.' }, { status: 500 })
  }
}
