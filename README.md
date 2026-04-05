# Capital Studio

Internal AI-powered content creation platform for LH Capital and The SIMRP.

Generates branded images, graphics, captions, videos, audio, and music across three brand identities. Schedules and publishes posts to 9 social platforms.

**Internal use only. Not a public product.**

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Neon PostgreSQL + Prisma 6
- **Storage:** Cloudflare R2
- **Auth:** NextAuth v4 (credentials)
- **AI:** Anthropic Claude, fal.ai, OpenAI, ElevenLabs, Suno
- **Hosting:** Railway
- **Port:** 3004

---

## First-Time Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

Required variables (app will not start without these in production):
- `DATABASE_URL` — Neon pooled connection string
- `DIRECT_URL` — Neon direct connection string (migrations only)
- `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
- `NEXTAUTH_URL` — `http://localhost:3004` locally, `https://studio.lhccapital.org` in prod
- `TOKEN_ENCRYPTION_KEY` — 64 hex chars: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `CRON_SECRET` — any random secret for cron auth: same command as above
- `ANTHROPIC_API_KEY`, `FAL_KEY`, `OPENAI_API_KEY`
- `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_PUBLIC_URL`

### 3. Run database migrations

```bash
export $(grep -v '^#' .env.local | xargs)
npx prisma migrate deploy
```

> Use `migrate deploy` (not `migrate dev`) for production and staging.
> Use `migrate dev` only in local development — it creates new migration files.

### 4. Seed the admin user

```bash
npx prisma db seed
```

This creates the `info@lhccapital.org` admin account using the `SEED_PASSWORD` env var. Run once on a fresh database.

### 5. Start the dev server

```bash
npm run dev
```

App runs at `http://localhost:3004`.

---

## Deployment (Railway)

The app deploys automatically on merge to `main` via GitHub Actions (`.github/workflows/ci.yml`).

### Required Railway environment variables

Set all vars from `.env.example` in the Railway dashboard. The following are critical — the app will fail to start without them:

- `DATABASE_URL`, `DIRECT_URL`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `TOKEN_ENCRYPTION_KEY`
- `CRON_SECRET`
- `ANTHROPIC_API_KEY`, `FAL_KEY`, `OPENAI_API_KEY`
- `R2_*` (all five R2 variables)

### Cron job

Configured in `railway.toml`. Fires every minute, calls `POST /api/v1/cron/publish` with `Authorization: Bearer $CRON_SECRET`.

The endpoint publishes any scheduled posts that are due. Failed posts are marked `FAILED` with an error message visible in the Scheduler UI.

### Pre-deploy checklist

- [ ] All required env vars set in Railway
- [ ] `npx prisma migrate deploy` run against the production database
- [ ] `TOKEN_ENCRYPTION_KEY` is set (app throws on startup if missing in production)
- [ ] `CRON_SECRET` is set and matches `railway.toml` cron command

---

## Authentication

Login at `/login` with:
- **Email:** `info@lhccapital.org`
- **Password:** set via `SEED_PASSWORD` during initial seed, then changeable in the DB

No demo mode. No public registration. Contact an admin to add users directly in the database.

---

## Feature Flags

Phase 2 modules are off by default. Enable in Railway env vars:

| Env var                 | Enables                     |
|-------------------------|-----------------------------|
| `FLAG_VIDEO_GENERATION=true` | Video Studio (/videos)  |
| `FLAG_VOICEOVER=true`   | VoiceOver Studio (/audio)   |
| `FLAG_MOTION_VIDEO=true` | Motion Studio (/motion)    |
| `FLAG_SOCIAL_YOUTUBE=true` | YouTube connect + posting |
| `FLAG_SOCIAL_TIKTOK=true`  | TikTok connect + posting  |

Core modules (Images, Graphics, Writer, Brand Vault, Library, Music, Analytics, Scheduler) are always on. Disable the scheduler with `FLAG_SOCIAL_SCHEDULER=false`.

---

## Social Platform Setup

Each platform requires OAuth credentials in Railway env vars. See `.env.example` for the full list.

| Platform   | Credentials needed              | Notes |
|------------|---------------------------------|-------|
| Facebook   | `META_APP_ID`, `META_APP_SECRET` | Also covers Instagram |
| Threads    | `THREADS_APP_ID`, `THREADS_APP_SECRET` | OAuth callback flow |
| LinkedIn   | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | Manual token entry |
| X          | `TWITTER_API_KEY/SECRET` + access token pair | OAuth 1.0a app-level |
| YouTube    | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Requires `FLAG_SOCIAL_YOUTUBE=true` |
| TikTok     | `TIKTOK_CLIENT_KEY`, `TIKTOK_CLIENT_SECRET` | Requires `FLAG_SOCIAL_TIKTOK=true` |
| Bluesky    | None — users enter handle + app password in UI | |
| Medium     | None — users enter session cookies in UI | Unofficial API |
| Substack   | None — users enter subdomain + session cookie | Unofficial API |

---

## Database Migrations

```bash
# Local development — creates a new migration file
npx prisma migrate dev --name describe_what_changed

# Production / staging — applies existing migrations only
npx prisma migrate deploy

# After pulling new code with schema changes
npx prisma generate
```

---

## Project Structure

```
app/
  (auth)/login/          Login page
  (studio)/              All studio pages
  api/v1/                All API routes

components/
  ui/                    Button, Spinner, Badge, Textarea
  layout/                Sidebar, Topbar
  shared/                BrandSelector, ContentIntent
  scheduler/             Scheduler-specific components
  library/               Library card/row components
  analytics/             Charts
  dashboard/             AssetThumb

hooks/
  useGenerate.ts         Shared generation hook (use for all AI generation)
  useAnalytics.ts        Analytics data processing

lib/
  auth.ts                NextAuth config
  brands.ts              Brand identity configs (source of truth for brand colors)
  cost.ts                AI cost estimates per model
  crypto.ts              AES-256-GCM token encryption
  flags.ts               Feature flag definitions
  graphic-templates.ts   Graphic template definitions
  platform-colors.ts     Social platform color classes
  retry.ts               withRetry() + isTransient() for external APIs
  ratelimit.ts           In-memory sliding window rate limiter
  storage.ts             Cloudflare R2 upload utilities
  schemas/               Zod schemas (one file per domain)

services/
  image.ts               fal.ai + OpenAI image generation
  video.ts               fal.ai video generation
  audio.ts               ElevenLabs voiceover
  music.ts               Suno music generation
  social.ts              Platform publish functions
  publisher.ts           publishPost() + publishDuePosts() cron logic

prisma/
  schema.prisma          Database schema
  migrations/            Migration history
  seed.ts                Admin user seeding
```

---

## Known Constraints

- **Rate limiter is in-memory** — works for single Railway instance. Must swap to Upstash Redis before scaling to 2+ instances.
- **Analytics loads last 365 days** — the server caps the query to prevent unbounded scans. "All time" in the UI reflects the 365-day window.
- **Video duration: 5s or 10s only** — Kling API limits. Do not add longer options without verifying API support.
- **WriterClient does not use `useGenerate`** — it generates in parallel across platforms; the single-call hook does not support this pattern.
