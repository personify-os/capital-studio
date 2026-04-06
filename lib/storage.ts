import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { randomBytes } from 'crypto'

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

// Trusted domains that uploadFromUrl may fetch from.
// All AI-generated asset URLs originate from one of these hosts.
const ALLOWED_SOURCE_HOSTS = new Set([
  'fal.media',
  'fal.run',
  'storage.googleapis.com',
  'oaidalleapiprodscus.blob.core.windows.net', // OpenAI DALL-E
  'cdn.openai.com',
  'v3.fal.media',
  'heygen.com',   // HeyGen Likeness Video CDN
  'heygen.ai',    // HeyGen Likeness Video CDN (alternate)
])

function assertTrustedUrl(raw: string): void {
  let parsed: URL
  try { parsed = new URL(raw) } catch { throw new Error('Invalid source URL') }
  if (parsed.protocol !== 'https:') throw new Error('Only HTTPS source URLs are allowed')
  const host = parsed.hostname
  // Allow exact match or any subdomain of a trusted host
  const trusted = [...ALLOWED_SOURCE_HOSTS].some(
    (allowed) => host === allowed || host.endsWith('.' + allowed),
  )
  if (!trusted) throw new Error(`Source URL host not in allowlist: ${host}`)
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
  assertTrustedUrl(sourceUrl)
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 60_000) // 60s max
  let response: Response
  try {
    response = await fetch(sourceUrl, { signal: controller.signal })
  } finally {
    clearTimeout(timeout)
  }
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
  const rnd = randomBytes(4).toString('hex')
  return `${tenantId}/${type}/${ts}-${rnd}.${ext}`
}
