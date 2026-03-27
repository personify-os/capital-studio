import { z } from 'zod'

export const imageGenerateSchema = z.object({
  prompt:        z.string().min(1).max(600),
  model:         z.enum([
    'flux-pro',
    'fal-flux',
    'ideogram-v3',
    'recraft-v3',
    'imagen-4',
    'dall-e-3',
    'seedream-v3',
    'realistic-vision',
  ]),
  aspectRatio:   z.enum(['1:1', '16:9', '9:16', '4:5']),
  variations:    z.number().int().min(1).max(4),
  brandId:       z.enum(['lhcapital', 'simrp', 'personal']).optional(),
  enhancePrompt: z.boolean().optional(),
})

export const graphicGenerateSchema = z.object({
  templateId: z.string(),
  brandId:    z.enum(['lhcapital', 'simrp', 'personal']),
  headline:   z.string().min(1).max(100),
  subtext:    z.string().max(200).optional(),
  cta:        z.string().max(60).optional(),
  topic:      z.string().max(100).optional(),
})

export const captionGenerateSchema = z.object({
  platform:    z.enum(['instagram', 'facebook', 'linkedin', 'x', 'youtube', 'tiktok', 'threads']),
  tone:        z.enum(['professional', 'casual', 'inspirational', 'educational']),
  topic:       z.string().min(1).max(200),
  brandId:     z.enum(['lhcapital', 'simrp', 'personal']).optional(),
  keywords:    z.array(z.string()).optional(),
  includeHashtags: z.boolean().optional(),
  seriesCount: z.number().int().min(1).max(10).optional(),
})

export type ImageGenerateInput  = z.infer<typeof imageGenerateSchema>
export type GraphicGenerateInput = z.infer<typeof graphicGenerateSchema>
export type CaptionGenerateInput = z.infer<typeof captionGenerateSchema>
