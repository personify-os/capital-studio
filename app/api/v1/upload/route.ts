import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadBuffer, makeAssetKey } from '@/lib/storage'

const MAGIC_BYTES = [
  { sig: [0xFF, 0xD8, 0xFF],             mime: 'image/jpeg' },
  { sig: [0x89, 0x50, 0x4E, 0x47],       mime: 'image/png'  },
  { sig: [0x52, 0x49, 0x46, 0x46],       mime: 'image/webp' },
] as const

function detectMimeFromBytes(buf: Buffer): string | null {
  for (const { sig, mime } of MAGIC_BYTES) {
    if (sig.every((b, i) => buf[i] === b)) return mime
  }
  const str = buf.slice(0, 64).toString('utf8').trimStart()
  if (str.startsWith('<svg') || str.startsWith('<?xml') || str.startsWith('<!DOCTYPE svg')) return 'image/svg+xml'
  return null
}

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
const EXT_MAP: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg' }
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ message: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file')
  if (typeof file === 'string' || !file) {
    return NextResponse.json({ message: 'No file provided' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: 'File exceeds 10 MB limit' }, { status: 400 })
  }

  let buffer: Buffer
  try {
    buffer = Buffer.from(await file.arrayBuffer())
  } catch {
    return NextResponse.json({ message: 'Failed to read file' }, { status: 400 })
  }

  // Magic byte validation — never trust browser-supplied file.type
  const detectedMime = detectMimeFromBytes(buffer)
  if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
    return NextResponse.json({ message: 'Only JPEG, PNG, WebP, and SVG images are supported' }, { status: 400 })
  }

  const ext = EXT_MAP[detectedMime]
  const key = makeAssetKey(session.user.tenantId, 'images', ext)
  let url: string
  try {
    url = await uploadBuffer(buffer, key, detectedMime)
  } catch (err) {
    console.error('[upload] S3 upload failed:', err)
    return NextResponse.json({ message: 'Upload failed.' }, { status: 500 })
  }

  return NextResponse.json({ url })
}
