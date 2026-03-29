import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { videoGenerateSchema } from '@/lib/schemas/generate'
import { generateVideo } from '@/services/video'
import { uploadFromUrl, makeAssetKey } from '@/lib/storage'
import { estimateCost } from '@/lib/cost'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = videoGenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  let videoUrl: string
  try {
    videoUrl = await generateVideo(parsed.data)
  } catch (err: any) {
    console.error('[generate/video]', err)
    return NextResponse.json({ message: err.message ?? 'Generation failed.' }, { status: 500 })
  }

  const key          = makeAssetKey(session.user.tenantId, 'videos', 'mp4')
  const permanentUrl = await uploadFromUrl(videoUrl, key, 'video/mp4')

  const asset = await prisma.asset.create({
    data: {
      tenantId: session.user.tenantId,
      userId:   session.user.id,
      type:     'VIDEO',
      status:   'READY',
      s3Key:    key,
      s3Url:    permanentUrl,
      metadata: {
        prompt:      parsed.data.prompt,
        model:       parsed.data.model,
        duration:    parsed.data.duration,
        aspectRatio: parsed.data.aspectRatio,
        brandId:     parsed.data.brandId,
        cost:        estimateCost(parsed.data.model),
      },
    },
    select: { id: true, s3Url: true, createdAt: true, metadata: true },
  })

  return NextResponse.json({ asset: { id: asset.id, url: asset.s3Url } })
}
