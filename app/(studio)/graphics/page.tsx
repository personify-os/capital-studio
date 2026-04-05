import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import GraphicsClient from './GraphicsClient'

interface RawGraphic {
  id: string
  htmlContent: string | null
  metadata: unknown
  createdAt: Date
}

export default async function GraphicsPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  let recent: RawGraphic[] = []
  try {
    recent = (await prisma.asset.findMany({
      where:   { tenantId: session.user.tenantId, type: 'GRAPHIC', status: 'READY' },
      orderBy: { createdAt: 'desc' },
      take:    12,
      select:  { id: true, htmlContent: true, metadata: true, createdAt: true },
    })) as RawGraphic[]
  } catch (err) { console.error('[graphics/page]', err) }

  return (
    <>
      <Topbar title="Graphics Studio" description="AI-generated branded graphics for social media, email & print" />
      <GraphicsClient
        recentGraphics={recent.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }))}
      />
    </>
  )
}
