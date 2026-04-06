import { withRetry, isTransient } from '@/lib/retry'

const HEYGEN_API = 'https://api.heygen.com'

function heygenHeaders() {
  return {
    'X-Api-Key':    process.env.HEYGEN_API_KEY!,
    'Content-Type': 'application/json',
  }
}

// ── Avatar & Voice types ─────────────────────────────────────────────────────

export interface HeyGenAvatar {
  avatar_id:         string
  avatar_name:       string
  preview_image_url: string | null
  preview_video_url: string | null
  gender:            string | null
}

export interface HeyGenVoice {
  voice_id:      string
  language:      string
  gender:        string
  name:          string
  preview_audio: string | null
}

// ── List helpers ─────────────────────────────────────────────────────────────

export async function listAvatars(): Promise<HeyGenAvatar[]> {
  return withRetry(async () => {
    const res = await fetch(`${HEYGEN_API}/v2/avatars`, { headers: heygenHeaders() })
    if (!res.ok) throw new Error(`HeyGen avatars: ${res.status}`)
    const json = await res.json()
    return (json.data?.avatars ?? []) as HeyGenAvatar[]
  }, { retryOn: isTransient })
}

export async function listVoices(): Promise<HeyGenVoice[]> {
  return withRetry(async () => {
    const res = await fetch(`${HEYGEN_API}/v2/voices`, { headers: heygenHeaders() })
    if (!res.ok) throw new Error(`HeyGen voices: ${res.status}`)
    const json = await res.json()
    return (json.data?.voices ?? []) as HeyGenVoice[]
  }, { retryOn: isTransient })
}

// ── Generation ───────────────────────────────────────────────────────────────

export type AspectRatio = '16:9' | '9:16' | '1:1'

const DIMENSIONS: Record<AspectRatio, { width: number; height: number }> = {
  '16:9': { width: 1280, height: 720  },
  '9:16': { width: 720,  height: 1280 },
  '1:1':  { width: 1080, height: 1080 },
}

export interface GenerateLikenessParams {
  script:      string
  avatarId:    string
  voiceId:     string
  aspectRatio: AspectRatio
}

/** Submits a HeyGen video generation job. Returns the video_id for polling. */
export async function generateLikenessVideo(params: GenerateLikenessParams): Promise<string> {
  const dim = DIMENSIONS[params.aspectRatio]
  const body = {
    video_inputs: [{
      character: { type: 'avatar', avatar_id: params.avatarId, avatar_style: 'normal' },
      voice:     { type: 'text',   input_text: params.script,  voice_id: params.voiceId },
    }],
    dimension: dim,
  }

  const res = await fetch(`${HEYGEN_API}/v2/video/generate`, {
    method:  'POST',
    headers: heygenHeaders(),
    body:    JSON.stringify(body),
  })
  if (!res.ok) {
    const msg = await res.text().catch(() => res.status.toString())
    throw new Error(`HeyGen generate failed (${res.status}): ${msg}`)
  }
  const json = await res.json()
  const videoId = json.data?.video_id
  if (!videoId) throw new Error('HeyGen returned no video_id')
  return videoId as string
}

// ── Status polling ───────────────────────────────────────────────────────────

export type LikenessJobStatus = 'pending' | 'processing' | 'waiting' | 'completed' | 'failed'

export interface LikenessStatusResult {
  status:    LikenessJobStatus
  videoUrl?: string
  error?:    string
}

export async function getLikenessStatus(videoId: string): Promise<LikenessStatusResult> {
  const res = await fetch(
    `${HEYGEN_API}/v1/video_status.get?video_id=${encodeURIComponent(videoId)}`,
    { headers: heygenHeaders() },
  )
  if (!res.ok) throw new Error(`HeyGen status: ${res.status}`)
  const json = await res.json()
  const d    = json.data ?? {}
  return {
    status:   (d.status ?? 'processing') as LikenessJobStatus,
    videoUrl: d.video_url ?? undefined,
    error:    d.error     ?? undefined,
  }
}
