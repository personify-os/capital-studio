import { NextResponse }    from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions }      from '@/lib/auth'
import { publishPost }      from '@/services/publisher'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const result = await publishPost(params.id, session.user.tenantId)
    return NextResponse.json({ ok: true, ...result })
  } catch (err) {
    const msg    = err instanceof Error ? err.message : 'Publish failed'
    const status = msg === 'Post not found'                      ? 404
      : msg.includes('terminal state')                           ? 400
      : msg.includes('token expired')                            ? 422
      : 502
    return NextResponse.json({ message: msg }, { status })
  }
}
