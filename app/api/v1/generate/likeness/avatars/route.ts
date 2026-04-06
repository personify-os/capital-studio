import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { listAvatars, listVoices } from '@/services/likeness'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  try {
    const [avatars, voices] = await Promise.all([listAvatars(), listVoices()])
    // Surface English voices first, then others
    const sorted = [...voices].sort((a, b) => {
      const aEn = a.language.startsWith('en') ? 0 : 1
      const bEn = b.language.startsWith('en') ? 0 : 1
      return aEn - bEn || a.name.localeCompare(b.name)
    })
    return NextResponse.json({ avatars, voices: sorted })
  } catch (err) {
    console.error('[likeness/avatars]', err)
    return NextResponse.json({ message: 'Failed to load HeyGen avatars/voices' }, { status: 500 })
  }
}
