import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { captionGenerateSchema } from '@/lib/schemas/generate'
import { buildBrandPromptContext, getBrandConfig } from '@/lib/brands'
import Anthropic from '@anthropic-ai/sdk'
import type { BrandId } from '@/lib/brands'

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

  const { platform, tone, topic, brandId, includeHashtags, seriesCount, referenceContent, referenceUrl } = parsed.data
  const brand      = getBrandConfig((brandId ?? 'lhcapital') as BrandId)
  const brandCtx   = buildBrandPromptContext(brand)
  const platGuide  = PLATFORM_GUIDANCE[platform] ?? platform
  const count      = seriesCount ?? 1
  const isMultiple = count > 1

  const promptParts = [
    `Write ${isMultiple ? `${count} social media captions` : 'one social media caption'} for the following:`,
    `Platform: ${platGuide}`,
    `Tone: ${tone}`,
    `Topic: ${topic}`,
    includeHashtags ? 'Include relevant hashtags.' : 'No hashtags.',
    '',
    'Brand context:',
    brandCtx,
  ]

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

  if (isMultiple) {
    // Parse numbered list into array
    const captions = text
      .split(/\n\d+\.\s+/)
      .map((s) => s.trim())
      .filter(Boolean)
    // Drop the first empty split if numbering started at line 0
    const result = captions[0]?.match(/^\d+\./) ? captions.slice(1) : captions
    return NextResponse.json({ captions: result.slice(0, count) })
  }

  return NextResponse.json({ caption: text })
}
