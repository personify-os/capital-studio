import { fal } from '@fal-ai/client'
import type { MusicGenerateInput } from '@/lib/schemas/generate'
import { withRetry, isTransient } from '@/lib/retry'

export async function generateMusic(input: MusicGenerateInput): Promise<{ url: string; title?: string; duration?: number }> {
  fal.config({ credentials: process.env.FAL_KEY! })

  const result = await withRetry(() => fal.run('fal-ai/suno-v4', {
    input: {
      prompt:       input.description + (input.style ? `. Style: ${input.style}` : ''),
      instrumental: input.instrumental,
      model:        input.model,
    },
  }), { retryOn: isTransient }) as any

  const track = result.tracks?.[0] ?? result
  const url = track.audio_url ?? track.url ?? track.audio
  if (!url) throw new Error('No audio URL returned from Suno')
  return { url, title: track.title, duration: track.duration }
}
