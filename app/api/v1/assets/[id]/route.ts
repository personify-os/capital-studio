import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withTenant } from '@/lib/db'
import { z } from 'zod'

const patchSchema = z.object({
  results: z.array(z.object({
    body:     z.string().max(8000),
    hashtags: z.array(z.string().max(100)).max(40).optional(),
    altText:  z.string().max(2000).optional(),
  })).min(1).max(20),
})

// PATCH /api/v1/assets/[id] — edit a caption asset's text in place.
export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const parsed = patchSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ message: 'Invalid input' }, { status: 400 })

  const asset = await withTenant(session.user.tenantId, (tx) => tx.asset.findFirst({
    where:  { id, tenantId: session.user.tenantId },
    select: { id: true, type: true, metadata: true },
  }))
  if (!asset) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  if (asset.type !== 'CAPTION') return NextResponse.json({ message: 'Only captions can be edited' }, { status: 400 })

  // Normalise hashtags/altText and merge into metadata under `results`
  const results = parsed.data.results.map((r) => ({
    body:     r.body.trim(),
    hashtags: r.hashtags ?? [],
    ...(r.altText ? { altText: r.altText } : {}),
  }))
  const meta = { ...((asset.metadata as Record<string, unknown>) ?? {}), results, seriesCount: results.length }

  try {
    await withTenant(session.user.tenantId, (tx) => tx.asset.update({ where: { id, tenantId: session.user.tenantId }, data: { metadata: meta } }))
  } catch (err) {
    console.error('[assets/PATCH] update failed:', err)
    return NextResponse.json({ message: 'Failed to save edit.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
