import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { captionGenerateSchema } from '@/lib/schemas/generate'
import { buildBrandPromptContext } from '@/lib/brands'
import { resolveBrandConfig } from '@/lib/brand-context'
import { buildIntentContext } from '@/lib/content-intent'
import { buildPlatformSystemPrompt } from '@/lib/platform-context'
import type { ContentIntent } from '@/lib/content-intent'
import Anthropic from '@anthropic-ai/sdk'
import type { BrandId } from '@/lib/brands'
import { prisma } from '@/lib/db'
import { estimateCost } from '@/lib/cost'

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
    keywords,
    referenceContent,
    referenceUrl,
    referenceImageUrl,
    intentTier1Id,
    intentTier2Id,
    intentPurposeId,
    intentCtaId,
    intentCustomCta,
    intentCtaPlacement,
    intentCustomTopic,
    intentCustomPurpose,
    contentPillar,
  } = parsed.data

  // Require topic, intent selection, or reference image
  if (!topic?.trim() && !intentTier1Id && !intentTier2Id && !intentCustomTopic?.trim() && !referenceImageUrl?.trim()) {
    return NextResponse.json(
      { message: 'Provide a topic, select a content category, or supply a reference image.' },
      { status: 400 },
    )
  }

  const brand      = await resolveBrandConfig((brandId ?? 'lhcapital') as BrandId, session.user.tenantId)
  const brandCtx   = buildBrandPromptContext(brand, 'copy')
  const count      = seriesCount ?? 1
  const isMultiple = count > 1
  const systemPrompt = buildPlatformSystemPrompt(platform, brandCtx, isMultiple ? 'series' : 'caption')

  // Build intent context
  const intent: ContentIntent = {
    tier1Id:       intentTier1Id       ?? null,
    tier2Id:       intentTier2Id       ?? null,
    purposeId:     intentPurposeId     ?? null,
    ctaId:         intentCtaId         ?? null,
    customCta:     intentCustomCta     ?? null,
    ctaPlacement:  intentCtaPlacement  ?? null,
    customTopic:   intentCustomTopic   ?? null,
    customPurpose: intentCustomPurpose ?? null,
  }
  const intentCtx = buildIntentContext(intent, count)

  const promptParts: string[] = []

  // Prepend intent block when present
  if (intentCtx) {
    promptParts.push(intentCtx, '')
  }

  promptParts.push(
    `Write ${isMultiple ? `${count} social media captions` : 'one social media caption'} for the following:`,
    `Platform: ${platform}`,
  )

  // Only include bare tone line when no purposeId (purpose already carries tone directive)
  if (!intentPurposeId) {
    promptParts.push(`Tone: ${tone}`)
  }

  // Content pillar shapes structure and intent
  if (contentPillar) {
    const pillarGuidance: Record<string, string> = {
      awareness:   'CONTENT PILLAR — Awareness: Surface the problem (employers overpaying payroll taxes, missing benefit opportunities) without pitching the solution yet. Create curiosity and recognition. Do not mention the SIMRP by name. End with a question or observation that makes the reader want to learn more.',
      education:   'CONTENT PILLAR — Education: Explain the mechanism clearly — how IRS §125/§105/§106 works, what redirecting FICA taxes means, why employers qualify. Use plain language. Reference the specific IRS code number. Break down the math ($550/employee, 7.65% FICA). Credentialed and detailed, not salesy.',
      'case-study':'CONTENT PILLAR — Case Study: Tell a before/after story. Include a specific company type/size, the specific savings amount, and what changed for employees. Concrete numbers over vague claims. Story-driven credibility. End with a result, not a pitch.',
      compliance:  'CONTENT PILLAR — Compliance & Trust: Address skepticism head-on. Cite IRS authorization (§125, §105, §106). Acknowledge that it sounds too good to be true and then explain why it is legal and established. Reference how long it has been in use. Authoritative and evidence-backed.',
      promotional: 'CONTENT PILLAR — Promotional: Bottom-of-funnel. Make a specific offer (free payroll tax analysis, 30-minute consultation). State the primary benefit in the first line. Include a clear, single CTA. Create appropriate urgency without false scarcity.',
    }
    promptParts.push('', pillarGuidance[contentPillar])
  }

  // Include topic as additional details when provided
  if (topic?.trim()) {
    promptParts.push(`Topic/details: ${topic.trim()}`)
  }

  promptParts.push(includeHashtags ? 'Include relevant hashtags.' : 'No hashtags.')

  if (keywords && keywords.length > 0) {
    promptParts.push(`Keywords to weave in naturally: ${keywords.join(', ')}`)
  }

  if (referenceContent?.trim()) {
    promptParts.push('', 'Reference material (use as context, do not copy verbatim):', referenceContent.trim())
  }
  if (referenceUrl?.trim()) {
    promptParts.push('', `Reference URL: ${referenceUrl.trim()}`)
  }
  if (referenceImageUrl?.trim()) {
    promptParts.push('', 'A reference image is attached — use it as the visual subject for the caption.')
  }

  if (isMultiple) {
    promptParts.push(
      '',
      `Return a JSON array of exactly ${count} objects. Each object must have this schema:`,
      `{ "body": "caption text without hashtags", "hashtags": ["#tag1", "#tag2"], "altText": "short accessible image description" }`,
      `hashtags should be an empty array [] when not requested. Output ONLY the JSON array — no markdown, no explanation.`,
    )
  } else {
    promptParts.push(
      '',
      'Return a single JSON object with this schema:',
      '{ "body": "caption text without hashtags", "hashtags": ["#tag1", "#tag2"], "altText": "short accessible image description" }',
      'hashtags should be an empty array [] when not requested. Output ONLY the JSON object — no markdown, no explanation.',
    )
  }

  const prompt = promptParts.join('\n')

  const messageContent = referenceImageUrl?.trim()
    ? [
        { type: 'image' as const, source: { type: 'url' as const, url: referenceImageUrl.trim() } },
        { type: 'text'  as const, text: prompt },
      ]
    : prompt

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  let message: Awaited<ReturnType<typeof client.messages.create>>
  try {
    message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: isMultiple ? 4096 : 2048,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: messageContent }],
    })
  } catch (err: any) {
    console.error('[caption] Anthropic API error:', err)
    return NextResponse.json({ message: err.message ?? 'Generation failed.' }, { status: 500 })
  }

  const raw  = message.content.find((b) => b.type === 'text')?.text?.trim() ?? ''
  const json = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim()

  const assetMeta = {
    model:       'claude-haiku-4-5-20251001',
    platform,
    cost:        estimateCost('claude-haiku-4-5-20251001'),
    contentPillar:     contentPillar || undefined,
    keywords:          keywords && keywords.length > 0 ? keywords : undefined,
    referenceContent:  referenceContent?.trim() || undefined,
    referenceUrl:      referenceUrl?.trim()     || undefined,
    referenceImageUrl: referenceImageUrl?.trim() || undefined,
    intent: {
      tier1Id:      intentTier1Id      ?? null,
      tier2Id:      intentTier2Id      ?? null,
      purposeId:    intentPurposeId    ?? null,
      ctaId:        intentCtaId        ?? null,
      hasCustomCta: !!(intentCustomCta),
    },
  }

  if (isMultiple) {
    let results: { body: string; hashtags: string[]; altText?: string }[] = []
    try {
      const parsed = JSON.parse(json)
      results = (Array.isArray(parsed) ? parsed : [parsed])
        .slice(0, count)
        .map((r: any) => ({
          body:     typeof r.body     === 'string' ? r.body.trim()    : String(r.body ?? ''),
          hashtags: Array.isArray(r.hashtags)       ? r.hashtags      : [],
          altText:  typeof r.altText  === 'string'  ? r.altText.trim(): undefined,
        }))
    } catch {
      // fallback: treat raw text as body, no hashtags
      results = [{ body: raw, hashtags: [] }]
    }

    try {
      await prisma.asset.create({
        data: {
          tenantId: session.user.tenantId,
          userId:   session.user.id,
          brandId:  brandId ?? null,
          type:     'CAPTION',
          status:   'READY',
          metadata: { ...assetMeta, seriesCount: count, results },
        },
      })
    } catch (err) {
      console.error('[caption] asset save failed:', err)
    }

    return NextResponse.json({ results })
  }

  let result: { body: string; hashtags: string[]; altText?: string }
  try {
    const parsed = JSON.parse(json)
    result = {
      body:     typeof parsed.body     === 'string' ? parsed.body.trim()    : String(parsed.body ?? ''),
      hashtags: Array.isArray(parsed.hashtags)       ? parsed.hashtags      : [],
      altText:  typeof parsed.altText  === 'string'  ? parsed.altText.trim(): undefined,
    }
  } catch {
    result = { body: raw, hashtags: [] }
  }

  try {
    await prisma.asset.create({
      data: {
        tenantId: session.user.tenantId,
        userId:   session.user.id,
        brandId:  brandId ?? null,
        type:     'CAPTION',
        status:   'READY',
        metadata: { ...assetMeta, seriesCount: 1, result },
      },
    })
  } catch (err) {
    console.error('[caption] asset save failed:', err)
  }

  return NextResponse.json({ result })
}
