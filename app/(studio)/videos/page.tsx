import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import VideosClient from './VideosClient'

interface RawVideo {
  id: string; s3Url: string | null; metadata: unknown; createdAt: Date
}

export default async function VideosPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const recent = (await prisma.asset.findMany({
    where:   { tenantId: session.user.tenantId, type: 'VIDEO', status: 'READY' },
    orderBy: { createdAt: 'desc' },
    take:    12,
    select:  { id: true, s3Url: true, metadata: true, createdAt: true },
  })) as RawVideo[]

  return (
    <>
      <Topbar title="Video Studio" description="Generate AI videos with Kling, MiniMax, and HunyuanVideo" />
      <VideosClient
        recentVideos={recent.map((r) => ({ ...r, s3Url: r.s3Url ?? '', createdAt: r.createdAt.toISOString() }))}
      />
    </>
  )
}
