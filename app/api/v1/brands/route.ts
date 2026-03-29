import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['LHC', 'SIMRP', 'PERSONAL']),
})

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body   = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ message: 'Invalid input', errors: parsed.error.flatten() }, { status: 400 })
  }

  const brand = await prisma.brandProfile.create({
    data: {
      tenantId:  session.user.tenantId,
      type:      parsed.data.type,
      name:      parsed.data.name,
      isDefault: false,
      config:    {},
    },
  })

  return NextResponse.json({ brand }, { status: 201 })
}
