import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import DashboardClient from './DashboardClient'

interface RawAsset {
  id: string
  type: string
  s3Url: string | null
  htmlContent: string | null
  metadata: unknown
  createdAt: Date
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const [recentRaw, assetCounts] = await Promise.all([
    prisma.asset.findMany({
      where:   { tenantId: session.user.tenantId, status: 'READY' },
      orderBy: { createdAt: 'desc' },
      take:    8,
      select:  { id: true, type: true, s3Url: true, htmlContent: true, metadata: true, createdAt: true },
    }) as Promise<RawAsset[]>,
    prisma.asset.groupBy({
      by:    ['type'],
      where: { tenantId: session.user.tenantId, status: 'READY' },
      _count: { _all: true },
    }),
  ])

  const counts = Object.fromEntries(
    (assetCounts as { type: string; _count: { _all: number } }[]).map((c) => [c.type, c._count._all])
  )

  return (
    <>
      <Topbar title="Dashboard" description="Welcome to Capital Studio" />
      <DashboardClient
        userName={session.user.name ?? 'there'}
        recentAssets={recentRaw.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
        counts={counts}
      />
    </>
  )
}
