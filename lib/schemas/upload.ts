import { z } from 'zod'

const MAX_BYTES = 20 * 1024 * 1024 // 20 MB — matches CLAUDE.md upload policy

// Shared file-field validation for multipart uploads.
const uploadFile = z
  .instanceof(File, { message: 'No file provided' })
  .refine((f) => f.size > 0,         { message: 'File is empty' })
  .refine((f) => f.size <= MAX_BYTES, { message: 'File exceeds 20 MB limit' })

// POST /api/v1/upload/extract — reference document for text extraction.
export const extractUploadSchema = z.object({
  file: uploadFile,
})

// POST /api/v1/brands/[id]/upload — logo image or knowledge-base document.
export const brandUploadSchema = z.object({
  file:     uploadFile,
  type:     z.enum(['logo', 'document']),
  logoSlot: z.string().max(64).nullish(),
})
