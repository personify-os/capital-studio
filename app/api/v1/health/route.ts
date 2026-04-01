import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Lightweight query — wakes the Neon DB from cold-start
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: 'ok', app: 'capital-studio', db: 'ok', ts: Date.now() })
  } catch {
    return NextResponse.json({ status: 'ok', app: 'capital-studio', db: 'cold', ts: Date.now() })
  }
}
