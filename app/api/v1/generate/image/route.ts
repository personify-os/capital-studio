import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { imageGenerateSchema } from '@/lib/schemas/generate'
import { generateImages, enhanceImagePrompt } from '@/services/image'
import { resolveBrandConfig } from '@/lib/brand-context'
import { uploadFromUrl, makeAssetKey } from '@/lib/storage'
import { estimateCost } from '@/lib/cost'
import type { BrandId } from '@/lib/brands'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = imageGenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  const input = parsed.data
  const brandId = (input.brandId ?? 'lhcapital') as BrandId
  const brand   = await resolveBrandConfig(brandId, session.user.tenantId)

  // Build enriched prompt
  let finalPrompt = input.prompt
  if (input.enhancePrompt) {
    // Claude rewrites the prompt with cinematic detail + brand-appropriate visual style
    try {
      finalPrompt = await enhanceImagePrompt(input.prompt, brand)
    } catch (err) {
      console.error('[generate/image] prompt enhancement failed, using raw prompt:', err)
      finalPrompt = input.prompt
    }
  } else if (input.brandId && brand.visualStyle) {
    // Append brand visual style keywords — more useful to diffusion models than hex values
    finalPrompt = `${input.prompt}, ${brand.visualStyle}`
  }

  let urls: string[]
  try {
    urls = await generateImages(input, finalPrompt)
  } catch (err: any) {
    console.error('[generate/image]', err)
    return NextResponse.json({ message: err.message ?? 'Generation failed.' }, { status: 500 })
  }

  // Upload to R2 for permanent storage, then save to DB
  const assets = await Promise.all(
    urls.map(async (tempUrl) => {
      const key        = makeAssetKey(session.user.tenantId, 'images')
      const permanentUrl = await uploadFromUrl(tempUrl, key)

      return prisma.asset.create({
        data: {
          tenantId: session.user.tenantId,
          userId:   session.user.id,
          type:     'IMAGE',
          status:   'READY',
          s3Key:    key,
          s3Url:    permanentUrl,
          metadata: {
            prompt:         input.prompt,
            enhancedPrompt: input.enhancePrompt && finalPrompt !== input.prompt ? finalPrompt : undefined,
            model:          input.model,
            aspectRatio:    input.aspectRatio,
            brandId,
            cost:           estimateCost(input.model),
          },
        },
        select: { id: true, s3Url: true, createdAt: true },
      })
    }),
  )

  return NextResponse.json({ assets: assets.map((a) => ({ id: a.id, url: a.s3Url! })) })
}
