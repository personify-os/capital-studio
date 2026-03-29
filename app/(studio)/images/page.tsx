import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import Topbar from '@/components/layout/Topbar'
import ImagesClient from './ImagesClient'

interface RawImage {
  id: string
  s3Url: string | null
  metadata: unknown
  createdAt: Date
}

export default async function ImagesPage() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const recent = (await prisma.asset.findMany({
    where:   { tenantId: session.user.tenantId, type: 'IMAGE', status: 'READY' },
    orderBy: { createdAt: 'desc' },
    take:    20,
    select:  { id: true, s3Url: true, metadata: true, createdAt: true },
  })) as RawImage[]

  return (
    <>
      <Topbar title="Image Studio" description="Generate AI images using the best available models" />
      <ImagesClient
        recentImages={recent.map((r) => ({ ...r, s3Url: r.s3Url ?? '', createdAt: r.createdAt.toISOString() }))}
      />
    </>
  )
}
