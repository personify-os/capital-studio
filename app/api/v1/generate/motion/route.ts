import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { motionGenerateSchema } from '@/lib/schemas/generate'
import { generateMotionVideo } from '@/services/video'
import { uploadFromUrl, makeAssetKey } from '@/lib/storage'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = motionGenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  const { imageUrl, prompt, duration, aspectRatio, brandId } = parsed.data

  let videoUrl: string
  try {
    videoUrl = await generateMotionVideo(imageUrl, prompt, duration, aspectRatio)
  } catch (err: any) {
    console.error('[generate/motion]', err)
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
        imageUrl,
        prompt,
        aspectRatio,
        duration,
        source:  'motion',
        brandId,
      },
    },
    select: { id: true, s3Url: true },
  })

  return NextResponse.json({ asset: { id: asset.id, url: asset.s3Url } })
}
