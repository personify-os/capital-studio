import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { audioGenerateSchema } from '@/lib/schemas/generate'
import { generateVoiceover, VOICES } from '@/services/audio'
import { uploadBuffer, makeAssetKey } from '@/lib/storage'
import { estimateCost } from '@/lib/cost'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = audioGenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  let audioBuffer: Buffer
  try {
    audioBuffer = await generateVoiceover(parsed.data)
  } catch (err: any) {
    console.error('[generate/audio]', err)
    return NextResponse.json({ message: err.message ?? 'Generation failed.' }, { status: 500 })
  }

  const voice    = VOICES.find((v) => v.id === parsed.data.voiceId)
  const key      = makeAssetKey(session.user.tenantId, 'audio', 'mp3')
  let audioUrl: string
  let asset: { id: string; s3Url: string | null }
  try {
    audioUrl = await uploadBuffer(audioBuffer, key, 'audio/mpeg')
    asset    = await prisma.asset.create({
      data: {
        tenantId: session.user.tenantId,
        userId:   session.user.id,
        type:     'VOICEOVER',
        status:   'READY',
        s3Key:    key,
        s3Url:    audioUrl,
        metadata: {
          text:      parsed.data.text.slice(0, 200),
          voiceId:   parsed.data.voiceId,
          voiceName: voice?.name ?? parsed.data.voiceId,
          brandId:   parsed.data.brandId,
          model:     parsed.data.voiceId,
          cost:      estimateCost(parsed.data.voiceId),
        },
      },
      select: { id: true, s3Url: true },
    })
  } catch (err) {
    console.error('[generate/audio] post-generation error:', err)
    return NextResponse.json({ message: 'Failed to save audio.' }, { status: 500 })
  }

  return NextResponse.json({ asset: { id: asset.id, url: asset.s3Url } })
}
