import type { AudioGenerateInput } from '@/lib/schemas/generate'
import { withRetry, isTransient } from '@/lib/retry'

export const VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel',  description: 'Professional female, calm & clear' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh',    description: 'Professional male, authoritative' },
  { id: 'AZnzlk1XvdvUeBnXmlld', name: 'Domi',    description: 'Confident female, strong delivery' },
  { id: 'ErXwobaYiN019PkySvjV', name: 'Antoni',  description: 'Conversational male, warm tone' },
  { id: 'MF3mGyEYCl7XYWbV9V6O', name: 'Elli',    description: 'Friendly female, upbeat' },
  { id: 'VR6AewLTigWG4xSOukaG', name: 'Arnold',  description: 'Deep male, trustworthy' },
]

export async function generateVoiceover(input: AudioGenerateInput): Promise<Buffer> {
  const response = await withRetry(() => fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${input.voiceId}`,
    {
      method:  'POST',
      headers: {
        'xi-api-key':   process.env.ELEVENLABS_API_KEY!,
        'Content-Type': 'application/json',
        'Accept':       'audio/mpeg',
      },
      body: JSON.stringify({
        text:          input.text,
        model_id:      'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.0, use_speaker_boost: true },
      }),
    },
  ), { retryOn: isTransient })

  if (!response.ok) {
    const err = await response.text().catch(() => response.statusText)
    throw new Error(`ElevenLabs error ${response.status}: ${err}`)
  }

  return Buffer.from(await response.arrayBuffer())
}
