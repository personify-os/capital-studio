import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { withTenant } from '@/lib/db'
import { uploadBuffer, makeAssetKey } from '@/lib/storage'
import { extractText } from '@/lib/extract-text'
import { brandUploadSchema } from '@/lib/schemas/upload'
import type { Prisma } from '@prisma/client'

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
const ALLOWED_DOC_TYPES   = ['application/pdf', 'text/plain', 'text/markdown', 'text/csv', DOCX_MIME]
// Map a detected/declared doc MIME to the extension extractText keys off of.
const DOC_EXT_BY_MIME: Record<string, string> = {
  'application/pdf': 'pdf',
  'text/plain':      'txt',
  'text/markdown':   'md',
  'text/csv':        'csv',
  [DOCX_MIME]:       'docx',
}

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
  // .docx is a ZIP container — local file header "PK\x03\x04".
  if (buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04) return DOCX_MIME
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
    existing = await withTenant(session.user.tenantId, (tx) => tx.brandProfile.findFirst({
      where:  { id: params.id, tenantId: session.user.tenantId },
      select: { config: true, logoUrl: true },
    }))
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

  const parsed = brandUploadSchema.safeParse({
    file:     formData.get('file'),
    type:     formData.get('type'),
    logoSlot: formData.get('logoSlot'),
  })
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid upload' }, { status: 400 })
  }
  const { file, type, logoSlot } = parsed.data

  const isLogo     = type === 'logo'
  const isDocument = type === 'document'
  const allowed    = isLogo ? ALLOWED_IMAGE_TYPES : ALLOWED_DOC_TYPES

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

  // For documents, extract text up front. A thrown error means the file is not a
  // valid document of its claimed type (e.g. a non-DOCX ZIP) — reject before we
  // persist anything. (Empty text, e.g. a scanned PDF, is allowed but unhelpful.)
  let guidelinesText = ''
  if (isDocument) {
    try {
      const docExt = DOC_EXT_BY_MIME[detectedMime] ?? ext
      guidelinesText = await extractText(buffer, `doc.${docExt}`, 10000)
    } catch (err) {
      console.error('[brands/upload] text extraction failed:', err)
      return NextResponse.json(
        { message: 'Could not read text from this document. Please upload a valid file.' },
        { status: 422 },
      )
    }
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
        await withTenant(session.user.tenantId, (tx) => tx.brandProfile.update({
          where: { id: params.id, tenantId: session.user.tenantId },
          data:  { logoUrl: url },
        }))
      } else {
        // Logo variant — stored in config.logoVariants
        const existingVariants = (currentConfig.logoVariants as { label: string; url: string }[] | undefined) ?? []
        const updatedVariants  = [...existingVariants.filter((v) => v.label !== slot), { label: slot, url }]
        await withTenant(session.user.tenantId, (tx) => tx.brandProfile.update({
          where: { id: params.id, tenantId: session.user.tenantId },
          data:  { config: { ...currentConfig, logoVariants: updatedVariants } as Prisma.InputJsonValue },
        }))
      }
    } else {
      // Document: store URL + the text extracted above into guidelines
      const newConfig: Prisma.JsonObject = { ...currentConfig, documentUrl: url, documentName: file.name }
      if (guidelinesText) newConfig.guidelines = guidelinesText
      await withTenant(session.user.tenantId, (tx) => tx.brandProfile.update({
        where: { id: params.id, tenantId: session.user.tenantId },
        data:  { config: newConfig as Prisma.InputJsonValue },
      }))
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
