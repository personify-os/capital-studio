import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const patchSchema = z.object({
  tagline:   z.string().max(200).optional(),
  tone:      z.string().max(500).optional(),
  audience:  z.string().max(500).optional(),
  products:  z.array(z.string()).optional(),
  guidelines:z.string().max(5000).optional(),
  logoUrl:   z.string().url().optional().or(z.literal('')),
})

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  // Verify ownership
  const existing = await prisma.brandProfile.findFirst({
    where: { id: params.id, tenantId: session.user.tenantId },
  })
  if (!existing) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  const currentConfig = (existing.config as Record<string, unknown>) ?? {}
  const updates: Record<string, unknown> = {}

  const { logoUrl, ...configFields } = parsed.data

  // Merge config fields
  const newConfig: Record<string, unknown> = { ...currentConfig }
  for (const [k, v] of Object.entries(configFields)) {
    if (v !== undefined) newConfig[k] = v
  }

  updates.config = newConfig
  if (logoUrl !== undefined) updates.logoUrl = logoUrl || null

  const brand = await prisma.brandProfile.update({
    where: { id: params.id },
    data:  updates,
  })

  return NextResponse.json({ brand })
}
