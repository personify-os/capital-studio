import { NextResponse } from 'next/server'

// Liveness check — intentionally does NOT touch the database. External uptime
// monitors (Better Stack) hit this frequently; a DB query here would keep the
// Neon compute awake 24/7. DB connectivity is already verified on every deploy
// by `prisma migrate deploy` in the Railway startCommand. For a deep DB check,
// use /api/v1/health/db.
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() })
}
