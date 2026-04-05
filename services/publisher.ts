// Shared post-publishing logic used by both the per-post route and the cron scheduler.

import { prisma } from '@/lib/db'
import { decryptToken, encryptToken } from '@/lib/crypto'
import {
  publishToFacebook,
  publishToInstagram,
  publishToThreads,
  publishToLinkedIn,
  publishToX,
  publishToMedium,
  publishToSubstack,
  publishToBluesky,
  publishToYouTube,
  publishToTikTok,
  refreshTikTokToken,
  refreshYouTubeToken,
} from '@/services/social'

export async function publishPost(postId: string, tenantId?: string): Promise<{ platformPostId: string }> {
  const where = tenantId
    ? { id: postId, tenantId }
    : { id: postId }

  const post = await prisma.scheduledPost.findFirst({
    where,
    include: { socialAccount: true },
  })

  if (!post) throw new Error('Post not found')
  if (post.status === 'PUBLISHED' || post.status === 'FAILED') throw new Error(`Post already in terminal state: ${post.status}`)

  const { socialAccount } = post

  // For platforms that can't auto-refresh, reject if token is expired
  const NON_REFRESHABLE: string[] = ['FACEBOOK', 'INSTAGRAM', 'LINKEDIN', 'THREADS']
  if (NON_REFRESHABLE.includes(socialAccount.platform) && socialAccount.expiresAt && socialAccount.expiresAt < new Date()) {
    throw new Error(`${socialAccount.platform} token expired — please reconnect this account in the Scheduler`)
  }

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
      case 'SUBSTACK':
        // accountId = subdomain, token = decrypted connect.sid cookie
        platformPostId = await publishToSubstack(socialAccount.accountId, token, caption)
        break
      case 'BLUESKY':
        platformPostId = await publishToBluesky(socialAccount.accountId, token, caption)
        break
      case 'YOUTUBE': {
        const [, ytRefresh] = token.split('|||')
        if (!ytRefresh) throw new Error('YouTube account needs to be reconnected — missing refresh token')
        const freshAccessToken = await refreshYouTubeToken(ytRefresh)
        // Persist refreshed access token (Google refresh tokens don't expire, same token reused)
        await prisma.socialAccount.update({
          where: { id: socialAccount.id },
          data:  { accessToken: encryptToken(`${freshAccessToken}|||${ytRefresh}`) },
        })
        platformPostId = await publishToYouTube(socialAccount.accountId, freshAccessToken, caption, imageUrl)
        break
      }
      case 'TIKTOK': {
        const [, storedRefresh] = token.split('|||')
        if (!storedRefresh) throw new Error('TikTok account needs to be reconnected — missing refresh token')
        const refreshed = await refreshTikTokToken(storedRefresh)
        // Persist the new tokens so the refresh token lifetime is tracked
        await prisma.socialAccount.update({
          where: { id: socialAccount.id },
          data: {
            accessToken: encryptToken(`${refreshed.accessToken}|||${refreshed.refreshToken}`),
            expiresAt:   new Date(Date.now() + refreshed.refreshExpiresIn * 1000),
          },
        })
        platformPostId = await publishToTikTok(socialAccount.accountId, refreshed.accessToken, caption, imageUrl)
        break
      }
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
// Uses an atomic status transition to PROCESSING to prevent double-publish
// if two cron instances fire concurrently.
export async function publishDuePosts(): Promise<{ published: number; failed: number; errors: string[] }> {
  // Claim up to 50 due posts atomically — set PROCESSING before reading content
  const now = new Date()
  await prisma.scheduledPost.updateMany({
    where: { status: 'SCHEDULED', scheduledFor: { lte: now } },
    data:  { status: 'PROCESSING' },
  })

  const due = await prisma.scheduledPost.findMany({
    where: { status: 'PROCESSING' },
    include: { socialAccount: true },
    take: 50,
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
