import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { imageGenerateSchema } from '@/lib/schemas/generate'
import { generateImages } from '@/services/image'
import { buildBrandPromptContext, getBrandConfig } from '@/lib/brands'
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
  const brand   = getBrandConfig(brandId)

  // Build enriched prompt with brand context
  let finalPrompt = input.prompt
  if (input.enhancePrompt || input.brandId) {
    const brandCtx = buildBrandPromptContext(brand)
    finalPrompt = `${input.prompt}\n\nBrand context for visual style: ${brandCtx}`
  }

  let urls: string[]
  try {
    urls = await generateImages(input, finalPrompt)
  } catch (err: any) {
    console.error('[generate/image]', err)
    return NextResponse.json({ message: err.message ?? 'Generation failed.' }, { status: 500 })
  }

  // Save assets to DB
  const assets = await Promise.all(
    urls.map((url) =>
      prisma.asset.create({
        data: {
          tenantId: session.user.tenantId,
          userId:   session.user.id,
          type:     'IMAGE',
          status:   'READY',
          s3Url:    url,
          metadata: {
            prompt:      input.prompt,
            model:       input.model,
            aspectRatio: input.aspectRatio,
            brandId,
          },
        },
        select: { id: true, s3Url: true, createdAt: true },
      }),
    ),
  )

  return NextResponse.json({ assets: assets.map((a) => ({ id: a.id, url: a.s3Url! })) })
}
