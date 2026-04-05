import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import AnalyticsClient from './AnalyticsClient'

interface RawAsset {
  id:        string
  type:      string
  brandId:   string | null
  metadata:  Record<string, unknown> | null
  createdAt: Date
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  let assets: RawAsset[] = []
  // Cap to last 365 days server-side; client-side "All time" shows within this window.
  // Increase the cutoff here if longer history is needed.
  const cutoff = new Date()
  cutoff.setFullYear(cutoff.getFullYear() - 1)
  try {
    assets = (await prisma.asset.findMany({
      where:   { tenantId: session.user.tenantId, createdAt: { gte: cutoff } },
      orderBy: { createdAt: 'desc' },
      take:    2000,
      select:  { id: true, type: true, brandId: true, metadata: true, createdAt: true },
    })) as RawAsset[]
  } catch (err) {
    console.error('[analytics/page]', err)
  }

  return (
    <>
      <Topbar title="Analytics" description="Content creation tracking across all modules" />
      <AnalyticsClient
        assets={assets.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
      />
    </>
  )
}
