import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadBuffer, makeAssetKey } from '@/lib/storage'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const ALLOWED_DOC_TYPES   = ['application/pdf', 'text/plain']
const MAX_BYTES = 20 * 1024 * 1024 // 20 MB

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const existing = await prisma.brandProfile.findFirst({
    where: { id: params.id, tenantId: session.user.tenantId },
  })
  if (!existing) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ message: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  const type = formData.get('type') as string // 'logo' | 'document'

  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: 'File exceeds 20 MB limit' }, { status: 400 })
  }

  const isLogo     = type === 'logo'
  const isDocument = type === 'document'
  const allowed    = isLogo ? ALLOWED_IMAGE_TYPES : isDocument ? ALLOWED_DOC_TYPES : []

  if (!allowed.includes(file.type)) {
    return NextResponse.json({ message: `Unsupported file type: ${file.type}` }, { status: 400 })
  }

  const ext    = file.name.split('.').pop() ?? (isLogo ? 'png' : 'pdf')
  const folder = isLogo ? 'images' : 'documents'
  const key    = makeAssetKey(session.user.tenantId, folder as any, ext)
  const buffer = Buffer.from(await file.arrayBuffer())
  const url    = await uploadBuffer(buffer, key, file.type)

  // Update the brand profile
  const currentConfig = (existing.config as Record<string, unknown>) ?? {}
  const updateData: Record<string, unknown> = {}

  if (isLogo) {
    updateData.logoUrl = url
  } else {
    updateData.config = { ...currentConfig, documentUrl: url, documentName: file.name }
  }

  await prisma.brandProfile.update({
    where: { id: params.id },
    data:  updateData,
  })

  return NextResponse.json({ url, name: file.name })
}
