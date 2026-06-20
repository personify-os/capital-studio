import { fal } from '@fal-ai/client'
import Anthropic from '@anthropic-ai/sdk'
import type { MusicGenerateInput } from '@/lib/schemas/generate'
import { withRetry, isTransient } from '@/lib/retry'

export interface MusicResult { url: string; title?: string; duration?: number }

// Routes to the selected provider. MiniMax runs on fal (reliable, first-party);
// Suno has no official API, so it's a thin adapter over a third-party reseller
// gated behind SUNO_API_KEY — see generateWithSuno.
export async function generateMusic(input: MusicGenerateInput): Promise<MusicResult> {
  return input.provider === 'suno' ? generateWithSuno(input) : generateWithMinimax(input)
}

// ─── MiniMax Music v2 (fal) ─────────────────────────────────────────────────
// fal-ai/minimax-music/v2 takes a style `prompt` AND a `lyrics_prompt`; output
// is { audio: { url } } (under .data in @fal-ai/client v1).
async function generateWithMinimax(input: MusicGenerateInput): Promise<MusicResult> {
  fal.config({ credentials: process.env.FAL_KEY! })

  const prompt = (input.style ? `${input.description}. Style: ${input.style}` : input.description).slice(0, 300)
  const lyricsPrompt = input.instrumental
    ? '[Intro]\n[Instrumental]\n[Verse]\n[Instrumental]\n[Bridge]\n[Instrumental]\n[Outro]'
    : (input.lyrics?.trim() || await writeLyrics(input.description))

  const result = await withRetry(() => fal.run('fal-ai/minimax-music/v2', {
    input: { prompt, lyrics_prompt: lyricsPrompt },
  }), { retryOn: isTransient }) as any

  const out = result?.data ?? result
  const url = out.audio?.url ?? out.audio_url ?? out.url
  if (!url) throw new Error('MiniMax returned no audio URL')
  return { url, duration: out.audio?.duration }
}

// Claude writes short, structured lyrics from the description so vocal tracks
// keep the single-input UX (MiniMax requires a non-trivial lyrics_prompt).
async function writeLyrics(description: string): Promise<string> {
  const fallback = '[Verse]\nA melody to carry the day\n[Chorus]\nMoving forward, finding our way'
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const msg = await withRetry(() => client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 400,
      system: 'Write short, singable song lyrics (2 short verses + a chorus) for the described track. Use [Verse] and [Chorus] structure tags. Output ONLY the lyrics — no preamble.',
      messages: [{ role: 'user', content: description }],
    }), { retryOn: isTransient })
    const text = msg.content.find((b) => b.type === 'text')?.text?.trim()
    return text && text.length >= 10 ? text : fallback
  } catch {
    return fallback
  }
}

// ─── Suno via Apiframe (third-party reseller) ───────────────────────────────
// No official Suno API exists; Apiframe resells it. Submit → poll a job until
// the audio URL appears. Set SUNO_API_KEY to the Apiframe key. Defensive field
// parsing since reseller response shapes drift.
const APIFRAME_BASE = 'https://api.apiframe.ai/v2'

async function generateWithSuno(input: MusicGenerateInput): Promise<MusicResult> {
  const apiKey = process.env.SUNO_API_KEY
  if (!apiKey) {
    throw new Error('Suno is not configured yet — set SUNO_API_KEY (Apiframe). Use MiniMax in the meantime.')
  }
  const headers = { 'Content-Type': 'application/json', 'X-API-Key': apiKey }
  const prompt  = (input.style ? `${input.description}. Style: ${input.style}` : input.description).slice(0, 1000)

  // Submit (custom_mode false → Suno writes its own lyrics from the prompt)
  const subRes = await withRetry(() => fetch(`${APIFRAME_BASE}/music/generate`, {
    method: 'POST', headers,
    body: JSON.stringify({ model: 'suno', prompt, sunoParams: { custom_mode: false, instrumental: input.instrumental, model_version: 'V5' } }),
  }), { retryOn: isTransient })
  if (!subRes.ok) throw new Error(`Suno submit failed (${subRes.status}): ${(await subRes.text().catch(() => '')).slice(0, 200)}`)
  const sub = await subRes.json() as any
  const jobId = sub.jobId ?? sub.job_id ?? sub.id ?? sub.task_id ?? sub.data?.jobId ?? sub.data?.id
  if (!jobId) throw new Error('Suno submit returned no job id')

  // Poll until an audio URL appears (Suno is typically 30–90s)
  const deadline = Date.now() + 180_000
  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, 4000))
    const jr = await fetch(`${APIFRAME_BASE}/jobs/${jobId}`, { headers })
    if (!jr.ok) continue
    const j = await jr.json() as any
    const status = String(j.status ?? j.result?.status ?? '').toLowerCase()
    if (status.includes('fail') || status.includes('error')) throw new Error(`Suno generation failed: ${j.error ?? status}`)
    const tracks = j.result?.tracks ?? j.tracks ?? j.data?.tracks ?? []
    const track  = Array.isArray(tracks) ? tracks[0] : tracks
    const url    = track?.audioUrl ?? track?.audio_url ?? track?.url ?? track?.audio
    if (url) return { url, title: track?.title, duration: track?.duration }
  }
  throw new Error('Suno generation timed out')
}
