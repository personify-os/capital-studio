import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withTenant } from '@/lib/db'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import { buildBrandPromptContext, type BrandId } from '@/lib/brands'
import { resolveBrandConfig } from '@/lib/brand-context'
import { buildPlatformSystemPrompt } from '@/lib/platform-context'
import { withRetry, isTransient } from '@/lib/retry'
import { estimateCost } from '@/lib/cost'
import { rowToBrief, type PlanRow } from '@/lib/plan-parse'

const CAPTION_MODELS = ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-8'] as const
const MAX_ROWS = 60

const planRowSchema = z.object({
  day: z.string().optional(), week: z.string().optional(), audience: z.string().optional(),
  theme: z.string().optional(), platforms: z.string().optional(), hook: z.string().optional(),
  copy: z.string().optional(), cta: z.string().optional(), format: z.string().optional(),
})

const bodySchema = z.object({
  brandId: z.enum(['lhcapital', 'simrp', 'espa', 'personal']),
  model:   z.enum(CAPTION_MODELS).default('claude-haiku-4-5-20251001'),
  rows:    z.array(planRowSchema).min(1).max(MAX_ROWS),
})

// Map a plan's free-text "Platform(s)" cell to a single platform for generation.
function pickPlatform(raw?: string): string {
  const s = (raw ?? '').toLowerCase()
  const first = s.split(/[,/]/)[0].trim()
  const test = first || s
  if (test.includes('linkedin'))                       return 'linkedin'
  if (test.includes('instagram') || test === 'ig')     return 'instagram'
  if (test.includes('facebook')  || test === 'fb')     return 'facebook'
  if (test.includes('tiktok'))                         return 'tiktok'
  if (test.includes('youtube')   || test === 'yt')     return 'youtube'
  if (test.includes('threads'))                        return 'threads'
  if (test.includes('substack'))                       return 'substack'
  if (test.includes('medium'))                         return 'medium'
  if (test.includes('bluesky'))                        return 'bluesky'
  if (test === 'x' || test.includes('twitter'))        return 'x'
  return 'linkedin'
}

async function mapPool<T, R>(items: T[], limit: number, fn: (item: T, idx: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let cursor = 0
  async function worker() {
    while (cursor < items.length) { const i = cursor++; results[i] = await fn(items[i], i) }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return results
}

// POST /api/v1/plan/generate — generate a caption for each plan row, save to Library.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const parsed = bodySchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input' }, { status: 400 })
  const { brandId, rows, model } = parsed.data

  const brand    = await withTenant(session.user.tenantId, (tx) => resolveBrandConfig(tx, brandId as BrandId, session.user.tenantId))
  const brandCtx = buildBrandPromptContext(brand, 'copy')
  const client   = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const results = await mapPool(rows as PlanRow[], 4, async (row, idx) => {
    const platform = pickPlatform(row.platforms)
    const systemPrompt = buildPlatformSystemPrompt(platform, brandCtx, 'caption')
    const userPrompt = [
      'Turn the following content-plan brief into one polished, ready-to-post caption.',
      'Refine the draft copy into the brand voice; keep any compliance disclaimers present in the brief (e.g. "Estimates; not tax advice").',
      'Never guarantee savings, compliance, or outcomes.',
      '',
      rowToBrief(row),
    ].join('\n')

    try {
      const message = await withRetry(
        () => client.messages.create({
          model, max_tokens: 1024, system: systemPrompt,
          messages: [{ role: 'user', content: userPrompt }],
        }),
        { retryOn: isTransient },
      )
      const raw  = message.content.find((b) => b.type === 'text')?.text?.trim() ?? ''
      const json = raw.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim()
      let result: { body: string; hashtags: string[]; altText?: string }
      try {
        const p = JSON.parse(json)
        result = { body: String(p.body ?? '').trim(), hashtags: Array.isArray(p.hashtags) ? p.hashtags : [], altText: typeof p.altText === 'string' ? p.altText : undefined }
      } catch {
        result = { body: raw, hashtags: [] }
      }

      let assetId: string | null = null
      try {
        const asset = await withTenant(session.user.tenantId, (tx) => tx.asset.create({
          data: {
            tenantId: session.user.tenantId, userId: session.user.id,
            type: 'CAPTION', status: 'READY',
            // brandId is the BrandId tag (e.g. 'espa'), kept in metadata like every
            // other generate route. The top-level Asset.brandId column is a FK to
            // BrandProfile.id, so it must stay null here (setting it to the tag string
            // violated Asset_brandId_fkey and silently dropped every caption).
            metadata: {
              model, platform, cost: estimateCost(model), source: 'plan', brandId,
              planDay: row.day ?? null, audience: row.audience ?? null, theme: row.theme ?? null,
              seriesCount: 1, results: [result],
            },
          },
        }))
        assetId = asset.id
      } catch (err) { console.error('[plan/generate] save failed:', err) }

      return { ok: true, idx, day: row.day ?? null, platform, audience: row.audience ?? null, theme: row.theme ?? null, body: result.body, hashtags: result.hashtags, assetId }
    } catch (err) {
      console.error('[plan/generate] row failed:', err)
      return { ok: false, idx, day: row.day ?? null, platform, error: 'Generation failed' as const }
    }
  })

  const succeeded = results.filter((r) => r.ok).length
  return NextResponse.json({ results, succeeded, failed: results.length - succeeded })
}
