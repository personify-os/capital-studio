import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getLikenessStatus } from '@/services/likeness'
import { uploadFromUrl, makeAssetKey } from '@/lib/storage'

export async function GET(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const assetId = searchParams.get('assetId')
  const videoId = searchParams.get('videoId')
  if (!assetId || !videoId) return NextResponse.json({ message: 'Missing assetId or videoId' }, { status: 400 })

  const asset = await prisma.asset.findFirst({
    where: { id: assetId, tenantId: session.user.tenantId },
  })
  if (!asset) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  // Already complete — return immediately without calling HeyGen
  if (asset.status === 'READY' && asset.s3Url) {
    return NextResponse.json({ status: 'completed', url: asset.s3Url })
  }

  try {
    const result = await getLikenessStatus(videoId)

    if (result.status === 'completed' && result.videoUrl) {
      const key = makeAssetKey(session.user.tenantId, 'videos', 'mp4')
      const url = await uploadFromUrl(result.videoUrl, key, 'video/mp4')
      await prisma.asset.update({
        where: { id: assetId },
        data:  { status: 'READY', s3Url: url, s3Key: key },
      })
      return NextResponse.json({ status: 'completed', url })
    }

    if (result.status === 'failed') {
      await prisma.asset.update({ where: { id: assetId }, data: { status: 'FAILED' } })
      return NextResponse.json({ status: 'failed', error: result.error ?? 'HeyGen generation failed' })
    }

    return NextResponse.json({ status: result.status })
  } catch (err) {
    console.error('[likeness/status]', err)
    return NextResponse.json({ message: 'Status check failed' }, { status: 500 })
  }
}
