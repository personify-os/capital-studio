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
  const headers = { Authorization: `Bearer ${token}`, 'X-Restli-Protocol-Version': '2.0.0' }

  // Try /v2/me first (works with w_member_social in some cases)
  const meRes  = await fetch('https://api.linkedin.com/v2/me', { headers })
  if (meRes.ok) {
    const me = await meRes.json()
    if (me.id) {
      const name = [me.localizedFirstName, me.localizedLastName].filter(Boolean).join(' ') || 'LinkedIn Account'
      return { id: String(me.id), name }
    }
  }

  // Fallback: token introspection via client credentials
  const clientId     = process.env.LINKEDIN_CLIENT_ID
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET
  if (clientId && clientSecret) {
    const res  = await fetch('https://www.linkedin.com/oauth/v2/introspectToken', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    new URLSearchParams({ client_id: clientId, client_secret: clientSecret, token }).toString(),
    })
    const data = await res.json()
    if (res.ok && data.sub) return { id: String(data.sub), name: 'LinkedIn Account' }
  }

  // Last resort: userinfo (requires openid + profile scopes)
  const res  = await fetch('https://api.linkedin.com/v2/userinfo', { headers: { Authorization: `Bearer ${token}` } })
  const json = await res.json()
  if (!res.ok) throw new Error('Could not verify LinkedIn token — please ensure w_member_social scope is selected')
  return { id: json.sub as string, name: (json.name ?? 'LinkedIn') as string }
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

export async function getMediumProfile(uid: string, sid: string): Promise<{ id: string; name: string }> {
  // Verify the cookies work by hitting the internal profile endpoint
  const res = await fetch('https://medium.com/_/api/me', {
    headers: {
      Cookie:     `uid=${uid}; sid=${sid}`,
      Accept:     'application/json',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  })
  if (res.ok) {
    try {
      const json = await res.json()
      const user = json?.payload?.value ?? json?.payload?.user ?? json?.data
      if (user?.userId || user?.id) {
        return { id: String(user.userId ?? user.id), name: user.name ?? user.username ?? 'Medium' }
      }
    } catch { /* fall through */ }
  }
  // If API verification fails, trust the uid directly (user copied from DevTools)
  if (!uid.trim()) throw new Error('uid cookie is required')
  return { id: uid.trim(), name: 'Medium Account' }
}

export async function publishToMedium(
  userId:  string,
  token:   string,   // stored as "uid:sid"
  caption: string,
): Promise<string> {
  const [uid, ...rest] = token.split(':')
  const sid = rest.join(':')

  const lines  = caption.trim().split('\n')
  const title  = lines[0].slice(0, 255) || 'New Post'
  const body   = lines.slice(1).join('\n').trim() || caption

  const res = await fetch(`https://medium.com/_/api/users/${userId}/posts`, {
    method:  'POST',
    headers: {
      Cookie:         `uid=${uid}; sid=${sid}`,
      'Content-Type': 'application/json',
      'User-Agent':   'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
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
  return (json.payload?.value?.id ?? json.data?.id ?? '') as string
}

// ─── Bluesky posting (AT Protocol) ────────────────────────────────────────────

const BSKY_API = 'https://bsky.social/xrpc'

async function bskyCreateSession(identifier: string, appPassword: string) {
  const res  = await fetch(`${BSKY_API}/com.atproto.server.createSession`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ identifier, password: appPassword }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? json.error ?? 'Bluesky auth failed')
  return json as { did: string; handle: string; accessJwt: string }
}

export async function getBlueskyProfile(handle: string, appPassword: string): Promise<{ id: string; name: string }> {
  const session = await bskyCreateSession(handle, appPassword)
  return { id: session.did, name: `@${session.handle}` }
}

export async function publishToBluesky(
  did:         string,
  appPassword: string,
  caption:     string,
): Promise<string> {
  // Bluesky handle is stored as accountName; identifier can be the DID directly
  const session = await bskyCreateSession(did, appPassword)

  const res  = await fetch(`${BSKY_API}/com.atproto.repo.createRecord`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${session.accessJwt}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      repo:       session.did,
      collection: 'app.bsky.feed.post',
      record: {
        $type:     'app.bsky.feed.post',
        text:      caption.slice(0, 300), // Bluesky 300-char limit
        createdAt: new Date().toISOString(),
      },
    }),
  })
  const json = await res.json()
  if (!res.ok) throw new Error(json.message ?? json.error ?? 'Bluesky publish failed')
  return (json.uri ?? '') as string
}

// ─── Substack posting (internal API via session cookie) ───────────────────────

export async function getSubstackProfile(subdomain: string, _cookie: string): Promise<{ id: string; name: string }> {
  // Verify the subdomain resolves to a real Substack publication
  const res = await fetch(`https://${subdomain}.substack.com/`, {
    method:  'HEAD',
    headers: { 'User-Agent': 'Mozilla/5.0' },
    redirect: 'follow',
  })
  if (!res.ok && res.status !== 405) {
    throw new Error(`Publication "${subdomain}" not found — check your publication URL`)
  }
  return { id: subdomain, name: subdomain }
}

