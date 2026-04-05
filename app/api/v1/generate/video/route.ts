import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { videoGenerateSchema } from '@/lib/schemas/generate'
import { generateVideo } from '@/services/video'
import { enhanceImagePrompt } from '@/services/image'
import { resolveBrandConfig } from '@/lib/brand-context'
import { uploadFromUrl, makeAssetKey } from '@/lib/storage'
import { estimateCost } from '@/lib/cost'
import type { BrandId } from '@/lib/brands'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = videoGenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  const brandId = (parsed.data.brandId ?? 'lhcapital') as BrandId
  const brand   = await resolveBrandConfig(brandId, session.user.tenantId)

  let finalPrompt = parsed.data.prompt
  try {
    finalPrompt = await enhanceImagePrompt(parsed.data.prompt, brand)
  } catch (err) {
    console.error('[generate/video] prompt enhancement failed, using raw prompt:', err)
  }

  let videoUrl: string
  try {
    videoUrl = await generateVideo({ ...parsed.data, prompt: finalPrompt })
  } catch (err: any) {
    console.error('[generate/video]', err)
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
        type:     'VIDEO',
        status:   'READY',
        s3Key:    key,
        s3Url:    permanentUrl,
        metadata: {
          prompt:         parsed.data.prompt,
          enhancedPrompt: finalPrompt !== parsed.data.prompt ? finalPrompt : undefined,
          model:          parsed.data.model,
          duration:       parsed.data.duration,
          aspectRatio:    parsed.data.aspectRatio,
          brandId:        parsed.data.brandId,
          cost:           estimateCost(parsed.data.model),
        },
      },
      select: { id: true, s3Url: true },
    })
  } catch (err) {
    console.error('[generate/video] post-generation error:', err)
    return NextResponse.json({ message: 'Failed to save video.' }, { status: 500 })
  }

  return NextResponse.json({ asset: { id: asset.id, url: asset.s3Url } })
}
