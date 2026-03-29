import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildBrandPromptContext, getBrandConfig } from '@/lib/brands'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { BrandId } from '@/lib/brands'

const scriptSchema = z.object({
  topic:    z.string().min(1).max(500),
  duration: z.enum(['30', '60', '90', '120']).default('60'),
  brandId:  z.enum(['lhcapital', 'simrp', 'personal']).optional(),
})

// ~140 words per minute for professional voiceover
const WORDS_BY_DURATION: Record<string, number> = {
  '30':  70,
  '60':  140,
  '90':  210,
  '120': 280,
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = scriptSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input' }, { status: 400 })
  }

  const { topic, duration, brandId } = parsed.data
  const brand    = getBrandConfig((brandId ?? 'lhcapital') as BrandId)
  const brandCtx = buildBrandPromptContext(brand)
  const wordCount = WORDS_BY_DURATION[duration]

  const prompt = [
    `Write a professional voiceover script for the following topic:`,
    `Topic: ${topic}`,
    ``,
    `Requirements:`,
    `- Target length: ~${wordCount} words (approximately ${duration} seconds when read aloud)`,
    `- Write in a conversational, spoken style — not formal prose`,
    `- Use short sentences and natural pauses`,
    `- Opens with a hook that grabs attention`,
    `- Ends with a clear call to action or memorable closing line`,
    `- No stage directions, no [PAUSE] markers, no labels`,
    ``,
    `Brand context:`,
    brandCtx,
    ``,
    `Output only the script text — nothing else.`,
  ].join('\n')

  const client  = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const message = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages:   [{ role: 'user', content: prompt }],
  })

  const script = message.content.find((b) => b.type === 'text')?.text?.trim() ?? ''
  return NextResponse.json({ script })
}
