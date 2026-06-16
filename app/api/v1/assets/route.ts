import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withTenant } from '@/lib/db'
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

type PostSummary = {
  status:       string
  platform:     string
  scheduledFor: string
  publishedAt:  string | null
}

// Fetch scheduled posts for the given asset ids, grouped by assetId.
// Used to attach posting status to each library asset.
async function postsByAssetId(tenantId: string, assetIds: string[]): Promise<Record<string, PostSummary[]>> {
  if (assetIds.length === 0) return {}
  const posts = await withTenant(tenantId, (tx) => tx.scheduledPost.findMany({
    where:   { tenantId, assetId: { in: assetIds } },
    orderBy: { scheduledFor: 'desc' },
    select:  {
      assetId:      true,
      status:       true,
      scheduledFor: true,
      publishedAt:  true,
      socialAccount: { select: { platform: true } },
    },
  }))
  const grouped: Record<string, PostSummary[]> = {}
  for (const p of posts) {
    if (!p.assetId) continue
    ;(grouped[p.assetId] ??= []).push({
      status:       p.status,
      platform:     p.socialAccount.platform,
      scheduledFor: p.scheduledFor.toISOString(),
      publishedAt:  p.publishedAt?.toISOString() ?? null,
    })
  }
  return grouped
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
      const rows = await withTenant(session.user.tenantId, (tx) => tx.$queryRaw<AssetRow[]>(Prisma.sql`
        SELECT id, type, "brandId", "s3Url", "htmlContent", metadata, "createdAt"::text AS "createdAt"
        FROM "Asset"
        WHERE "tenantId" = ${session.user.tenantId}
          AND status = 'READY'
          ${typeFilter}
          AND CAST(metadata AS TEXT) ILIKE ${q}
        ORDER BY "createdAt" DESC
        LIMIT 100
      `))
      const grouped = await postsByAssetId(session.user.tenantId, rows.map((r) => r.id))
      const assets  = rows.map((r) => ({ ...r, scheduledPosts: grouped[r.id] ?? [] }))
      return NextResponse.json({ assets, pagination: { total: rows.length, page: 1, limit: 100, pages: 1 } })
    }

    // Normal paginated fetch
    const where = { tenantId: session.user.tenantId, status: 'READY' as const, ...(type ? { type } : {}) }
    const [assets, total] = await withTenant(session.user.tenantId, (tx) => Promise.all([
      tx.asset.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take:    limit,
        select:  {
          id: true, type: true, brandId: true, s3Url: true, htmlContent: true, metadata: true, createdAt: true,
          scheduledPosts: {
            where:   { tenantId: session.user.tenantId }, // defense-in-depth tenant scoping
            orderBy: { scheduledFor: 'desc' },
            select:  {
              status:       true,
              scheduledFor: true,
              publishedAt:  true,
              socialAccount: { select: { platform: true } },
            },
          },
        },
      }),
      tx.asset.count({ where }),
    ]))

    return NextResponse.json({
      assets: assets.map((a) => ({
        ...a,
        createdAt:      a.createdAt.toISOString(),
        scheduledPosts: a.scheduledPosts.map((p) => ({
          status:       p.status,
          platform:     p.socialAccount.platform,
          scheduledFor: p.scheduledFor.toISOString(),
          publishedAt:  p.publishedAt?.toISOString() ?? null,
        })),
      })),
      pagination: { total, page, limit, pages: Math.ceil(total / limit) },
    })
  } catch (err) {
    console.error('[assets/GET]', err)
    return NextResponse.json({ message: 'Failed to load assets.' }, { status: 500 })
  }
}
