import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildBrandPromptContext } from '@/lib/brands'
import { resolveBrandConfig } from '@/lib/brand-context'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { BrandId } from '@/lib/brands'

const enhanceSchema = z.object({
  prompt:  z.string().min(1).max(1000),
  type:    z.enum(['video', 'image']),
  brandId: z.enum(['lhcapital', 'simrp', 'personal']).optional(),
})

const TYPE_INSTRUCTIONS: Record<string, string> = {
  video: [
    'Expand this into a detailed cinematic video prompt for an AI video generator.',
    'Include: subject description, setting/environment, camera movement (pan, dolly, static, aerial), lighting style, mood, and visual style.',
    'Incorporate the brand visual style above — colors, atmosphere, and aesthetic. Keep it under 200 words.',
    'Write only the enhanced prompt — no explanation, no preamble.',
  ].join(' '),
  image: [
    'Expand this into a detailed image generation prompt.',
    'Include: subject, composition (rule of thirds, framing), lighting, style, color palette, and mood.',
    'Incorporate the brand visual style above — colors and aesthetic direction. Keep it under 150 words.',
    'Write only the enhanced prompt — no explanation, no preamble.',
  ].join(' '),
}

function buildEnhanceSystemPrompt(brandCtx: string): string {
  return [
    `You are an expert AI prompt engineer specializing in visual content for financial services and professional B2B brands.`,
    `Your enhanced prompts are specific, cinematic, and produce on-brand results — never generic stock-photo aesthetics.`,
    ``,
    `═══════════════════════════════`,
    `BRAND VISUAL CONTEXT`,
    `═══════════════════════════════`,
    brandCtx,
    ``,
    `═══════════════════════════════`,
    `ENHANCEMENT RULES`,
    `═══════════════════════════════`,
    `- Translate abstract ideas into concrete visual language (e.g., "trust" → "warm side lighting, steady camera, direct eye contact")`,
    `- Reference the brand's color palette and visual style in the prompt`,
    `- Avoid: "beautiful", "amazing", "stunning" — use specific descriptors instead`,
    `- Avoid: generic business imagery (empty boardrooms, handshakes, clip-art charts)`,
    `- Prefer: real environments, authentic human moments, purposeful composition`,
    `- Always write the output as a direct prompt string — no meta-commentary`,
  ].join('\n')
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = enhanceSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input' }, { status: 400 })
  }

  const { prompt, type, brandId } = parsed.data
  const brand        = await resolveBrandConfig((brandId ?? 'lhcapital') as BrandId, session.user.tenantId)
  const brandCtx     = buildBrandPromptContext(brand, 'visual')
  const systemPrompt = buildEnhanceSystemPrompt(brandCtx)
  const instr        = TYPE_INSTRUCTIONS[type]

  const userPrompt = [
    `Original prompt: "${prompt}"`,
    ``,
    instr,
  ].join('\n')

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  let message: Awaited<ReturnType<typeof client.messages.create>>
  try {
    message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: type === 'video' ? 450 : 350,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: userPrompt }],
    })
  } catch (err: any) {
    console.error('[enhance] Anthropic API error:', err)
    return NextResponse.json({ message: err.message ?? 'Enhancement failed.' }, { status: 500 })
  }

  const enhanced = message.content.find((b) => b.type === 'text')?.text?.trim() ?? prompt
  return NextResponse.json({ prompt: enhanced })
}
