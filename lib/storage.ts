import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// Cloudflare R2 is S3-compatible — same SDK, different endpoint + region
function getR2Client() {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID!}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId:     process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  })
}

/**
 * Fetches a URL (e.g. from fal.ai or OpenAI) and uploads it to R2.
 * Returns the permanent public URL.
 */
export async function uploadFromUrl(
  sourceUrl: string,
  key: string,
  contentType = 'image/png',
): Promise<string> {
  const response = await fetch(sourceUrl)
  if (!response.ok) throw new Error(`Failed to fetch asset from source: ${response.status}`)

  const buffer = Buffer.from(await response.arrayBuffer())

  const client = getR2Client()
  await client.send(
    new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET!,
      Key:         key,
      Body:        buffer,
      ContentType: contentType,
    }),
  )

  return `${process.env.R2_PUBLIC_URL}/${key}`
}

/**
 * Uploads a raw buffer directly to R2.
 * Returns the permanent public URL.
 */
export async function uploadBuffer(
  buffer: Buffer,
  key: string,
  contentType: string,
): Promise<string> {
  const client = getR2Client()
  await client.send(
    new PutObjectCommand({
      Bucket:      process.env.R2_BUCKET!,
      Key:         key,
      Body:        buffer,
      ContentType: contentType,
    }),
  )

  return `${process.env.R2_PUBLIC_URL}/${key}`
}

/**
 * Generates a namespaced R2 key for an asset.
 * Format: {tenantId}/{type}/{timestamp}-{random}.{ext}
 */
export function makeAssetKey(
  tenantId: string,
  type: 'images' | 'graphics' | 'videos' | 'audio' | 'documents',
  ext = 'png',
): string {
  const ts  = Date.now()
  const rnd = Math.random().toString(36).slice(2, 8)
  return `${tenantId}/${type}/${ts}-${rnd}.${ext}`
}
