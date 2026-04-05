import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { musicGenerateSchema } from '@/lib/schemas/generate'
import { generateMusic } from '@/services/music'
import { uploadFromUrl, makeAssetKey } from '@/lib/storage'
import { estimateCost } from '@/lib/cost'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = musicGenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  const input = parsed.data

  let track: { url: string; title?: string; duration?: number }
  try {
    track = await generateMusic(input)
  } catch (err: any) {
    console.error('[generate/music]', err)
    return NextResponse.json({ message: err.message ?? 'Generation failed.' }, { status: 500 })
  }

  const tenantId = session.user.tenantId
  const key      = makeAssetKey(tenantId, 'audio', 'mp3')
  let permanentUrl: string
  let asset: { id: string; s3Url: string | null }
  try {
    permanentUrl = await uploadFromUrl(track.url, key, 'audio/mpeg')
    asset        = await prisma.asset.create({
      data: {
        tenantId,
        userId:   session.user.id,
        type:     'MUSIC',
        status:   'READY',
        s3Key:    key,
        s3Url:    permanentUrl,
        metadata: {
          description:  input.description,
          style:        input.style,
          instrumental: input.instrumental,
          model:        input.model,
          source:       'music',
          brandId:      input.brandId,
          title:        track.title,
          duration:     track.duration,
          cost:         estimateCost(input.model),
        },
      },
      select: { id: true, s3Url: true },
    })
  } catch (err) {
    console.error('[generate/music] post-generation error:', err)
    return NextResponse.json({ message: 'Failed to save music track.' }, { status: 500 })
  }

  return NextResponse.json({
    asset: {
      id:    asset.id,
      url:   asset.s3Url,
      title: track.title,
    },
  })
}
