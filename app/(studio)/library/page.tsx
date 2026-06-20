import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Prisma } from '@prisma/client'
import { withTenant } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import LibraryClient from './LibraryClient'

const scheduledPostsSelect = (tenantId: string) => ({
  where:   { tenantId }, // defense-in-depth tenant scoping
  orderBy: { scheduledFor: 'desc' as const },
  select:  {
    status:        true,
    scheduledFor:  true,
    publishedAt:   true,
    socialAccount: { select: { platform: true } },
  },
})

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ type?: string; brand?: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const { type, brand } = await searchParams

  let assets: Awaited<ReturnType<typeof fetchAssets>> = []
  let total = 0
  const PAGE_SIZE = 48

  function fetchAssets(tx: Prisma.TransactionClient, tenantId: string) {
    return tx.asset.findMany({
      where:   { tenantId, status: 'READY' },
      orderBy: { createdAt: 'desc' },
      take:    PAGE_SIZE,
      select:  {
        id: true, type: true, brandId: true, s3Url: true, htmlContent: true, metadata: true, createdAt: true,
        scheduledPosts: scheduledPostsSelect(tenantId),
      },
    })
  }

  try {
    ;[assets, total] = await withTenant(session.user.tenantId, (tx) => Promise.all([
      fetchAssets(tx, session.user.tenantId),
      tx.asset.count({ where: { tenantId: session.user.tenantId, status: 'READY' } }),
    ]))
  } catch (err) { console.error('[library/page]', err) }

  return (
    <>
      <Topbar title="Content Library" description="All your generated assets in one place" />
      <LibraryClient
        assets={assets.map((a) => ({
          ...a,
          createdAt:      a.createdAt.toISOString(),
          scheduledPosts: a.scheduledPosts.map((p) => ({
            status:       p.status,
            platform:     p.socialAccount.platform,
            scheduledFor: p.scheduledFor.toISOString(),
            publishedAt:  p.publishedAt?.toISOString() ?? null,
          })),
        }))}
        total={total}
        pageSize={PAGE_SIZE}
        initialFilter={type}
        initialBrand={brand}
      />
    </>
  )
}
