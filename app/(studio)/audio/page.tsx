import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import AudioClient from './AudioClient'

interface RawAudio {
  id: string; s3Url: string | null; metadata: unknown; createdAt: Date
}

export default async function AudioPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const recent = (await prisma.asset.findMany({
    where:   { tenantId: session.user.tenantId, type: 'VOICEOVER', status: 'READY' },
    orderBy: { createdAt: 'desc' },
    take:    12,
    select:  { id: true, s3Url: true, metadata: true, createdAt: true },
  })) as RawAudio[]

  return (
    <>
      <Topbar title="VoiceOver Studio" description="Generate professional voiceovers with ElevenLabs AI voices" />
      <AudioClient
        recentAudio={recent.map((r) => ({ ...r, s3Url: r.s3Url ?? '', createdAt: r.createdAt.toISOString() }))}
      />
    </>
  )
}
