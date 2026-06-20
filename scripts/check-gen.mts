/**
 * Generation smoke-test — exercises each AI pipeline against the REAL provider
 * APIs and confirms the result saves to the DB, then cleans up.
 *
 *   npm run check:gen
 *
 * Catches the class of bug CI cannot: the build compiles fine, but a dependency
 * bump / model rename / key issue silently breaks runtime generation (e.g. the
 * @fal-ai/client v1 `.data` regression) or a save fails (e.g. a brandId FK
 * violation). Each check both GENERATES and SAVES, mirroring the real routes.
 *
 * Costs a few cents per run (1 fal image + 2 Claude calls). Leaves one small
 * orphan object in R2 per run (no public delete helper); the DB rows are
 * cleaned up. Exit 0 = all healthy, 1 = a pipeline is broken.
 */
import { config } from 'dotenv'
config({ path: '.env.local' })

import Anthropic from '@anthropic-ai/sdk'
import type { ImageGenerateInput, GraphicGenerateInput } from '../lib/schemas/generate'

const { prisma, withTenant } = await import('../lib/db')
const { generateImages }     = await import('../services/image')
const { generateGraphicHtml } = await import('../services/graphics')
const { uploadFromUrl, makeAssetKey } = await import('../lib/storage')

const created: string[] = []
let failures = 0

async function step(name: string, fn: () => Promise<string>) {
  process.stdout.write(`[${name}] `)
  try {
    const detail = await fn()
    console.log(`✅ ${detail}`)
  } catch (e: any) {
    failures++
    console.log(`❌ ${e?.message?.split('\n')[0] ?? e}`)
  }
}

async function main() {
  const tenant = await prisma.tenant.findFirst({ select: { id: true } })
  const user   = tenant && await prisma.user.findFirst({ where: { tenantId: tenant.id }, select: { id: true } })
  if (!tenant || !user) { console.log('No tenant/user to test against.'); process.exit(0) }
  const T = tenant.id, U = user.id

  await step('image  ', async () => {
    const input = { prompt: '', model: 'flux-pro', aspectRatio: '1:1', variations: 1 } as ImageGenerateInput
    const urls = await generateImages(input, 'a simple flat blue circle on a white background')
    if (!urls[0]) throw new Error('fal returned no image URL')
    const key = makeAssetKey(T, 'images')
    const s3Url = await uploadFromUrl(urls[0], key)
    const a = await withTenant(T, (tx) => tx.asset.create({ data: { tenantId: T, userId: U, type: 'IMAGE', status: 'READY', s3Key: key, s3Url, metadata: { source: 'check-gen' } }, select: { id: true } }))
    created.push(a.id)
    return 'fal flux-pro → R2 → Asset'
  })

  await step('caption', async () => {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await client.messages.create({ model: 'claude-haiku-4-5-20251001', max_tokens: 120, messages: [{ role: 'user', content: 'Write a one-sentence test marketing caption.' }] })
    const text = msg.content.find((b) => b.type === 'text')?.text?.trim()
    if (!text) throw new Error('Claude returned no caption text')
    const a = await withTenant(T, (tx) => tx.asset.create({ data: { tenantId: T, userId: U, type: 'CAPTION', status: 'READY', metadata: { source: 'check-gen', results: [{ body: text }] } }, select: { id: true } }))
    created.push(a.id)
    return 'claude → Asset'
  })

  await step('graphic', async () => {
    const input = { templateId: 'check-gen', brandId: 'lhcapital', headline: 'Smoke Test' } as GraphicGenerateInput
    const html = await generateGraphicHtml(input)
    if (!html || html.length < 50) throw new Error('graphic HTML empty')
    const a = await withTenant(T, (tx) => tx.asset.create({ data: { tenantId: T, userId: U, type: 'GRAPHIC', status: 'READY', htmlContent: html, metadata: { source: 'check-gen' } }, select: { id: true } }))
    created.push(a.id)
    return 'claude html → Asset'
  })

  if (created.length) {
    await withTenant(T, (tx) => tx.asset.deleteMany({ where: { id: { in: created } } }))
    console.log(`\ncleaned up ${created.length} test asset(s)`)
  }
  console.log(failures === 0 ? '\n✅ all generation pipelines healthy' : `\n❌ ${failures} pipeline(s) broken`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((e) => { console.error('THREW:', e?.message); process.exit(1) })
