import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { buildBrandPromptContext } from '@/lib/brands'
import { resolveBrandConfig } from '@/lib/brand-context'
import { buildVoiceoverSystemPrompt } from '@/lib/platform-context'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { BrandId } from '@/lib/brands'

const scriptSchema = z.object({
  topic:         z.string().min(1).max(500),
  duration:      z.enum(['30', '60', '90', '120']).default('60'),
  brandId:       z.enum(['lhcapital', 'simrp', 'personal']).optional(),
  contentPillar: z.enum(['awareness', 'education', 'case-study', 'compliance', 'promotional']).optional(),
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

  const { topic, duration, brandId, contentPillar } = parsed.data
  const brand        = await resolveBrandConfig((brandId ?? 'lhcapital') as BrandId, session.user.tenantId)
  const brandCtx     = buildBrandPromptContext(brand, 'copy')
  const wordCount    = WORDS_BY_DURATION[duration]
  const systemPrompt = buildVoiceoverSystemPrompt(brandCtx)

  const PILLAR_GUIDANCE: Record<string, string> = {
    awareness:    'CONTENT PILLAR — Awareness: Surface the problem (employers overpaying payroll taxes, missing benefit opportunities). Do not pitch the solution by name yet. Create curiosity. End with a question or observation.',
    education:    'CONTENT PILLAR — Education: Explain the mechanism clearly — IRS §125/§105/§106, how FICA redirect works, the math ($550/employee, 7.65%). Plain language, credentialed detail. Reference the specific code numbers.',
    'case-study': 'CONTENT PILLAR — Case Study: Tell a before/after story. Specific company type, specific savings number, what changed for employees. Story-driven, concrete numbers over vague claims.',
    compliance:   'CONTENT PILLAR — Compliance & Trust: Address skepticism head-on. Cite IRS authorization, acknowledge it sounds too good to be true, explain why it is legal and established. Authoritative and evidence-backed.',
    promotional:  'CONTENT PILLAR — Promotional: Make a specific offer (free analysis, 30-minute consultation). State the primary benefit in the opening seconds. One clear CTA at the close.',
  }

  const promptParts = [
    `Write a professional voiceover script for the following topic:`,
    `Topic: ${topic}`,
    ``,
    ...(contentPillar ? [`${PILLAR_GUIDANCE[contentPillar]}`, ``] : []),
    `Requirements:`,
    `- Target length: ~${wordCount} words (approximately ${duration} seconds when read aloud)`,
    `- Conversational spoken style — short sentences, natural rhythm`,
    `- Opens with a hook that grabs attention immediately`,
    `- Ends with a clear call to action or memorable closing line`,
    `- No stage directions, no [PAUSE] markers, no labels`,
    ``,
    `Output only the script text — nothing else.`,
  ]

  const prompt = promptParts.join('\n')

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  let message: Awaited<ReturnType<typeof client.messages.create>>
  try {
    message = await client.messages.create({
      model:      'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system:     systemPrompt,
      messages:   [{ role: 'user', content: prompt }],
    })
  } catch (err: any) {
    console.error('[generate/script] Anthropic API error:', err)
    return NextResponse.json({ message: err.message ?? 'Script generation failed.' }, { status: 500 })
  }

  const script = message.content.find((b) => b.type === 'text')?.text?.trim() ?? ''
  return NextResponse.json({ script })
}
