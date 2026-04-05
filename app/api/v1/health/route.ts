import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Lightweight query — wakes the Neon DB from cold-start
    await prisma.tenant.count({ take: 1 })
    return NextResponse.json({ status: 'ok' })
  } catch {
    return NextResponse.json({ status: 'unavailable' }, { status: 503 })
  }
}
