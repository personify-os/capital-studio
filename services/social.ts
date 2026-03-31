// Social publishing service — Facebook + Instagram Graph API

const GRAPH = 'https://graph.facebook.com/v21.0'

export interface FacebookPage {
  id:           string
  name:         string
  access_token: string
  instagram_business_account?: { id: string }
}

// ─── Token exchange ────────────────────────────────────────────────────────────

export async function exchangeForLongLivedToken(shortToken: string): Promise<string> {
  const appId     = process.env.META_APP_ID!
  const appSecret = process.env.META_APP_SECRET!
  const url = `${GRAPH}/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${encodeURIComponent(shortToken)}`
  const res  = await fetch(url)
  const json = await res.json()
  if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Token exchange failed')
  return json.access_token as string
}

// ─── Fetch managed pages ───────────────────────────────────────────────────────

export async function getFacebookPages(userToken: string): Promise<FacebookPage[]> {
  const fields = 'id,name,access_token,instagram_business_account'
  const res  = await fetch(`${GRAPH}/me/accounts?fields=${fields}&access_token=${encodeURIComponent(userToken)}`)
  const json = await res.json()
  if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Failed to fetch pages')
  return (json.data ?? []) as FacebookPage[]
}

// ─── Facebook posting ──────────────────────────────────────────────────────────

export async function publishToFacebook(
  pageId:      string,
  pageToken:   string,
  caption:     string,
  imageUrl?:   string,
): Promise<string> {
  let endpoint: string
  let body: Record<string, string>

  if (imageUrl) {
    endpoint = `${GRAPH}/${pageId}/photos`
    body = { url: imageUrl, message: caption, access_token: pageToken }
  } else {
    endpoint = `${GRAPH}/${pageId}/feed`
    body = { message: caption, access_token: pageToken }
  }

  const res  = await fetch(endpoint, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams(body).toString(),
  })
  const json = await res.json()
  if (!res.ok || json.error) throw new Error(json.error?.message ?? 'Facebook publish failed')
  return (json.id ?? json.post_id ?? '') as string
}

// ─── Threads posting ───────────────────────────────────────────────────────────

export async function publishToThreads(
  userId:    string,
  token:     string,
  caption:   string,
  imageUrl?: string,
): Promise<string> {
  const GRAPH = 'https://graph.threads.net/v1.0'

  const containerParams: Record<string, string> = {
    text:         caption,
    access_token: token,
  }
  if (imageUrl) {
    containerParams.media_type = 'IMAGE'
    containerParams.image_url  = imageUrl
  } else {
    containerParams.media_type = 'TEXT'
  }

  // Step 1: create media container
  const containerRes = await fetch(`${GRAPH}/${userId}/threads`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams(containerParams).toString(),
  })
  const container = await containerRes.json()
  if (!containerRes.ok || container.error) {
    throw new Error(container.error?.message ?? 'Threads container creation failed')
  }

  // Step 2: publish
  const publishRes = await fetch(`${GRAPH}/${userId}/threads_publish`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ creation_id: container.id, access_token: token }).toString(),
  })
  const published = await publishRes.json()
  if (!publishRes.ok || published.error) {
    throw new Error(published.error?.message ?? 'Threads publish failed')
  }
  return published.id as string
}

// ─── LinkedIn posting ──────────────────────────────────────────────────────────

