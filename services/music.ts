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

// ─── Suno (third-party reseller) ────────────────────────────────────────────
// No official Suno API exists; this is a placeholder for a reseller adapter
// (apiframe / EvoLink / etc.) wired once a provider + SUNO_API_KEY are chosen.
async function generateWithSuno(_input: MusicGenerateInput): Promise<MusicResult> {
  if (!process.env.SUNO_API_KEY) {
    throw new Error('Suno is not configured yet — choose a Suno API provider and set SUNO_API_KEY. Use MiniMax in the meantime.')
  }
  throw new Error('Suno provider adapter is not implemented yet.')
}
