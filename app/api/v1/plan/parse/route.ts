import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { parsePlan } from '@/lib/plan-parse'

const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

// POST /api/v1/plan/parse — parse a dropped .xlsx/.csv content plan into rows.
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
  if (typeof file === 'string' || !file) return NextResponse.json({ message: 'No file provided' }, { status: 400 })
  if (file.size > MAX_BYTES)            return NextResponse.json({ message: 'File exceeds 10 MB limit' }, { status: 400 })

  const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
  if (ext !== 'xlsx' && ext !== 'csv') {
    return NextResponse.json({ message: 'Unsupported file type. Use an Excel (.xlsx) or CSV (.csv) plan.' }, { status: 400 })
  }

  let rows
  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    rows = await parsePlan(buffer, file.name)
  } catch (err) {
    console.error('[plan/parse] failed:', err)
    return NextResponse.json({ message: 'Could not read this plan file.' }, { status: 422 })
  }

  if (rows.length === 0) {
    return NextResponse.json(
      { message: "No content rows found. Make sure the sheet has a header row with columns like Hook/Headline and Post Copy." },
      { status: 422 },
    )
  }

  return NextResponse.json({ rows, name: file.name })
}
