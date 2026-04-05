import { fal } from '@fal-ai/client'
import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'
import type { ImageGenerateInput } from '@/lib/schemas/generate'
import type { BrandConfig } from '@/lib/brands'
import { withRetry, isTransient } from '@/lib/retry'

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

// ─── Claude-powered prompt enhancer ──────────────────────────────────────────

/**
 * Uses Claude to rewrite a basic user prompt into a rich, cinematically detailed
 * image generation prompt with specific lighting, composition, color treatment,
 * and brand-appropriate visual style — before sending to the image model.
 *
 * Applies the "restraint bias" from professional photo direction:
 * moody/slightly dark is better than bright/oversaturated.
 */
export async function enhanceImagePrompt(rawPrompt: string, brand: BrandConfig): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const briefBrandCtx = [
    `Brand: ${brand.label}`,
    brand.visualStyle ? `Visual style: ${brand.visualStyle}` : null,
    `Primary color: ${brand.colors.primary}`,
    `Accent color: ${brand.colors.accent}`,
  ].filter(Boolean).join('\n')

  const message = await client.messages.create({
    model:      'claude-haiku-4-5-20251001',
    max_tokens: 350,
    system: `You are an expert AI image prompt engineer for professional B2B marketing photography.
Transform basic image prompts into rich, cinematically detailed prompts that produce stunning professional results.

Rules:
- Add specific lighting direction and quality (e.g. "soft directional window light from upper left, warm golden rim lighting")
- Add composition details (e.g. "medium shot, shallow depth of field f/2.8, subject sharp, background softly blurred")
- Add color treatment (e.g. "slightly desaturated, muted professional tones, subtle cinematic color grade")
- Add texture/atmosphere appropriate for the subject
- Match the brand's visual aesthetic described in the context
- RESTRAINT BIAS: err toward moody and slightly dark over bright and saturated; understated > garish; realistic > stylized unless the prompt calls for it
- Preserve the core subject exactly — enrich the visual description, never change what is being depicted
- Do not add people, objects, or scenes not implied by the original prompt
- Output ONLY the enhanced prompt text — no labels, no preamble, no explanation — maximum 200 words`,
    messages: [{
      role:    'user',
      content: `Brand context:\n${briefBrandCtx}\n\nPrompt to enhance:\n${rawPrompt}`,
    }],
  })

  return message.content.find((b) => b.type === 'text')?.text?.trim() ?? rawPrompt
}

// ─── Main generation functions ────────────────────────────────────────────────

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
      withRetry(() => client.run(falModel, {
        input: { prompt, image_size: size, num_inference_steps: 28, guidance_scale: 3.5 },
      }), { retryOn: isTransient }),
    ),
  )

  return results.flatMap((r: any) =>
    (r.images ?? (r.image ? [r.image] : [])).map((img: any) => (typeof img === 'string' ? img : img?.url)).filter(Boolean),
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

  // DALL-E-3 does not support batching — requests must be sequential
  const urls: string[] = []
  for (let i = 0; i < Math.min(count, 4); i++) {
    const r = await openai.images.generate({ model: 'dall-e-3', prompt, size: sizeMap[aspectRatio] ?? '1024x1024', quality: 'standard' })
    for (const d of r.data ?? []) { if (d.url) urls.push(d.url) }
  }
  return urls
}
