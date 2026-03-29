import Anthropic from '@anthropic-ai/sdk'
import { buildBrandPromptContext, getBrandConfig } from '@/lib/brands'
import type { GraphicGenerateInput } from '@/lib/schemas/generate'
import type { BrandId } from '@/lib/brands'

function getClient() {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

export async function generateGraphicHtml(input: GraphicGenerateInput): Promise<string> {
  const brand   = getBrandConfig(input.brandId as BrandId)
  const context = buildBrandPromptContext(brand)
  const client  = getClient()

  const systemPrompt = `You are a professional marketing graphic designer.
Generate a single, complete, self-contained HTML file that renders a high-quality marketing graphic.

Rules:
- Use only inline styles and a single <style> block — no external resources
- Dimensions: 1080×1080px (social media square) unless the template specifies otherwise
- Use the exact brand colors provided
- The output must be ONLY the HTML — no markdown, no code fences, no explanation
- Typography: use system-ui or a Google Font loaded via @import
- Make it visually polished and professional

Brand context:
${context}`

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
  const parts = [
    `Template: ${input.templateId}`,
    `Brand: ${input.brandId}`,
    `Headline: "${input.headline}"`,
    input.subtext  ? `Subtext: "${input.subtext}"` : null,
    input.cta      ? `Call to action: "${input.cta}"` : null,
    input.topic    ? `Topic/context: ${input.topic}` : null,
    input.photoUrl ? `Photo to include as background or featured image: ${input.photoUrl}` : null,
  ]
  return parts.filter(Boolean).join('\n')
}
