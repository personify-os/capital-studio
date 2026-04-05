import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { flags } from '@/lib/flags'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import VideosClient from './VideosClient'

interface RawVideo {
  id: string; s3Url: string | null; metadata: unknown; createdAt: Date
}

export default async function VideosPage() {
  if (!flags.videoGeneration) redirect('/dashboard')
  const session = await getServerSession(authOptions)
  if (!session) return null

  let recent: RawVideo[] = []
  try {
    recent = (await prisma.asset.findMany({
      where:   { tenantId: session.user.tenantId, type: 'VIDEO', status: 'READY' },
      orderBy: { createdAt: 'desc' },
      take:    12,
      select:  { id: true, s3Url: true, metadata: true, createdAt: true },
    })) as RawVideo[]
  } catch (err) { console.error('[videos/page]', err) }

  return (
    <>
      <Topbar title="Video Studio" description="Generate AI videos with Kling, MiniMax, and HunyuanVideo" />
      <VideosClient
        recentVideos={recent.map((r) => ({ ...r, s3Url: r.s3Url ?? '', createdAt: r.createdAt.toISOString() }))}
      />
    </>
  )
}
