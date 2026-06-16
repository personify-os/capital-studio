import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Deep health check — verifies database connectivity. This wakes the Neon
// compute from cold-start, so monitor it sparingly (e.g. every 15+ minutes),
// NOT at the same frequency as the lightweight /api/v1/health liveness check.
export async function GET() {
  try {
    await prisma.tenant.count({ take: 1 })
    return NextResponse.json({ status: 'ok', db: 'ok', timestamp: new Date().toISOString() })
  } catch {
    return NextResponse.json({ status: 'unavailable', db: 'error', timestamp: new Date().toISOString() }, { status: 503 })
  }
}
