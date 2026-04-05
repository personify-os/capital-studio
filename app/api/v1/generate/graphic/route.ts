import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { graphicGenerateSchema } from '@/lib/schemas/generate'
import { generateGraphicHtml } from '@/services/graphics'
import { resolveBrandConfig } from '@/lib/brand-context'
import type { BrandId } from '@/lib/brands'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = graphicGenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  const brandId = (parsed.data.brandId ?? 'lhcapital') as BrandId
  const brand   = await resolveBrandConfig(brandId, session.user.tenantId)

  let html: string
  try {
    html = await generateGraphicHtml(parsed.data, brand)
  } catch (err: any) {
    console.error('[generate/graphic]', err)
    return NextResponse.json({ message: err.message ?? 'Generation failed.' }, { status: 500 })
  }

  let asset: { id: string; htmlContent: string | null }
  try {
    asset = await prisma.asset.create({
      data: {
        tenantId:    session.user.tenantId,
        userId:      session.user.id,
        type:        'GRAPHIC',
        status:      'READY',
        htmlContent: html,
        metadata: {
          templateId:     parsed.data.templateId,
          templateFormat: parsed.data.templateFormat ?? undefined,
          brandId:        parsed.data.brandId,
          headline:       parsed.data.headline,
          subtext:        parsed.data.subtext        ?? undefined,
          cta:            parsed.data.cta            ?? undefined,
          topic:          parsed.data.topic          ?? undefined,
          photoUrl:       parsed.data.photoUrl       ?? undefined,
          contentPillar:  parsed.data.contentPillar  ?? undefined,
        },
      },
      select: { id: true, htmlContent: true },
    })
  } catch (err) {
    console.error('[generate/graphic] DB save error:', err)
    return NextResponse.json({ message: 'Failed to save graphic.' }, { status: 500 })
  }

  return NextResponse.json({ asset: { id: asset.id, html: asset.htmlContent } })
}