export async function getLinkedInProfile(token: string): Promise<{ id: string; name: string }> {
  const res  = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${token}` },
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'Failed to fetch LinkedIn profile')
  return { id: json.sub as string, name: (json.name ?? json.email ?? 'LinkedIn') as string }
}

export async function publishToLinkedIn(
  personId: string,
  token:    string,
  caption:  string,
  imageUrl?: string,
): Promise<string> {
  const author = `urn:li:person:${personId}`

  const shareContent: Record<string, unknown> = imageUrl
    ? {
        shareMediaCategory: 'IMAGE',
        media: [{ status: 'READY', originalUrl: imageUrl, title: { text: caption.slice(0, 200) } }],
      }
    : { shareMediaCategory: 'NONE' }

  const body = {
    author,
    lifecycleState:  'PUBLISHED',
    specificContent: { 'com.linkedin.ugc.ShareContent': { shareCommentary: { text: caption }, ...shareContent } },
    visibility:      { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  }

  const res  = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'X-Restli-Protocol-Version': '2.0.0' },
    body:    JSON.stringify(body),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? 'LinkedIn publish failed')
  return (json.id ?? '') as string
}

// ─── X (Twitter) — OAuth 1.0a ──────────────────────────────────────────────────
// Uses app-level OAuth 1.0a credentials from env vars (no per-user token storage).

import { createHmac, randomBytes } from 'crypto'

function xOAuth1Header(method: string, url: string): string {
  const enc = encodeURIComponent

  const params: Record<string, string> = {
    oauth_consumer_key:     process.env.TWITTER_API_KEY!,
    oauth_nonce:            randomBytes(16).toString('hex'),
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp:        String(Math.floor(Date.now() / 1000)),
    oauth_token:            process.env.TWITTER_ACCESS_TOKEN!,
    oauth_version:          '1.0',
  }

  const paramString = Object.keys(params)
    .sort()
    .map((k) => `${enc(k)}=${enc(params[k])}`)
    .join('&')

  const base      = `${method.toUpperCase()}&${enc(url)}&${enc(paramString)}`
  const signingKey= `${enc(process.env.TWITTER_API_SECRET!!)}&${enc(process.env.TWITTER_ACCESS_TOKEN_SECRET!)}`
  params.oauth_signature = createHmac('sha1', signingKey).update(base).digest('base64')

  return 'OAuth ' + Object.keys(params)
    .sort()
    .map((k) => `${enc(k)}="${enc(params[k])}"`)
    .join(', ')
}

export async function getXProfile(): Promise<{ id: string; name: string }> {
  const url = 'https://api.twitter.com/2/users/me'
  const res = await fetch(url, {
    headers: { Authorization: xOAuth1Header('GET', url) },
  })
  const json = await res.json()
  if (!res.ok || json.errors) {
    const detail = json.errors?.[0]?.message ?? json.detail ?? json.title ?? JSON.stringify(json)
    throw new Error(`X API error (${res.status}): ${detail}`)
  }
  return { id: json.data.id as string, name: (json.data.name ?? json.data.username ?? 'X') as string }
}

export async function publishToX(
  _userId: string,
  _token:  string,
  caption: string,
): Promise<string> {
  const url = 'https://api.twitter.com/2/tweets'
  const res = await fetch(url, {
    method:  'POST',
    headers: { Authorization: xOAuth1Header('POST', url), 'Content-Type': 'application/json' },
    body:    JSON.stringify({ text: caption }),
  })
  const json = await res.json()
  if (!res.ok || json.errors) throw new Error(json.errors?.[0]?.message ?? 'X publish failed')
  return (json.data?.id ?? '') as string
}

// ─── Medium posting ────────────────────────────────────────────────────────────

export async function getMediumProfile(token: string): Promise<{ id: string; name: string }> {
  const res  = await fetch('https://api.medium.com/v1/me', {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
  })
  const json = await res.json()
  if (!res.ok || json.errors) {
    throw new Error(json.errors?.[0]?.message ?? 'Failed to fetch Medium profile')
  }
  return { id: String(json.data.id), name: json.data.name ?? json.data.username ?? 'Medium' }
}

export async function publishToMedium(
  userId:  string,
  token:   string,
  caption: string,
): Promise<string> {
  // Use first line as title, rest as body
  const lines  = caption.trim().split('\n')
  const title  = lines[0].slice(0, 255) || 'New Post'
  const body   = lines.slice(1).join('\n').trim() || caption

  const res = await fetch(`https://api.medium.com/v1/users/${userId}/posts`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      contentFormat: 'markdown',
      content:       body,
      publishStatus: 'public',
    }),
  })
  const json = await res.json()
  if (!res.ok || json.errors) {
    throw new Error(json.errors?.[0]?.message ?? 'Medium publish failed')
  }
  return (json.data?.id ?? '') as string
}

// ─── Substack posting (publish-by-email via Resend) ───────────────────────────

export async function publishToSubstack(
  publishEmail: string,
  caption:      string,
): Promise<string> {
  const { Resend } = await import('resend')
  const resend = new Resend(process.env.RESEND_API_KEY!)

  const lines = caption.trim().split('\n')
  const subject = lines[0].slice(0, 255) || 'New Post'
  const body    = lines.slice(1).join('\n').trim() || caption

  const { data, error } = await resend.emails.send({
    from:    'Capital Studio <studio@lhccapital.org>',
    to:      publishEmail,
    subject,
    text:    body,
  })

  if (error) throw new Error(error.message ?? 'Substack publish failed')
  return data?.id ?? ''
}

// ─── Instagram posting ─────────────────────────────────────────────────────────
// Requires image URL. Instagram does not support text-only posts via API.

export async function publishToInstagram(
  igAccountId: string,
  pageToken:   string,
  caption:     string,
  imageUrl:    string,
): Promise<string> {
  // Step 1: create media container
  const containerRes  = await fetch(`${GRAPH}/${igAccountId}/media`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ image_url: imageUrl, caption, access_token: pageToken }).toString(),
  })
  const container = await containerRes.json()
  if (!containerRes.ok || container.error) {
    throw new Error(container.error?.message ?? 'Instagram container creation failed')
  }

  // Step 2: publish the container
  const publishRes  = await fetch(`${GRAPH}/${igAccountId}/media_publish`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({ creation_id: container.id, access_token: pageToken }).toString(),
  })
  const published = await publishRes.json()
  if (!publishRes.ok || published.error) {
    throw new Error(published.error?.message ?? 'Instagram publish failed')
  }
  return published.id as string
}
