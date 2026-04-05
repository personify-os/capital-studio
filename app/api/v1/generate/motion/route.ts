import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { motionGenerateSchema } from '@/lib/schemas/generate'
import { generateMotionVideo } from '@/services/video'
import { resolveBrandConfig } from '@/lib/brand-context'
import { buildBrandPromptContext } from '@/lib/brands'
import { uploadFromUrl, makeAssetKey } from '@/lib/storage'
import { estimateCost } from '@/lib/cost'
import type { BrandId } from '@/lib/brands'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = motionGenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  const { imageUrl, prompt, duration, aspectRatio, brandId } = parsed.data

  // Enrich motion prompt with brand visual style
  const brand         = await resolveBrandConfig((brandId ?? 'lhcapital') as BrandId, session.user.tenantId)
  const brandCtx      = buildBrandPromptContext(brand, 'visual')
  const enrichedPrompt = `${prompt}\n\nBrand visual style: ${brandCtx}`

  let videoUrl: string
  try {
    videoUrl = await generateMotionVideo(imageUrl, enrichedPrompt, duration, aspectRatio)
  } catch (err: any) {
    console.error('[generate/motion]', err)
    return NextResponse.json({ message: err.message ?? 'Generation failed.' }, { status: 500 })
  }

  const key = makeAssetKey(session.user.tenantId, 'videos', 'mp4')
  let permanentUrl: string
  let asset: { id: string; s3Url: string | null }
  try {
    permanentUrl = await uploadFromUrl(videoUrl, key, 'video/mp4')
    asset        = await prisma.asset.create({
      data: {
        tenantId: session.user.tenantId,
        userId:   session.user.id,
        type:     'MOTION',
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
          cost:    estimateCost('kling-motion'),
        },
      },
      select: { id: true, s3Url: true },
    })
  } catch (err) {
    console.error('[generate/motion] post-generation error:', err)
    return NextResponse.json({ message: 'Failed to save motion video.' }, { status: 500 })
  }

  return NextResponse.json({ asset: { id: asset.id, url: asset.s3Url } })
}
