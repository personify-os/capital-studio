import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma, withTenant } from '@/lib/db' // prisma used only for query result types below
import Topbar from '@/components/layout/Topbar'
import SchedulerClient from './SchedulerClient'

export default async function SchedulerPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  let accounts: Awaited<ReturnType<typeof prisma.socialAccount.findMany>> = []
  let posts:    Awaited<ReturnType<typeof prisma.scheduledPost.findMany<{ include: { socialAccount: { select: { id: true; platform: true; accountName: true } } } }>>> = []
  let assets:   { id: string; type: string; s3Url: string | null; metadata: unknown }[] = []

  try {
    ;[accounts, posts, assets] = await withTenant(session.user.tenantId, (tx) => Promise.all([
      tx.socialAccount.findMany({
        where:   { tenantId: session.user.tenantId },
        orderBy: { createdAt: 'asc' },
      }),
      tx.scheduledPost.findMany({
        where:   { tenantId: session.user.tenantId },
        orderBy: { scheduledFor: 'asc' },
        take:    100,
        include: { socialAccount: { select: { id: true, platform: true, accountName: true } } },
      }),
      tx.asset.findMany({
        where:   { tenantId: session.user.tenantId, status: 'READY', type: { in: ['IMAGE', 'VIDEO'] } },
        orderBy: { createdAt: 'desc' },
        take:    30,
        select:  { id: true, type: true, s3Url: true, metadata: true },
      }),
    ]))
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
