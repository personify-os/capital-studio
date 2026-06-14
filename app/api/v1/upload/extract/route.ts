import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { extractText, extOf, isSupportedDoc } from '@/lib/extract-text'
import { extractUploadSchema } from '@/lib/schemas/upload'

const MAX_CHARS = 4000 // matches the writer's reference-content limit

/**
 * Validate the file's actual bytes against its claimed extension — never trust
 * the browser-supplied MIME type alone.
 */
function contentMatchesExt(buf: Buffer, ext: string): boolean {
  switch (ext) {
    case 'pdf':
      return buf.length >= 4 && buf[0] === 0x25 && buf[1] === 0x50 && buf[2] === 0x44 && buf[3] === 0x46 // %PDF
    case 'docx':
      // .docx is a ZIP container — starts with the local file header "PK\x03\x04".
      return buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04
    case 'txt':
    case 'md':
    case 'markdown':
    case 'csv':
      // Plain text: reject if there are null bytes in the first 512 bytes (binary smell).
      return !buf.subarray(0, 512).includes(0x00)
    default:
      return false
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ message: 'Invalid form data' }, { status: 400 })
  }

  const parsed = extractUploadSchema.safeParse({ file: formData.get('file') })
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? 'Invalid upload' }, { status: 400 })
  }
  const { file } = parsed.data

  if (!isSupportedDoc(file.name)) {
    return NextResponse.json(
      { message: 'Unsupported file type. Use TXT, MD, CSV, PDF, or Word (.docx).' },
      { status: 400 },
    )
  }

  let buffer: Buffer
  try {
    buffer = Buffer.from(await file.arrayBuffer())
  } catch {
    return NextResponse.json({ message: 'Failed to read file. Please try again.' }, { status: 400 })
  }

  const ext = extOf(file.name)
  if (!contentMatchesExt(buffer, ext)) {
    return NextResponse.json({ message: 'File content does not match its extension.' }, { status: 400 })
  }

  let text: string
  try {
    text = await extractText(buffer, file.name, MAX_CHARS)
  } catch (err) {
    console.error('[upload/extract] extraction failed:', err)
    return NextResponse.json({ message: 'Could not read text from this file.' }, { status: 422 })
  }

  if (!text) {
    return NextResponse.json(
      { message: 'No text found in this file. If it is a scanned PDF, paste the text instead.' },
      { status: 422 },
    )
  }

  return NextResponse.json({ name: file.name, text })
}
