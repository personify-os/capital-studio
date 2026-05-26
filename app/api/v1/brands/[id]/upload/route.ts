import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { uploadBuffer, makeAssetKey } from '@/lib/storage'
import type { Prisma } from '@prisma/client'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const ALLOWED_DOC_TYPES   = ['application/pdf', 'text/plain']
const MAX_BYTES = 20 * 1024 * 1024 // 20 MB

// Normalize MIME types — browsers may include charset or other params
function normalizeMime(mime: string): string {
  return mime.split(';')[0].trim().toLowerCase()
}

// Magic byte signatures for allowed types
const MAGIC_BYTES: { sig: number[]; mime: string }[] = [
  { sig: [0xFF, 0xD8, 0xFF],          mime: 'image/jpeg' },
  { sig: [0x89, 0x50, 0x4E, 0x47],    mime: 'image/png'  },
  { sig: [0x52, 0x49, 0x46, 0x46],    mime: 'image/webp' },
  { sig: [0x25, 0x50, 0x44, 0x46],    mime: 'application/pdf' },
]

function detectMimeFromBytes(buf: Buffer): string | null {
  for (const { sig, mime } of MAGIC_BYTES) {
    if (sig.every((b, i) => buf[i] === b)) return mime
  }
  const str = buf.slice(0, 64).toString('utf8').trimStart()
  if (str.startsWith('<svg') || str.startsWith('<?xml') || str.startsWith('<!DOCTYPE svg')) return 'image/svg+xml'
  // Plain text: no null bytes in first 512 bytes
  if (!buf.slice(0, 512).includes(0x00)) return 'text/plain'
  return null
}

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  let existing: { config: unknown; logoUrl: string | null } | null
  try {
    existing = await prisma.brandProfile.findFirst({
      where:  { id: params.id, tenantId: session.user.tenantId },
      select: { config: true, logoUrl: true },
    })
  } catch (err) {
    console.error('[brands/upload] DB lookup failed:', err)
    return NextResponse.json({ message: 'Database error.' }, { status: 500 })
  }
  if (!existing) return NextResponse.json({ message: 'Not found' }, { status: 404 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ message: 'Invalid form data' }, { status: 400 })
  }

  const file     = formData.get('file')
  const type     = formData.get('type') as string          // 'logo' | 'document'
  const logoSlot = formData.get('logoSlot') as string | null // 'primary' | label for variant

  if (typeof file === 'string' || !file) {
    return NextResponse.json({ message: 'No file provided' }, { status: 400 })
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: 'File exceeds 20 MB limit' }, { status: 400 })
  }

  const isLogo     = type === 'logo'
  const isDocument = type === 'document'
  const allowed    = isLogo ? ALLOWED_IMAGE_TYPES : isDocument ? ALLOWED_DOC_TYPES : []

  // Normalize the browser-supplied MIME type (strip charset/params)
  const normalizedMime = normalizeMime(file.type)
  if (!allowed.includes(normalizedMime)) {
    return NextResponse.json({ message: `Unsupported file type: ${file.type}` }, { status: 400 })
  }

  const ext    = file.name.split('.').pop()?.toLowerCase() ?? (isLogo ? 'png' : 'pdf')
  const folder = isLogo ? 'images' : 'documents'
  const key    = makeAssetKey(session.user.tenantId, folder as 'images' | 'documents', ext)

  let buffer: Buffer
  try {
    buffer = Buffer.from(await file.arrayBuffer())
  } catch (err) {
    console.error('[brands/upload] Failed to read file buffer:', err)
    return NextResponse.json({ message: 'Failed to read file. Please try again.' }, { status: 400 })
  }

  // Validate file contents against magic bytes
  const detectedMime = detectMimeFromBytes(buffer)
  if (!detectedMime || !allowed.includes(detectedMime)) {
    return NextResponse.json({ message: 'File content does not match an allowed type' }, { status: 400 })
  }

  let url: string
  try {
    url = await uploadBuffer(buffer, key, normalizedMime)
  } catch (err) {
    console.error('[brands/upload] R2 upload failed:', err)
    return NextResponse.json({ message: 'File upload failed. Please try again.' }, { status: 500 })
  }

  const currentConfig = (existing.config ?? {}) as Prisma.JsonObject

  try {
    if (isLogo) {
      const slot = logoSlot ?? 'primary'
      if (slot === 'primary' || !slot) {
        // Primary logo — top-level logoUrl column
        await prisma.brandProfile.update({
          where: { id: params.id, tenantId: session.user.tenantId },
          data:  { logoUrl: url },
        })
      } else {
        // Logo variant — stored in config.logoVariants
        const existingVariants = (currentConfig.logoVariants as { label: string; url: string }[] | undefined) ?? []
        const updatedVariants  = [...existingVariants.filter((v) => v.label !== slot), { label: slot, url }]
        await prisma.brandProfile.update({
          where: { id: params.id, tenantId: session.user.tenantId },
          data:  { config: { ...currentConfig, logoVariants: updatedVariants } as Prisma.InputJsonValue },
        })
      }
    } else {
      // Document: store URL + extract text content into guidelines
      const newConfig: Prisma.JsonObject = { ...currentConfig, documentUrl: url, documentName: file.name }
      if (detectedMime === 'text/plain') {
        const textContent = buffer.toString('utf8').slice(0, 10000).trim()
        if (textContent) newConfig.guidelines = textContent
      } else if (detectedMime === 'application/pdf') {
        try {
          type PdfParseFn = (buf: Buffer) => Promise<{ text: string }>
          const { default: pdfParse } = await import('pdf-parse') as unknown as { default: PdfParseFn }
          const pdfData = await pdfParse(buffer)
          const textContent = pdfData.text.replace(/\s+/g, ' ').slice(0, 10000).trim()
          if (textContent) newConfig.guidelines = textContent
        } catch (err) {
          console.error('[brands/upload] PDF text extraction failed:', err)
          // Non-fatal: document is still saved, guidelines just won't be populated
        }
      }
      await prisma.brandProfile.update({
        where: { id: params.id, tenantId: session.user.tenantId },
        data:  { config: newConfig as Prisma.InputJsonValue },
      })
    }
  } catch (err) {
    console.error('[brands/upload] DB update failed:', err)
    return NextResponse.json({ message: 'Failed to save upload.' }, { status: 500 })
  }

  return NextResponse.json({ url, name: file.name })
  } catch (err) {
    console.error('[brands/upload] Unhandled error:', err)
    return NextResponse.json({ message: 'Upload failed — please try again.' }, { status: 500 })
  }
}
