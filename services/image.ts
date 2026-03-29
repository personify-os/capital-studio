import { fal } from '@fal-ai/client'
import OpenAI from 'openai'
import type { ImageGenerateInput } from '@/lib/schemas/generate'

// Configure fal.ai credentials (server-side only)
function getFalClient() {
  fal.config({ credentials: process.env.FAL_KEY! })
  return fal
}

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// ─── Model router ─────────────────────────────────────────────────────────────

// Verify model IDs at https://fal.ai/models before deploying new models
const FAL_MODEL_MAP: Record<string, string> = {
  'flux-pro':         'fal-ai/flux-pro/v1.1',
  'fal-flux':         'fal-ai/flux/schnell',
  'ideogram-v3':      'fal-ai/ideogram/v3',
  'recraft-v3':       'fal-ai/recraft-v3',
  'imagen-4':         'fal-ai/imagen4/preview',
  'seedream-v3':      'fal-ai/seedream/v3',
  'realistic-vision': 'fal-ai/realistic-vision',
  'nano-banana-2':    'fal-ai/nano-banana/v2',
  'nano-banana-pro':  'fal-ai/nano-banana/pro',
  'gemini-flash':     'fal-ai/google/gemini-flash-exp',
  'gemini-flash-pro': 'fal-ai/google/gemini-flash-pro-exp',
}

// Aspect ratio string → width/height for fal.ai
const ASPECT_SIZES: Record<string, { width: number; height: number }> = {
  '1:1':  { width: 1024, height: 1024 },
  '16:9': { width: 1280, height: 720 },
  '9:16': { width: 720,  height: 1280 },
  '4:5':  { width: 820,  height: 1024 },
}

export async function generateImages(input: ImageGenerateInput, prompt: string): Promise<string[]> {
  const { model, aspectRatio, variations } = input
  const size = ASPECT_SIZES[aspectRatio]

  if (model === 'dall-e-3') {
    return generateWithDalle(prompt, variations, aspectRatio)
  }

  const falModel = FAL_MODEL_MAP[model]
  if (!falModel) throw new Error(`Unknown model: ${model}`)

  const client = getFalClient()
  const results = await Promise.all(
    Array.from({ length: variations }, () =>
      client.run(falModel, {
        input: { prompt, image_size: size, num_inference_steps: 28, guidance_scale: 3.5 },
      }),
    ),
  )

  return results.flatMap((r: any) =>
    (r.images ?? [r.image]).map((img: any) => (typeof img === 'string' ? img : img.url)),
  )
}

async function generateWithDalle(prompt: string, count: number, aspectRatio: string): Promise<string[]> {
  const openai = getOpenAI()
  const sizeMap: Record<string, '1024x1024' | '1792x1024' | '1024x1792'> = {
    '1:1':  '1024x1024',
    '16:9': '1792x1024',
    '9:16': '1024x1792',
    '4:5':  '1024x1024',
  }

  const responses = await Promise.all(
    Array.from({ length: Math.min(count, 4) }, () =>
      openai.images.generate({ model: 'dall-e-3', prompt, size: sizeMap[aspectRatio] ?? '1024x1024', quality: 'standard' }),
    ),
  )

  return responses.flatMap((r) => (r.data ?? []).map((d) => d.url!))
}
