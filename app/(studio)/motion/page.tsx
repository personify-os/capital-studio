import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { flags } from '@/lib/flags'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import MotionClient from './MotionClient'

interface RawVideo {
  id: string; s3Url: string | null; metadata: unknown; createdAt: Date
}

export default async function MotionPage() {
  if (!flags.motionVideo) redirect('/dashboard')
  const session = await getServerSession(authOptions)
  if (!session) return null

  let motionVideos: RawVideo[] = []
  try {
    motionVideos = (await prisma.asset.findMany({
      where:   { tenantId: session.user.tenantId, type: 'MOTION', status: 'READY' },
      orderBy: { createdAt: 'desc' },
      take:    12,
      select:  { id: true, s3Url: true, metadata: true, createdAt: true },
    })) as RawVideo[]
  } catch (err) { console.error('[motion/page]', err) }

  return (
    <>
      <Topbar title="Motion Studio" description="Animate still images into dynamic videos with Kling AI" />
      <MotionClient
        recentVideos={(motionVideos as RawVideo[]).map((r) => ({
          ...r,
          s3Url:     r.s3Url ?? '',
          createdAt: r.createdAt.toISOString(),
        }))}
      />
    </>
  )
}