export async function publishToSubstack(
  subdomain: string,
  cookie:    string,
  caption:   string,
): Promise<string> {
  const base    = `https://${subdomain}.substack.com/api/v1`
  const headers = {
    Cookie:         `substack.sid=${cookie}`,
    'Content-Type': 'application/json',
    'User-Agent':   'Mozilla/5.0',
  }

  const lines    = caption.trim().split('\n')
  const title    = lines[0].slice(0, 255) || 'New Post'
  const bodyText = lines.slice(1).join('\n').trim() || caption
  // Substack draft body is HTML
  const bodyHtml = bodyText.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')

  // Step 1: create draft
  const draftRes  = await fetch(`${base}/drafts`, {
    method:  'POST',
    headers,
    body: JSON.stringify({
      draft_title:    title,
      draft_subtitle: '',
      draft_body:     JSON.stringify({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: bodyText }] }] }),
      type:           'newsletter',
    }),
  })
  const draft = await draftRes.json()
  if (!draftRes.ok || draft.error) throw new Error(draft.error ?? 'Substack draft creation failed')

  // Step 2: publish draft
  const publishRes  = await fetch(`${base}/drafts/${draft.id}/publish`, {
    method:  'POST',
    headers,
    body: JSON.stringify({ send_email: true, free_unlock: false }),
  })
  const published = await publishRes.json()
  if (!publishRes.ok || published.error) throw new Error(published.error ?? 'Substack publish failed')

  return String(draft.id)
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

// ─── YouTube (Google OAuth) ────────────────────────────────────────────────────

export async function getYouTubeChannel(accessToken: string): Promise<{ id: string; name: string }> {
  const res  = await fetch('https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = await res.json()
  if (!res.ok || !json.items?.length) throw new Error(json.error?.message ?? 'Could not fetch YouTube channel')
  return { id: json.items[0].id as string, name: json.items[0].snippet.title as string }
}

export async function refreshYouTubeToken(refreshToken: string): Promise<string> {
  const res  = await fetch('https://oauth2.googleapis.com/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      client_id:     process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type:    'refresh_token',
    }).toString(),
  })
  const json = await res.json()
  if (!res.ok || !json.access_token) throw new Error(json.error_description ?? 'YouTube token refresh failed')
  return json.access_token as string
}

export async function publishToYouTube(
  _channelId:  string,
  accessToken: string,  // plain access token (caller must refresh and persist before calling)
  caption:     string,
  videoUrl?:   string,
): Promise<string> {
  if (!videoUrl) throw new Error('YouTube requires a video URL')

  const lines       = caption.trim().split('\n')
  const title       = lines[0].slice(0, 100) || 'New Video'
  const description = caption

  const ext         = videoUrl.split('?')[0].split('.').pop()?.toLowerCase()
  const contentType = ext === 'mov' ? 'video/quicktime' : ext === 'webm' ? 'video/webm' : 'video/mp4'

  // Download video from storage URL
  const videoRes = await fetch(videoUrl)
  if (!videoRes.ok) throw new Error('Could not download video from URL')
  const videoBuffer = Buffer.from(await videoRes.arrayBuffer())

  // Step 1: initialize resumable upload
  const initRes = await fetch(
    'https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status',
    {
      method:  'POST',
      headers: {
        Authorization:             `Bearer ${accessToken}`,
        'Content-Type':            'application/json',
        'X-Upload-Content-Type':   contentType,
        'X-Upload-Content-Length': String(videoBuffer.byteLength),
      },
      body: JSON.stringify({
        snippet: { title, description, categoryId: '22' },
        status:  { privacyStatus: 'public' },
      }),
    }
  )
  if (!initRes.ok) {
    const err = await initRes.json()
    throw new Error(err.error?.message ?? 'YouTube upload init failed')
  }
  const uploadUrl = initRes.headers.get('Location')
  if (!uploadUrl) throw new Error('YouTube did not return upload URL')

  // Step 2: upload video data
  const uploadRes  = await fetch(uploadUrl, {
    method:  'PUT',
    headers: { 'Content-Type': contentType, 'Content-Length': String(videoBuffer.byteLength) },
    body:    videoBuffer,
  })
  const uploadJson = await uploadRes.json()
  if (!uploadRes.ok) throw new Error(uploadJson.error?.message ?? 'YouTube video upload failed')
  return (uploadJson.id ?? '') as string
}

// ─── TikTok (TikTok Developer API) ────────────────────────────────────────────

export async function getTikTokProfile(accessToken: string): Promise<{ id: string; name: string }> {
  const res  = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const json = await res.json()
  if (!res.ok || json.error?.code !== 'ok') throw new Error(json.error?.message ?? 'Could not fetch TikTok profile')
  return { id: json.data.user.open_id as string, name: (json.data.user.display_name ?? 'TikTok') as string }
}

export async function refreshTikTokToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; refreshExpiresIn: number }> {
  const res  = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      client_key:    process.env.TIKTOK_CLIENT_KEY!,
      client_secret: process.env.TIKTOK_CLIENT_SECRET!,
      grant_type:    'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  })
  const json = await res.json()
  if (!res.ok || json.error) throw new Error(json.error_description ?? 'TikTok token refresh failed')
  return {
    accessToken:      json.access_token as string,
    refreshToken:     (json.refresh_token ?? refreshToken) as string,
    refreshExpiresIn: (json.refresh_expires_in ?? 365 * 24 * 60 * 60) as number,
  }
}

export async function publishToTikTok(
  _userId:     string,
  accessToken: string,  // plain access token (caller must refresh and persist before calling)
  caption:     string,
  videoUrl?:   string,
): Promise<string> {
  if (!videoUrl) throw new Error('TikTok requires a video URL')

  const res  = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method:  'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      post_info: {
        title:                    caption.slice(0, 150),
        privacy_level:            'PUBLIC_TO_EVERYONE',
        disable_duet:             false,
        disable_comment:          false,
        disable_stitch:           false,
        video_cover_timestamp_ms: 1000,
      },
      source_info: { source: 'PULL_FROM_URL', video_url: videoUrl },
    }),
  })
  const json = await res.json()
  if (!res.ok || json.error?.code !== 'ok') throw new Error(json.error?.message ?? 'TikTok publish failed')
  return (json.data?.publish_id ?? '') as string
}
