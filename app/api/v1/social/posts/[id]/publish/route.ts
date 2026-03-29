import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { publishToFacebook, publishToInstagram, publishToThreads, publishToLinkedIn, publishToX } from '@/services/social'
import { decryptToken } from '@/lib/crypto'

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const post = await prisma.scheduledPost.findFirst({
    where:   { id: params.id, tenantId: session.user.tenantId },
    include: { socialAccount: true },
  })
  if (!post) return NextResponse.json({ message: 'Not found' }, { status: 404 })
  if (post.status === 'PUBLISHED') return NextResponse.json({ message: 'Already published' }, { status: 400 })

  const { socialAccount } = post
  const token    = decryptToken(socialAccount.accessToken)
  const caption  = post.caption ?? ''
  const imageUrl = post.imageUrl ?? undefined

  let platformPostId: string | null = null

  try {
    if (socialAccount.platform === 'FACEBOOK') {
      platformPostId = await publishToFacebook(socialAccount.accountId, token, caption, imageUrl)
    } else if (socialAccount.platform === 'INSTAGRAM') {
      if (!imageUrl) {
        return NextResponse.json({ message: 'Instagram requires an image' }, { status: 400 })
      }
      platformPostId = await publishToInstagram(socialAccount.accountId, token, caption, imageUrl)
    } else if (socialAccount.platform === 'THREADS') {
      platformPostId = await publishToThreads(socialAccount.accountId, token, caption, imageUrl)
    } else if (socialAccount.platform === 'LINKEDIN') {
      platformPostId = await publishToLinkedIn(socialAccount.accountId, token, caption, imageUrl)
    } else if (socialAccount.platform === 'X') {
      platformPostId = await publishToX(socialAccount.accountId, token, caption)
    } else {
      return NextResponse.json({ message: `Publishing to ${socialAccount.platform} not yet supported` }, { status: 400 })
    }

    await prisma.scheduledPost.update({
      where: { id: post.id },
      data:  { status: 'PUBLISHED', publishedAt: new Date(), platformPostId },
    })

    return NextResponse.json({ ok: true, platformPostId })
  } catch (err: any) {
    await prisma.scheduledPost.update({
      where: { id: post.id },
      data:  { status: 'FAILED', errorMessage: err.message ?? 'Unknown error' },
    })
    return NextResponse.json({ message: err.message ?? 'Publish failed' }, { status: 502 })
  }
}
