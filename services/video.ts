import { fal } from '@fal-ai/client'
import type { VideoGenerateInput } from '@/lib/schemas/generate'
import { withRetry, isTransient } from '@/lib/retry'

// Verify model IDs at https://fal.ai/models
const VIDEO_MODEL_MAP: Record<string, string> = {
  'kling-3.0': 'fal-ai/kling-video/v3/standard/text-to-video',
  'kling-2.1': 'fal-ai/kling-video/v2.1/master/text-to-video',   // 2.1 t2v exists only under "master"; "standard" is image-to-video only
  'veo-3':     'fal-ai/veo3',
  'minimax':   'fal-ai/minimax/video-01-live',
  'hunyuan':   'fal-ai/hunyuan-video',
  'wan':       'fal-ai/wan-t2v',
}

const MOTION_MODEL = 'fal-ai/kling-video/v2.1/standard/image-to-video'

export async function generateMotionVideo(
  imageUrl:    string,
  prompt:      string,
  duration:    string,
  aspectRatio: string,
): Promise<string> {
  fal.config({ credentials: process.env.FAL_KEY! })

  const result = await withRetry(() => fal.run(MOTION_MODEL, {
    input: {
      image_url:    imageUrl,
      prompt,
      duration:     duration as '5' | '10' | '30' | '60',
      aspect_ratio: aspectRatio,
    } as any,
  }), { retryOn: isTransient })

  // @fal-ai/client v1 wraps output in `.data`; fall back to the root for older shapes.
  const r = (result as any)?.data ?? (result as any)
  const url = r.video?.url ?? r.video_url ?? r.url
  if (!url) throw new Error('No video URL returned from model')
  return url
}

const ASPECT_MAP: Record<string, string> = {
  '16:9': '16:9',
  '9:16': '9:16',
  '1:1':  '1:1',
}

export async function generateVideo(input: VideoGenerateInput): Promise<string> {
  fal.config({ credentials: process.env.FAL_KEY! })

  const modelId = VIDEO_MODEL_MAP[input.model]
  if (!modelId) throw new Error(`Unknown video model: ${input.model}`)

  const result = await withRetry(() => fal.run(modelId, {
    input: {
      prompt:       input.prompt,
      duration:     input.duration,
      aspect_ratio: ASPECT_MAP[input.aspectRatio] ?? '16:9',
    },
  }), { retryOn: isTransient })

  // @fal-ai/client v1 wraps output in `.data`; fall back to the root for older shapes.
  const r = (result as any)?.data ?? (result as any)
  const url = r.video?.url ?? r.video_url ?? r.url
  if (!url) throw new Error('No video URL returned from model')
  return url
}
