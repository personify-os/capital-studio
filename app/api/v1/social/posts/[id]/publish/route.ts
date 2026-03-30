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
  } catch (err: any) {
    const status = err.message === 'Post not found' ? 404
      : err.message === 'Already published'         ? 400
      : 502
    return NextResponse.json({ message: err.message ?? 'Publish failed' }, { status })
  }
}
