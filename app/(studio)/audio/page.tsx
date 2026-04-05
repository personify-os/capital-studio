import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { flags } from '@/lib/flags'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import AudioClient from './AudioClient'

interface RawAudio {
  id: string; s3Url: string | null; metadata: { text?: string; voiceName?: string; title?: string; brandId?: string } | null; createdAt: Date
}

export default async function AudioPage() {
  if (!flags.voiceover) redirect('/dashboard')
  const session = await getServerSession(authOptions)
  if (!session) return null

  let recent: RawAudio[] = []
  try {
    recent = (await prisma.asset.findMany({
      where:   { tenantId: session.user.tenantId, type: 'VOICEOVER', status: 'READY' },
      orderBy: { createdAt: 'desc' },
      take:    12,
      select:  { id: true, s3Url: true, metadata: true, createdAt: true },
    })) as RawAudio[]
  } catch (err) { console.error('[audio/page]', err) }

  return (
    <>
      <Topbar title="VoiceOver Studio" description="Generate professional voiceovers with ElevenLabs AI voices" />
      <AudioClient
        recentAudio={recent.map((r) => ({ ...r, s3Url: r.s3Url ?? '', createdAt: r.createdAt.toISOString() }))}
      />
    </>
  )
}
