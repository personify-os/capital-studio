// POST /api/v1/cron/publish
// Called by Railway cron or an external scheduler (e.g. cron-job.org) every minute.
// Protected by CRON_SECRET env var — pass as Authorization: Bearer <secret>

import { NextResponse } from 'next/server'
import { publishDuePosts } from '@/services/publisher'

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('CRON_SECRET not configured')
    return NextResponse.json({ message: 'Server misconfigured' }, { status: 500 })
  }

  const auth = req.headers.get('authorization') ?? ''
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await publishDuePosts()
    console.log(`Cron publish: ${result.published} published, ${result.failed} failed`)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Cron publish error:', err)
    return NextResponse.json({ message: err.message ?? 'Cron error' }, { status: 500 })
  }
}
