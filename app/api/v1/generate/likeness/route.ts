import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { generateLikenessVideo } from '@/services/likeness'
import { z } from 'zod'

const schema = z.object({
  script:      z.string().min(1).max(5000),
  avatarId:    z.string().min(1),
  voiceId:     z.string().min(1),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).default('16:9'),
  brandId:     z.enum(['lhcapital', 'simrp', 'personal']).optional(),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ message: 'Invalid request', errors: parsed.error.flatten() }, { status: 400 })

  const { script, avatarId, voiceId, aspectRatio, brandId } = parsed.data

  try {
    const videoId = await generateLikenessVideo({ script, avatarId, voiceId, aspectRatio })

    const asset = await prisma.asset.create({
      data: {
        tenantId: session.user.tenantId,
        userId:   session.user.id,
        type:     'LIKENESS',
        status:   'PENDING',
        brandId:  brandId ?? null,
        metadata: { videoId, script: script.slice(0, 200), avatarId, voiceId, aspectRatio, cost: 0.10 },
      },
    })

    return NextResponse.json({ assetId: asset.id, videoId })
  } catch (err) {
    console.error('[generate/likeness]', err)
    return NextResponse.json(
      { message: err instanceof Error ? err.message : 'Generation failed' },
      { status: 500 },
    )
  }
}
