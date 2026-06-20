import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withTenant } from '@/lib/db'

// Forces a real download. The `download` attribute is ignored for cross-origin
// (R2) URLs, so we proxy the bytes same-origin with Content-Disposition.
export async function GET(_req: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const asset = await withTenant(session.user.tenantId, (tx) => tx.asset.findFirst({
    where:  { id, tenantId: session.user.tenantId },
    select: { s3Url: true, htmlContent: true, type: true },
  }))
  if (!asset) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  // Graphics have no file — serve the HTML as a downloadable .html
  if (!asset.s3Url && asset.htmlContent) {
    return new Response(asset.htmlContent, {
      headers: {
        'Content-Type':        'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="capital-studio-${id}.html"`,
      },
    })
  }
  if (!asset.s3Url) return NextResponse.json({ message: 'No file for this asset' }, { status: 404 })

  const upstream = await fetch(asset.s3Url)
  if (!upstream.ok || !upstream.body) return NextResponse.json({ message: 'Failed to fetch asset' }, { status: 502 })

  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'
  const ext = (asset.s3Url.split('.').pop() ?? '').split('?')[0].slice(0, 5) || contentType.split('/')[1] || 'bin'
  return new Response(upstream.body, {
    headers: {
      'Content-Type':        contentType,
      'Content-Disposition': `attachment; filename="capital-studio-${id}.${ext}"`,
    },
  })
}
