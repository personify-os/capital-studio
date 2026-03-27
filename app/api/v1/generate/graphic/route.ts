import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { graphicGenerateSchema } from '@/lib/schemas/generate'
import { generateGraphicHtml } from '@/services/graphics'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = graphicGenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  let html: string
  try {
    html = await generateGraphicHtml(parsed.data)
  } catch (err: any) {
    console.error('[generate/graphic]', err)
    return NextResponse.json({ message: err.message ?? 'Generation failed.' }, { status: 500 })
  }

  const asset = await prisma.asset.create({
    data: {
      tenantId:    session.user.tenantId,
      userId:      session.user.id,
      type:        'GRAPHIC',
      status:      'READY',
      htmlContent: html,
      metadata: {
        templateId: parsed.data.templateId,
        brandId:    parsed.data.brandId,
        headline:   parsed.data.headline,
      },
    },
    select: { id: true, htmlContent: true, createdAt: true },
  })

  return NextResponse.json({ asset: { id: asset.id, html: asset.htmlContent } })
}
