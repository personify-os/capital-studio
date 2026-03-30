// Shared post-publishing logic used by both the per-post route and the cron scheduler.

import { prisma } from '@/lib/db'
import { decryptToken } from '@/lib/crypto'
import {
  publishToFacebook,
  publishToInstagram,
  publishToThreads,
  publishToLinkedIn,
  publishToX,
  publishToMedium,
} from '@/services/social'

export async function publishPost(postId: string, tenantId?: string): Promise<{ platformPostId: string }> {
  const where = tenantId
    ? { id: postId, tenantId }
    : { id: postId }

  const post = await prisma.scheduledPost.findFirst({
    where,
    include: { socialAccount: true },
  })

  if (!post)              throw new Error('Post not found')
  if (post.status === 'PUBLISHED') throw new Error('Already published')

  const { socialAccount } = post
  const token    = decryptToken(socialAccount.accessToken)
  const caption  = post.caption ?? ''
  const imageUrl = post.imageUrl ?? undefined

  let platformPostId: string

  try {
    switch (socialAccount.platform) {
      case 'FACEBOOK':
        platformPostId = await publishToFacebook(socialAccount.accountId, token, caption, imageUrl)
        break
      case 'INSTAGRAM':
        if (!imageUrl) throw new Error('Instagram requires an image')
        platformPostId = await publishToInstagram(socialAccount.accountId, token, caption, imageUrl)
        break
      case 'THREADS':
        platformPostId = await publishToThreads(socialAccount.accountId, token, caption, imageUrl)
        break
      case 'LINKEDIN':
        platformPostId = await publishToLinkedIn(socialAccount.accountId, token, caption, imageUrl)
        break
      case 'X':
        platformPostId = await publishToX(socialAccount.accountId, token, caption)
        break
      case 'MEDIUM':
        platformPostId = await publishToMedium(socialAccount.accountId, token, caption)
        break
      default:
        throw new Error(`Publishing to ${socialAccount.platform} not yet supported`)
    }

    await prisma.scheduledPost.update({
      where: { id: post.id },
      data:  { status: 'PUBLISHED', publishedAt: new Date(), platformPostId },
    })

    return { platformPostId }
  } catch (err: any) {
    await prisma.scheduledPost.update({
      where: { id: post.id },
      data:  { status: 'FAILED', errorMessage: err.message ?? 'Unknown error' },
    })
    throw err
  }
}

// Finds and publishes all posts due right now. Called by the cron route.
export async function publishDuePosts(): Promise<{ published: number; failed: number; errors: string[] }> {
  const due = await prisma.scheduledPost.findMany({
    where: {
      status:       'SCHEDULED',
      scheduledFor: { lte: new Date() },
    },
    include: { socialAccount: true },
  })

  let published = 0
  let failed    = 0
  const errors: string[] = []

  for (const post of due) {
    try {
      await publishPost(post.id)
      published++
    } catch (err: any) {
      failed++
      errors.push(`[${post.id}] ${err.message ?? 'Unknown error'}`)
      console.error(`Cron: failed to publish post ${post.id}:`, err)
    }
  }

  return { published, failed, errors }
}
