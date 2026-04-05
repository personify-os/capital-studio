# Capital Studio — Claude Code Standing Instructions

**Product:** Capital Studio
**Port:** 3004
**Segment:** Internal — LH Capital team use only
**Auth:** Credentials only (`info@lhccapital.org` + password set in Railway). No demo mode.

---

## Product Overview

Capital Studio is an internal AI-powered content creation platform for LH Capital and The SIMRP.
It generates branded images, graphics, captions, and long-form content across three brand identities,
and schedules posts to 9 social platforms.

**Primary users:** LH Capital agents, marketing team, and leadership.

---

## Architecture Rules — NON-NEGOTIABLE

### No Inline Color Values
- All colors must reference Tailwind tokens from `tailwind.config.ts`
- Hex values may appear ONLY in `tailwind.config.ts` and `lib/brands.ts`
- Exception: hex values inside AI prompt strings in `lib/graphic-templates.ts` and `lib/brands.ts` are allowed
- Third-party platform colors (Facebook blue, Instagram pink, etc.) live in `lib/platform-colors.ts`

### Multi-Tenancy
- Every DB query involving user/tenant data MUST include `where: { tenantId: session.user.tenantId }`
- Cross-tenant data leakage is a critical security violation
- The cron job (`publishDuePosts`) is the only code that queries across tenants — it is intentional

### API-First
- All features have a `/api/v1/` endpoint before the UI consumes it
- UI components call the API — never hit the DB or call AI APIs directly from a component
- Service layer (`services/`) is the only place that touches external AI APIs

### Shared Hooks
- Use `useGenerate()` from `hooks/useGenerate.ts` for all generation calls
- Do NOT duplicate fetch/loading/error state in individual modules
- Exception: `WriterClient.tsx` — multi-platform parallel generation does not fit the single-call hook interface; treat as intentional

### External API Calls
- All calls to fal.ai, ElevenLabs, OpenAI, and Anthropic MUST be wrapped with `withRetry()` from `lib/retry.ts`
- Use `{ retryOn: isTransient }` to retry only on 429/503/502/timeout errors
- `uploadFromUrl` in `lib/storage.ts` validates the source URL against an allowlist of trusted hosts before fetching

### File Uploads
- MIME type validation uses magic byte inspection (`detectMimeFromBytes`) — do NOT rely on `file.type` alone
- Max upload size: 20 MB
- Allowed image types: JPEG, PNG, WebP, SVG
- Allowed document types: PDF, plain text

### Component Size Discipline
- Soft limit: 200 lines per component file
- If a file exceeds this, extract sub-components immediately

### Forbidden Patterns
- No raw SQL — Prisma query builder only
- No unversioned API endpoints (all must be `/api/v1/`)
- No secrets in client-side code (no `NEXT_PUBLIC_` prefix on API keys)
- No module reimplementing auth or sessions
- No unscoped tenant queries (missing `tenantId`)
- No hardcoded hex values in component files
- No `as any` casts in application code (API routes, components, hooks) — SDK-level casts in `services/` are acceptable with a comment

---

## Brand System

Three brand identities — all config lives in `lib/brands.ts`:

| ID        | Name           | Primary   | Accent    |
|-----------|----------------|-----------|-----------|
| lhcapital | LH Capital     | `#0475ae` | `#ed6835` |
| simrp     | The SIMRP      | `#689EB8` | `#00c4cc` |
| personal  | Personal Brand | `#0475ae` | `#37ca37` |

**NEVER hardcode these values in components.** Use Tailwind tokens or pass BrandConfig objects.

---

## Tech Stack

| Layer               | Technology                          |
|---------------------|-------------------------------------|
| Framework           | Next.js 14 (App Router)             |
| Language            | TypeScript (strict)                 |
| Styling             | Tailwind CSS + brand tokens         |
| Auth                | NextAuth v4 (Credentials only)      |
| Database            | Neon PostgreSQL + Prisma 6          |
| Storage             | Cloudflare R2 (S3-compatible SDK)   |
| AI — Text           | Anthropic Claude (haiku)            |
| AI — Image          | fal.ai (Flux, Ideogram, Recraft)    |
| AI — Image          | OpenAI (DALL-E 3)                   |
| AI — Video          | fal.ai Kling, Veo 3, MiniMax (Phase 2) |
| AI — Voice          | ElevenLabs (Phase 2)                |
| AI — Music          | Suno via fal.ai                     |
| AI — Video Likeness | HeyGen (Phase 2, planned)           |

---

## File Structure

```
app/(auth)/              — Login page (credentials only)
app/(studio)/            — All studio pages (session-protected)
app/api/v1/              — All versioned API routes
components/ui/           — Button, Spinner, Badge, Textarea
components/layout/       — Sidebar, Topbar
components/shared/       — BrandSelector, cross-module components
components/scheduler/    — Scheduler-specific components + types
hooks/                   — useGenerate, useAnalytics
lib/                     — auth, db, brands, utils, schemas, flags, retry, crypto, storage
lib/graphic-templates.ts — Graphic template definitions (hex in AI prompts allowed here)
lib/platform-colors.ts   — Third-party platform color classes (Facebook, Instagram, etc.)
lib/template-constants.ts — Shared CSS constants for graphic templates
lib/retry.ts             — withRetry() + isTransient() for external API calls
services/                — AI service layer (image, video, audio, music, social, publisher)
prisma/                  — Schema + migrations
```

---

## Feature Flags

Controlled via `FLAG_*` env vars — see `lib/flags.ts`.

