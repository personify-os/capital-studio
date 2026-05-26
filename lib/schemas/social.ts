import { z } from 'zod'

export const threadsConnectSchema = z.object({
  token: z.string().min(1).max(2000),
})

export const substackConnectSchema = z.object({
  subdomain: z.string().min(1).max(253),
  cookie:    z.string().min(1).max(4000),
})

export const linkedinInspectSchema = z.object({
  accessToken: z.string().min(1).max(2000),
})

export const scheduledPostSchema = z.object({
  assetId:     z.string().cuid(),
  platformIds: z.array(z.string()).min(1),
  caption:     z.string().max(5000).optional(),
  scheduledAt: z.string().datetime().optional(),
})

export type ThreadsConnectInput  = z.infer<typeof threadsConnectSchema>
export type SubstackConnectInput = z.infer<typeof substackConnectSchema>
export type LinkedinInspectInput = z.infer<typeof linkedinInspectSchema>
export type ScheduledPostInput   = z.infer<typeof scheduledPostSchema>
