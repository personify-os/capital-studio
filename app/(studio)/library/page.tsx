import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import LibraryClient from './LibraryClient'

interface RawAsset {
  id: string
  type: string
  s3Url: string | null
  htmlContent: string | null
  metadata: unknown
  createdAt: Date
}

export default async function LibraryPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const assets = (await prisma.asset.findMany({
    where:   { tenantId: session.user.tenantId, status: 'READY' },
    orderBy: { createdAt: 'desc' },
    take:    48,
    select:  { id: true, type: true, s3Url: true, htmlContent: true, metadata: true, createdAt: true },
  })) as RawAsset[]

  return (
    <>
      <Topbar title="Content Library" description="All your generated assets in one place" />
      <LibraryClient
        assets={assets.map((a) => ({ ...a, createdAt: a.createdAt.toISOString() }))}
      />
    </>
  )
}
