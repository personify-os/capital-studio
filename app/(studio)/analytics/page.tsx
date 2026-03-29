import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import AnalyticsClient from './AnalyticsClient'

interface RawAsset {
  id:        string
  type:      string
  metadata:  unknown
  createdAt: Date
}

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const assets = (await prisma.asset.findMany({
    where:  { tenantId: session.user.tenantId },
    select: { id: true, type: true, metadata: true, createdAt: true },
  })) as RawAsset[]

  return (
    <>
      <Topbar title="Analytics" description="Content creation tracking across all modules" />
      <AnalyticsClient
        assets={assets.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
      />
    </>
  )
}
