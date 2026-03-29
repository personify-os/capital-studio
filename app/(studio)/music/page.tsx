import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import MusicClient from './MusicClient'

interface RawTrack {
  id: string; s3Url: string | null; metadata: unknown; createdAt: Date
}

export default async function MusicPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const tracks = (await prisma.asset.findMany({
    where:   { tenantId: session.user.tenantId, type: 'VOICEOVER' },
    orderBy: { createdAt: 'desc' },
    take:    20,
    select:  { id: true, s3Url: true, metadata: true, createdAt: true },
  })) as RawTrack[]

  return (
    <>
      <Topbar title="Music Studio" description="Generate AI music for your videos with Suno" />
      <MusicClient
        recentTracks={tracks.map((t) => ({
          ...t,
          s3Url:     t.s3Url ?? '',
          createdAt: t.createdAt.toISOString(),
        }))}
      />
    </>
  )
}
