import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadBuffer, makeAssetKey } from '@/lib/storage'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const ALLOWED_DOC_TYPES   = ['application/pdf', 'text/plain']
const MAX_BYTES = 20 * 1024 * 1024 // 20 MB

// Magic byte signatures for allowed image types (browser MIME is not trusted alone)
const MAGIC_BYTES: { sig: number[]; mask?: number[]; mime: string }[] = [
  { sig: [0xFF, 0xD8, 0xFF],                                   mime: 'image/jpeg' },
  { sig: [0x89, 0x50, 0x4E, 0x47],                             mime: 'image/png'  },
  { sig: [0x52, 0x49, 0x46, 0x46],                             mime: 'image/webp' }, // RIFF....WEBP
  { sig: [0x25, 0x50, 0x44, 0x46],                             mime: 'application/pdf' },
]

function detectMimeFromBytes(buf: Buffer): string | null {
  for (const { sig, mime } of MAGIC_BYTES) {
    if (sig.every((b, i) => buf[i] === b)) return mime
  }
  // SVG: starts with '<' (0x3C) or UTF-8 BOM then '<svg'
  const str = buf.slice(0, 64).toString('utf8').trimStart()
  if (str.startsWith('<svg') || str.startsWith('<?xml') || str.startsWith('<!DOCTYPE svg')) return 'image/svg+xml'
  // Plain text: no null bytes in first 512 bytes
  if (!buf.slice(0, 512).includes(0x00)) return 'text/plain'
  return null
}

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
  const key    = makeAssetKey(session.user.tenantId, folder as 'images' | 'documents', ext)
  const buffer = Buffer.from(await file.arrayBuffer())

  // Validate file contents against magic bytes — browser-supplied MIME is not trusted
  const detectedMime = detectMimeFromBytes(buffer)
  if (!detectedMime || !allowed.includes(detectedMime)) {
    return NextResponse.json({ message: `File content does not match an allowed type` }, { status: 400 })
  }

  let url: string
  try {
    url = await uploadBuffer(buffer, key, file.type)
  } catch (err) {
    console.error('[brands/upload] S3 upload failed:', err)
    return NextResponse.json({ message: 'File upload failed.' }, { status: 500 })
  }

  // Update the brand profile
  const currentConfig = (existing.config as Record<string, unknown>) ?? {}
  const updateData: Record<string, unknown> = {}

  if (isLogo) {
    updateData.logoUrl = url
  } else {
    updateData.config = { ...currentConfig, documentUrl: url, documentName: file.name }
  }

  try {
    await prisma.brandProfile.update({
      where: { id: params.id, tenantId: session.user.tenantId },
      data:  updateData,
    })
  } catch (err) {
    console.error('[brands/upload]', err)
    return NextResponse.json({ message: 'Failed to save upload.' }, { status: 500 })
  }

  return NextResponse.json({ url, name: file.name })
}
