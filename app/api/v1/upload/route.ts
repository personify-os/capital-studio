import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { uploadBuffer, makeAssetKey } from '@/lib/storage'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
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
  if (!(file instanceof File)) {
    return NextResponse.json({ message: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json({ message: 'Only image files are supported' }, { status: 400 })
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ message: 'File exceeds 10 MB limit' }, { status: 400 })
  }

  const ext    = file.type.split('/')[1].replace('jpeg', 'jpg')
  const key    = makeAssetKey(session.user.tenantId, 'images', ext)
  const buffer = Buffer.from(await file.arrayBuffer())
  const url    = await uploadBuffer(buffer, key, file.type)

  return NextResponse.json({ url })
}
