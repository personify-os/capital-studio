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
  metadata: { prompt?: string; text?: string; texts?: string[]; platform?: string; title?: string; voiceName?: string; contentPillar?: string } | null
  createdAt: Date
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  let recentRaw:    RawAsset[] = []
  let assetCounts:  { type: string; _count: { _all: number } }[] = []

  try {
    const [rawResult, groupResult] = await Promise.all([
      prisma.asset.findMany({
        where:   { tenantId: session.user.tenantId, status: 'READY' },
        orderBy: { createdAt: 'desc' },
        take:    8,
        select:  { id: true, type: true, s3Url: true, htmlContent: true, metadata: true, createdAt: true },
      }),
      prisma.asset.groupBy({
        by:    ['type'],
        where: { tenantId: session.user.tenantId, status: 'READY' },
        _count: { _all: true },
      }),
    ])
    recentRaw    = rawResult   as RawAsset[]
    assetCounts  = groupResult as { type: string; _count: { _all: number } }[]
  } catch (err) { console.error('[dashboard/page]', err) }

  const counts = Object.fromEntries(assetCounts.map((c) => [c.type, c._count._all]))

  return (
    <>
      <Topbar title="Dashboard" />
      <DashboardClient
        userName={session.user.name ?? 'there'}
        recentAssets={recentRaw.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
        counts={counts}
      />
    </>
  )
}
