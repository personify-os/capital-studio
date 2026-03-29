import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import MotionClient from './MotionClient'

interface RawVideo {
  id: string; s3Url: string | null; metadata: unknown; createdAt: Date
}

export default async function MotionPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const recent = (await prisma.asset.findMany({
    where:   { tenantId: session.user.tenantId, type: 'VIDEO', status: 'READY' },
    orderBy: { createdAt: 'desc' },
    take:    12,
    select:  { id: true, s3Url: true, metadata: true, createdAt: true },
  })) as RawVideo[]

  const motionVideos = recent.filter((r) => {
    const meta = r.metadata as Record<string, unknown> | null
    return meta?.source === 'motion'
  })

  return (
    <>
      <Topbar title="Motion Studio" description="Animate still images into dynamic videos with Kling AI" />
      <MotionClient
        recentVideos={motionVideos.map((r) => ({
          ...r,
          s3Url:     r.s3Url ?? '',
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </>
  )
}
