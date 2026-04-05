import Anthropic from '@anthropic-ai/sdk'
import { buildBrandPromptContext, getBrandConfig, type BrandConfig } from '@/lib/brands'
import { BANNED_PHRASES_RULE } from '@/lib/platform-context'
import type { GraphicGenerateInput } from '@/lib/schemas/generate'
import type { BrandId } from '@/lib/brands'

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function generateGraphicHtml(
  input:          GraphicGenerateInput,
  resolvedBrand?: BrandConfig,
): Promise<string> {
  const brand   = resolvedBrand ?? getBrandConfig(input.brandId as BrandId)
  const context = buildBrandPromptContext(brand, 'visual')
  const client  = getClient()

  const systemPrompt = `You are a professional marketing graphic designer.
Generate a single, complete, self-contained HTML file that renders a high-quality marketing graphic.

Rules:
- Use only inline styles and a single <style> block — no external resources
- Dimensions: per template spec (default 1080×1080px)
- Use the exact brand colors provided — no guessing
- The output must be ONLY the HTML — no markdown, no code fences, no explanation
- Typography: load via @import from Google Fonts (prefer Montserrat, Inter, or DM Sans)
- REQUIRED — container query units: set container-type: inline-size on the root element; use cqi units for ALL font sizes (headline: 7–9cqi, subtext: 2.5–3cqi, labels: 1.5–2cqi) and for all padding/gap/spacing. Never use px for type or layout sizing.
- REQUIRED — grain overlay: every graphic must include a grain texture via a ::after pseudo-element on the root:
  .graphic::after { content:''; position:absolute; inset:0; pointer-events:none; mix-blend-mode:overlay; opacity:0.055; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E"); }
- REQUIRED — photo treatment: when a photo is included as background or featured image, always apply filter: contrast(1.1) saturate(0.75) brightness(0.85) to prevent photos from overwhelming typography
- Err on the side of restraint: a slightly understated graphic is better than one that is oversaturated, over-brightened, or cluttered. Less is more.
- Make it visually polished and professional

Brand context:
${context}

${BANNED_PHRASES_RULE}`

  const userPrompt = buildGraphicUserPrompt(input)

  const message = await client.messages.create({
    model:      'claude-opus-4-5',
    max_tokens: 4096,
    messages: [{ role: 'user', content: userPrompt }],
    system: systemPrompt,
  })

  const text = message.content.find((b) => b.type === 'text')?.text ?? ''
  // Strip any accidental markdown code fences
  return text.replace(/^```html\n?/i, '').replace(/\n?```$/, '').trim()
}

function buildGraphicUserPrompt(input: GraphicGenerateInput): string {
  const parts: (string | null)[] = []

  // Template layout spec — full format description when available, bare ID as fallback
  if (input.templateFormat) {
    parts.push(
      `TEMPLATE LAYOUT SPEC (follow precisely):`,
      input.templateFormat,
      ``,
    )
  } else {
    parts.push(`Template: ${input.templateId}`)
  }

  // Content pillar shapes the graphic's message and visual tone
  if (input.contentPillar) {
    const PILLAR_GUIDANCE: Record<string, string> = {
      awareness:    'CONTENT PILLAR — Awareness: The graphic should surface a problem or create curiosity — do NOT show a solution name or pitch. Mood: thoughtful, slightly provocative.',
      education:    'CONTENT PILLAR — Education: The graphic should present a fact, statistic, or mechanism clearly. Lead with a specific number or IRS code reference. Mood: credible, informative.',
      'case-study': 'CONTENT PILLAR — Case Study: The graphic should tell a before/after story with a specific result. Show a concrete savings number. Mood: confident, results-focused.',
      compliance:   'CONTENT PILLAR — Compliance & Trust: The graphic should convey authority and legality. Reference IRS authorization. Mood: authoritative, reassuring.',
      promotional:  'CONTENT PILLAR — Promotional: The graphic should make a specific offer with a clear CTA. State the primary benefit immediately. Mood: direct, action-oriented.',
    }
    parts.push(``, PILLAR_GUIDANCE[input.contentPillar])
  }

  // Content
  parts.push(
    `Brand: ${input.brandId}`,
    `Headline: "${input.headline}"`,
    input.subtext  ? `Subtext: "${input.subtext}"` : null,
    input.cta      ? `Call to action: "${input.cta}"` : null,
    input.topic    ? `Topic/context: ${input.topic}` : null,
    input.photoUrl ? `Photo URL to include as background or featured image: ${input.photoUrl}` : null,
  )

  return parts.filter((p): p is string => p !== null).join('\n')
}
