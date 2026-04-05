import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import LibraryClient from './LibraryClient'

interface RawAsset {
  id:          string
  type:        string
  brandId:     string | null
  s3Url:       string | null
  htmlContent: string | null
  metadata:    unknown
  createdAt:   Date
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  let assets: RawAsset[] = []
  let total = 0
  const PAGE_SIZE = 48
  try {
    ;[assets, total] = await Promise.all([
      prisma.asset.findMany({
        where:   { tenantId: session.user.tenantId, status: 'READY' },
        orderBy: { createdAt: 'desc' },
        take:    PAGE_SIZE,
        select:  { id: true, type: true, brandId: true, s3Url: true, htmlContent: true, metadata: true, createdAt: true },
      }) as Promise<RawAsset[]>,
      prisma.asset.count({ where: { tenantId: session.user.tenantId, status: 'READY' } }),
    ])
  } catch (err) { console.error('[library/page]', err) }

  return (
    <>
      <Topbar title="Content Library" description="All your generated assets in one place" />
      <LibraryClient
        assets={assets.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
        total={total}
        pageSize={PAGE_SIZE}
      />
    </>
  )
}
