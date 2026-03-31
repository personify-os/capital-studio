import { NextResponse }     from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { accessToken } = await req.json()
  if (!accessToken?.trim()) return NextResponse.json({ message: 'Token required' }, { status: 400 })

  const clientId     = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    return NextResponse.json({ message: 'LINKEDIN_CLIENT_ID / LINKEDIN_CLIENT_SECRET not configured' }, { status: 500 })
  }

  const res  = await fetch('https://www.linkedin.com/oauth/v2/introspectToken', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ client_id: clientId, client_secret: clientSecret, token: accessToken.trim() }).toString(),
  })
  const data = await res.json()

  if (!res.ok) return NextResponse.json({ message: data.error_description ?? 'Introspection failed', raw: data }, { status: 400 })
  if (!data.active) return NextResponse.json({ message: 'Token is not active', raw: data }, { status: 400 })

  const sub = data.sub ?? data.client_id ?? null
  if (!sub) return NextResponse.json({ message: 'Person ID not found in token', raw: data }, { status: 400 })

  return NextResponse.json({ personId: String(sub) })
}
