import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildBrandPromptContext, getBrandConfig } from '@/lib/brands'
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
    'Include: subject description, setting/environment, camera movement, lighting style, mood, and visual style.',
    'Keep it under 200 words. Write only the enhanced prompt — no explanation.',
  ].join(' '),
  image: [
    'Expand this into a detailed image generation prompt.',
    'Include: subject, composition, lighting, style, color palette, and mood.',
    'Keep it under 150 words. Write only the enhanced prompt — no explanation.',
  ].join(' '),
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
  const brand    = getBrandConfig((brandId ?? 'lhcapital') as BrandId)
  const brandCtx = buildBrandPromptContext(brand)
  const instr    = TYPE_INSTRUCTIONS[type]

  const userPrompt = [
    `Original prompt: "${prompt}"`,
    ``,
    instr,
    ``,
    `Brand context (for visual style alignment):`,
    brandCtx,
  ].join('\n')

  const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages:   [{ role: 'user', content: userPrompt }],
  })

  const enhanced = message.content.find((b) => b.type === 'text')?.text?.trim() ?? prompt
  return NextResponse.json({ prompt: enhanced })
}
