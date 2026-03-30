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
    'nano-banana-2',
    'nano-banana-pro',
    'gemini-flash',
    'gemini-flash-pro',
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
  photoUrl:   z.string().url().optional().or(z.literal('')),
})

export const captionGenerateSchema = z.object({
  platform:         z.enum(['instagram', 'facebook', 'linkedin', 'x', 'youtube', 'tiktok', 'threads']),
  tone:             z.enum(['professional', 'casual', 'inspirational', 'educational']),
  topic:            z.string().min(1).max(200),
  brandId:          z.enum(['lhcapital', 'simrp', 'personal']).optional(),
  keywords:         z.array(z.string()).optional(),
  includeHashtags:  z.boolean().optional(),
  seriesCount:      z.number().int().min(1).max(10).optional(),
  referenceContent: z.string().max(4000).optional(),
  referenceUrl:     z.string().url().optional().or(z.literal('')),
})

export const videoGenerateSchema = z.object({
  prompt:      z.string().min(1).max(1000),
  model:       z.enum(['kling-3.0', 'kling-2.1', 'veo-3', 'minimax', 'hunyuan', 'wan']),
  duration:    z.enum(['5', '10', '30', '60', '120']).default('5'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).default('16:9'),
  brandId:     z.enum(['lhcapital', 'simrp', 'personal']).optional(),
})

export const motionGenerateSchema = z.object({
  imageUrl:    z.string().url(),
  prompt:      z.string().min(1).max(500),
  duration:    z.enum(['5', '10']).default('5'),
  aspectRatio: z.enum(['16:9', '9:16', '1:1']).default('16:9'),
  brandId:     z.enum(['lhcapital', 'simrp', 'personal']).optional(),
})

export const audioGenerateSchema = z.object({
  text:    z.string().min(1).max(5000),
  voiceId: z.string().min(1),
  brandId: z.enum(['lhcapital', 'simrp', 'personal']).optional(),
})

export type ImageGenerateInput   = z.infer<typeof imageGenerateSchema>
export type GraphicGenerateInput = z.infer<typeof graphicGenerateSchema>
export type CaptionGenerateInput = z.infer<typeof captionGenerateSchema>
export type VideoGenerateInput   = z.infer<typeof videoGenerateSchema>
export type MotionGenerateInput  = z.infer<typeof motionGenerateSchema>
export type AudioGenerateInput   = z.infer<typeof audioGenerateSchema>

export const musicGenerateSchema = z.object({
  description:  z.string().min(1).max(500),
  style:        z.string().max(100).optional(),
  instrumental: z.boolean().default(false),
  model:        z.enum(['chirp-v4', 'chirp-v3-5', 'chirp-v3']).default('chirp-v4'),
  brandId:      z.enum(['lhcapital', 'simrp', 'personal']).optional(),
})
export type MusicGenerateInput = z.infer<typeof musicGenerateSchema>
