import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import SchedulerClient from './SchedulerClient'

export default async function SchedulerPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  let accounts: Awaited<ReturnType<typeof prisma.socialAccount.findMany>> = []
  let posts:    Awaited<ReturnType<typeof prisma.scheduledPost.findMany<{ include: { socialAccount: { select: { id: true; platform: true; accountName: true } } } }>>> = []
  let assets:   { id: string; type: string; s3Url: string | null; metadata: unknown }[] = []

  try {
    ;[accounts, posts, assets] = await Promise.all([
      prisma.socialAccount.findMany({
        where:   { tenantId: session.user.tenantId },
        orderBy: { createdAt: 'asc' },
      }),
      prisma.scheduledPost.findMany({
        where:   { tenantId: session.user.tenantId },
        orderBy: { scheduledFor: 'asc' },
        take:    100,
        include: { socialAccount: { select: { id: true, platform: true, accountName: true } } },
      }),
      prisma.asset.findMany({
        where:   { tenantId: session.user.tenantId, status: 'READY', type: { in: ['IMAGE', 'VIDEO'] } },
        orderBy: { createdAt: 'desc' },
        take:    30,
        select:  { id: true, type: true, s3Url: true, metadata: true },
      }),
    ])
  } catch (err) { console.error('[scheduler/page]', err) }

  return (
    <>
      <Topbar title="Social Scheduler" description="Schedule and publish content to your social platforms" />
      <SchedulerClient
        initialAccounts={accounts.map((a) => ({ ...a, createdAt: a.createdAt.toISOString(), expiresAt: a.expiresAt?.toISOString() ?? null }))}
        initialPosts={posts.map((p) => ({
          ...p,
          scheduledFor: p.scheduledFor.toISOString(),
          publishedAt:  p.publishedAt?.toISOString() ?? null,
          createdAt:    p.createdAt.toISOString(),
        }))}
        libraryAssets={assets.map((a) => ({ ...a, s3Url: a.s3Url ?? '' }))}
      />
    </>
  )
}
