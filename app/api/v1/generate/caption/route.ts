import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { captionGenerateSchema } from '@/lib/schemas/generate'
import { buildBrandPromptContext, getBrandConfig } from '@/lib/brands'
import { buildIntentContext } from '@/lib/content-intent'
import type { ContentIntent } from '@/lib/content-intent'
import Anthropic from '@anthropic-ai/sdk'
import type { BrandId } from '@/lib/brands'
import { prisma } from '@/lib/db'
import { estimateCost } from '@/lib/cost'

const PLATFORM_GUIDANCE: Record<string, string> = {
  instagram:  'Instagram: engaging, visual-first, 150–220 chars + 5–10 hashtags',
  facebook:   'Facebook: conversational, slightly longer, 1–3 short paragraphs, optional hashtags',
  linkedin:   'LinkedIn: professional, insight-driven, 3–5 short paragraphs, no excessive hashtags',
  x:          'X (Twitter): punchy, under 280 chars, 1–2 hashtags max',
  youtube:    'YouTube: descriptive, 200–300 chars, include keywords naturally',
  tiktok:     'TikTok: casual, trend-aware, energetic, 3–5 hashtags',
  threads:    'Threads: conversational, concise, 1–2 sentences',
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = captionGenerateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input' }, { status: 400 })
  }

  const {
    platform,
    tone,
    topic,
    brandId,
    includeHashtags,
    seriesCount,
    referenceContent,
    referenceUrl,
    intentTier1Id,
    intentTier2Id,
    intentPurposeId,
    intentCtaId,
    intentCustomCta,
    intentCtaPlacement,
  } = parsed.data

  // Require topic or at least a tier1 intent selection
  if (!topic?.trim() && !intentTier1Id && !intentTier2Id) {
    return NextResponse.json(
      { message: 'Provide a topic or select a content category.' },
      { status: 400 },
    )
  }

  const brand     = getBrandConfig((brandId ?? 'lhcapital') as BrandId)
  const brandCtx  = buildBrandPromptContext(brand)
  const platGuide = PLATFORM_GUIDANCE[platform] ?? platform
  const count     = seriesCount ?? 1
  const isMultiple = count > 1

  // Build intent context
  const intent: ContentIntent = {
    tier1Id:      intentTier1Id      ?? null,
    tier2Id:      intentTier2Id      ?? null,
    purposeId:    intentPurposeId    ?? null,
    ctaId:        intentCtaId        ?? null,
    customCta:    intentCustomCta    ?? null,
    ctaPlacement: intentCtaPlacement ?? null,
  }
  const intentCtx = buildIntentContext(intent, count)

  const promptParts: string[] = []

  // Prepend intent block when present
  if (intentCtx) {
    promptParts.push(intentCtx, '')
  }

  promptParts.push(
    `Write ${isMultiple ? `${count} social media captions` : 'one social media caption'} for the following:`,
    `Platform: ${platGuide}`,
  )

  // Only include bare tone line when no purposeId (purpose already carries tone directive)
  if (!intentPurposeId) {
    promptParts.push(`Tone: ${tone}`)
  }

  // Include topic as additional details when provided
  if (topic?.trim()) {
    promptParts.push(`Additional details: ${topic.trim()}`)
  }

  promptParts.push(includeHashtags ? 'Include relevant hashtags.' : 'No hashtags.')

  promptParts.push('', 'Brand context:', brandCtx)

  if (referenceContent?.trim()) {
    promptParts.push('', 'Reference material (use as context, do not copy verbatim):', referenceContent.trim())
  }
  if (referenceUrl?.trim()) {
    promptParts.push('', `Reference URL: ${referenceUrl.trim()}`)
  }

  promptParts.push(
    '',
    isMultiple
      ? `Format your response as a numbered list: 1. [caption] 2. [caption] etc. Each caption should be distinct.`
      : 'Output only the caption text — no labels, no explanation.',
  )

  const prompt = promptParts.join('\n')

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages:   [{ role: 'user', content: prompt }],
  })

  const text = message.content.find((b) => b.type === 'text')?.text?.trim() ?? ''

  // Persist CAPTION asset for analytics tracking
  try {
    await prisma.asset.create({
      data: {
        tenantId: session.user.tenantId,
        userId:   session.user.id,
        brandId:  brandId ?? null,
        type:     'CAPTION',
        status:   'READY',
        metadata: {
          model:       'claude-haiku-4-5-20251001',
          platform,
          seriesCount: count,
          cost:        estimateCost('claude-haiku-4-5-20251001'),
          intent: {
            tier1Id:      intentTier1Id      ?? null,
            tier2Id:      intentTier2Id      ?? null,
            purposeId:    intentPurposeId    ?? null,
            ctaId:        intentCtaId        ?? null,
            hasCustomCta: !!(intentCustomCta),
          },
        },
      },
    })
  } catch (err) {
    console.error('[caption] asset save failed:', err)
    // Non-fatal — generation already succeeded
  }

  if (isMultiple) {
    const captions = text
      .split(/\n\d+\.\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
    const result = captions[0]?.match(/^\d+\./) ? captions.slice(1) : captions
    return NextResponse.json({ captions: result.slice(0, count) })
  }

  return NextResponse.json({ caption: text })
}