| Flag                    | Default | Controls |
|-------------------------|---------|----------|
| `FLAG_VIDEO_GENERATION` | OFF     | `/videos` page + sidebar link |
| `FLAG_VOICEOVER`        | OFF     | `/audio` page + sidebar link |
| `FLAG_MOTION_VIDEO`     | OFF     | `/motion` page + sidebar link |
| `FLAG_LIKENESS_VIDEO`   | OFF     | (Phase 2, planned) |
| `FLAG_SOCIAL_YOUTUBE`   | OFF     | YouTube connect + posting |
| `FLAG_SOCIAL_TIKTOK`    | OFF     | TikTok connect + posting |
| `FLAG_ANALYTICS`        | ON      | Analytics sidebar link |
| `FLAG_MUSIC_GENERATION` | ON      | Music sidebar link |
| `FLAG_SOCIAL_SCHEDULER` | ON      | Scheduler sidebar link |

**Phase 2 pages enforce the flag at the page level** — `redirect('/dashboard')` if the flag is off. The sidebar link is a secondary guard only.

---

## Cron Job

- Route: `POST /api/v1/cron/publish`
- Protected by `Authorization: Bearer $CRON_SECRET`
- Configured in `railway.toml` — fires every minute
- `publishDuePosts()` in `services/publisher.ts`:
  - Atomically sets matching posts to `PROCESSING` before reading them (prevents double-publish on concurrent runs)
  - Processes up to 50 posts per tick (`take: 50`)
  - Failed posts are set to `FAILED` with an `errorMessage` visible in the Scheduler UI

`PostStatus` enum: `DRAFT → SCHEDULED → PROCESSING → PUBLISHED | FAILED`

---

## Security

- **Token encryption:** `lib/crypto.ts` — AES-256-GCM. `TOKEN_ENCRYPTION_KEY` must be set in production (throws on startup if missing). Decrypt failures are logged before fallback.
- **File uploads:** Magic byte validation + browser MIME check. Max 20 MB.
- **URL fetching:** `uploadFromUrl` validates source domain against an allowlist (fal.ai, OpenAI, Google CDN). Non-HTTPS and unknown hosts are rejected.
- **Security headers:** Set in `next.config.mjs` — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, `X-XSS-Protection`.
- **Rate limiting:** In-memory sliding window (`lib/ratelimit.ts`). Auth: 5/min, Generate: 10/min, General API: 60/min. **Single-instance only** — swap to Upstash Redis before horizontal scaling.

---

## Rate Limiting
- Auth endpoints: 5 req/min per IP — brute-force guard
- AI generation endpoints: 10 req/min per user — cost guard
- General API: 60 req/min per tenant
- Implementation: `lib/ratelimit.ts` (in-memory sliding window) + `middleware.ts`
- **Important:** In-memory store breaks at 2+ Railway instances. Upgrade to Upstash Redis before scaling out.

---

## Input Validation
- ALL POST/PATCH/PUT routes validate body with Zod before any DB write
- Schemas live in `lib/schemas/` — one file per domain
- Reuse schemas between frontend (`useGenerate`) and backend API routes
- Never trust `req.body` directly — always `schema.safeParse(body)`

---

## Observability
- Error visibility: Railway log dashboard + `console.error` in every API catch block
- AI cost tracking: `metadata.cost` stored on every Asset (see `lib/cost.ts`)
- Internal tool — Sentry not needed; Railway logs are sufficient

---

## Data Governance
- Passwords: bcrypt hashed (salt rounds 12)
- API keys: Anthropic, fal.ai, R2, ElevenLabs — env vars only, never in source
- Social tokens: AES-256-GCM encrypted at rest (`lib/crypto.ts`)
- Tenant isolation: enforced at query layer (`where: { tenantId }` required on all data queries)
- PII: user email + name stored in DB — encrypted at rest via Neon's storage encryption

---

## Compliance
- HTTPS enforced at hosting layer (Railway)
- No SMS/outbound calls — TCPA not applicable
- HIPAA: not applicable — no health data handled

---

## CI/CD
- GitHub Actions: `.github/workflows/ci.yml`
- On every PR: type-check → lint → build
- On merge to `main`: validate then `railway up --detach`
- Required secrets: `DATABASE_URL`, `DIRECT_URL`, `RAILWAY_TOKEN`
- Run `prisma migrate deploy` (not `dev`) in production deploys

---

## Module Status

| Module           | Status                  |
|------------------|-------------------------|
| Dashboard        | Built                   |
| Create Images    | Built                   |
| Graphics Studio  | Built                   |
| Content Writer   | Built                   |
| Brand Vault      | Built                   |
| Content Library  | Built (paginated)       |
| Music Studio     | Built                   |
| Motion Video     | Built (Phase 2 gate)    |
| Analytics        | Built                   |
| Social Scheduler | Built                   |
| Video Studio     | Built (Phase 2 gate)    |
| VoiceOver Studio | Built (Phase 2 gate)    |
| Likeness Video   | Planned (Phase 2)       |

---

## Key Decisions & History

- **No demo mode.** Removed. Login is `info@lhccapital.org` + password (stored in Railway env vars).
- **Storage is Cloudflare R2**, not AWS S3 — the SDK is S3-compatible but the endpoint and region differ.
- **`PROCESSING` is a valid `PostStatus`** — set atomically by `publishDuePosts` to prevent double-publish. Do not remove.
- **Video duration is `'5' | '10'` only** — Kling API limits enforced in schema and UI. Do not add longer durations without verifying API support.
- **`WriterClient.tsx` does not use `useGenerate`** — intentional; the writer generates in parallel across platforms, which the single-call hook does not support.
- **Rate limiter is single-instance** — acceptable for now. Documented in `lib/ratelimit.ts`. Upgrade path: swap the `Map` store for Upstash Redis.
- **fal.ai SDK `as any` casts in `services/`** — acceptable; the SDK's TypeScript types for video/music inputs are incomplete. All other `as any` is forbidden.
