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
| `FLAG_VIDEO_GENERATION` | ON      | `/videos` page + sidebar link |
| `FLAG_VOICEOVER`        | ON      | `/audio` page + sidebar link |
| `FLAG_MOTION_VIDEO`     | ON      | `/motion` page + sidebar link |
| `FLAG_LIKENESS_VIDEO`   | ON      | `/likeness` page + sidebar link |
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
- Implementation: `lib/ratelimit.ts` (Upstash Redis sliding window, falls back to in-memory in dev) + `middleware.ts`
- Keys prefixed `capital-studio:` — safe to share an Upstash database with other Personify apps
- Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to Railway env vars

---

## Input Validation
- ALL POST/PATCH/PUT routes validate body with Zod before any DB write
- Schemas live in `lib/schemas/` — one file per domain
- Reuse schemas between frontend (`useGenerate`) and backend API routes
- Never trust `req.body` directly — always `schema.safeParse(body)`

---

## Observability
- Error tracking: Sentry (`@sentry/nextjs`) — `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`. Add `SENTRY_DSN` to Railway env vars.
- Product analytics: PostHog (`posthog-js`) — `components/PostHogProvider.tsx` wraps the app. Add `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` to Railway env vars. Session recordings have full PII masking enabled.
- AI cost tracking: `metadata.cost` stored on every Asset (see `lib/cost.ts`)
- Uptime: Better Stack on `GET /api/v1/health`

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
- **GDPR:** not applicable — no EU resident data processed (US-only internal tool)
- **CCPA:** evaluate if California business owners' data is processed via Content Writer or Social Scheduler; if so, data subject rights (access, delete, export) apply
- **SSO deferred** — credentials-only auth is a conscious decision for this internal tool; revisit if the user base grows beyond the LH Capital team
- **Data retention** — assets and user records retained indefinitely; no automated cleanup. Review if R2 storage exceeds budget thresholds.

---

## Postgres Row Level Security (RLS)

**Phase 1 — complete** (`prisma/migrations/20260523000000_add_rls_tenant_isolation`)
RLS is enabled on all 5 multi-tenant tables: `Asset`, `ScheduledPost`, `SocialAccount`, `BrandProfile`, `User`. Each has a `tenant_isolation` policy using `current_setting('app.tenant_id', true)`. The Prisma app role (database owner) bypasses RLS by default, so existing queries are unaffected. Non-owner direct DB connections are now blocked.

**Phase 2 — complete** (full enforcement via dedicated non-owner role; PRs #41–#44). **Do NOT use `FORCE ROW LEVEL SECURITY`** — the originally-documented "FORCE RLS on the owner role" plan is unsafe: it breaks login (reads `User` by email *before* any tenant is known in `lib/auth.ts` → 0 rows) and the cron publisher (`services/publisher.ts` queries across tenants by design → 0 rows). Enforcement is instead done with a non-owner DB role, to which RLS already applies from Phase 1 (no FORCE needed).

**What's live:**
- **Role `app_user`** (`LOGIN`, `NOBYPASSRLS`) exists on prod Neon (project `sweet-frost-92223114`) with `GRANT USAGE`+CRUD on `public` tables/sequences + `ALTER DEFAULT PRIVILEGES` so future tables/sequences are auto-granted. It is **not** a member of `neondb_owner`.
- **`lib/db.ts`** exposes two clients: `prisma` (owner, `DATABASE_URL`) for **auth + cron + seed + migrate**, and `prismaApp` (`APP_DATABASE_URL`, falls back to `DATABASE_URL` when unset). `withTenant(tenantId, (tx) => …)` runs on `prismaApp` and sets `app.tenant_id` transaction-locally.
- **All tenant-scoped query sites** (API routes, 11 `(studio)` server pages, `lib/brand-context.ts`, `lib/default-brand.ts`) run through `withTenant`. Only auth, the cron publisher, seed/migrate, and the `health/db` liveness check use the owner `prisma` client (plus type-only `typeof prisma` refs).
- **Cutover:** `APP_DATABASE_URL` (the `app_user` connection string — same host/db/params as `DATABASE_URL`, only credentials differ) is set in `.env.local` and **must be set in Railway** for enforcement in prod. **To revert instantly, delete `APP_DATABASE_URL`** → `prismaApp` falls back to the owner connection, no enforcement. It is **all-or-nothing**: a query site that bypasses `withTenant` returns 0 rows once the flip is on.

Validated end-to-end on a throwaway Neon branch and against prod through the real `prismaApp`/`withTenant` path: connected as `app_user`, in-tenant counts correct, no-tenant/wrong-tenant → 0, in-tenant CRUD allowed, cross-tenant INSERT blocked by the policy's WITH CHECK, owner client still bypasses (auth/cron safe).

**Rule:** All API routes — new and existing — MUST use `withTenant()` for tenant-scoped queries. The owner `prisma` client is reserved for the four exceptions above.

---

## Infrastructure
- **RTO target:** < 1 hour for production outages
- **RPO target:** < 24 hours (daily Neon PITR backup)
- Neon PITR backups: verify enabled in the Neon console (project → Branches → main → Backup)
- Uptime monitoring: Better Stack active on `GET /api/v1/health` ✓
- Cloudflare WAF: **accepted gap** — internal tool, low public exposure. To add: connect `lhccapital.org` to Cloudflare (nameserver change at registrar), then enable orange-cloud proxy + WAF Managed Ruleset + Bot Fight Mode on `studio.lhccapital.org`. Revisit if app becomes externally facing.

### Runbook — Common Failure Modes

**502 / Application failed to respond**
1. Check Railway dashboard → capital-studio service → Deployments → view logs
2. If health check failing: Neon DB may be suspended (inactivity) — trigger a redeploy to wake it
3. If process crash: check Railway logs for `Error:` lines on startup (missing env var most likely)
4. Rollback: Railway dashboard → Deployments → click any prior successful deploy → "Redeploy"

**Missing env var crash**
- `TOKEN_ENCRYPTION_KEY` — throws in production if absent; generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `DATABASE_URL` — Prisma crashes on first DB query; verify in Railway Variables tab

**API key rotation**
- Anthropic, fal.ai, R2, ElevenLabs, HeyGen — update in Railway Variables tab; redeploy
- Document rotation date in `.env.example` comment

---

## CI/CD
- GitHub Actions: `.github/workflows/ci.yml`
- On every PR: dependency audit → secrets scan → type-check → lint → build
- On merge to `main`: validate then `railway up --detach`
- Required secrets: `DATABASE_URL`, `DIRECT_URL`, `RAILWAY_TOKEN`
- Run `prisma migrate deploy` (not `dev`) in production deploys
- Dependabot: enable in GitHub → Settings → Security → Dependabot alerts + security updates

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
| Likeness Video   | Built (Phase 2 gate)    |

---

## Key Decisions & History

- **No demo mode.** Removed. Login is `info@lhccapital.org` + password (stored in Railway env vars).
- **Storage is Cloudflare R2**, not AWS S3 — the SDK is S3-compatible but the endpoint and region differ.
- **`PROCESSING` is a valid `PostStatus`** — set atomically by `publishDuePosts` to prevent double-publish. Do not remove.
- **Video duration is `'5' | '10'` only** — Kling API limits enforced in schema and UI. Do not add longer durations without verifying API support.
- **`WriterClient.tsx` does not use `useGenerate`** — intentional; the writer generates in parallel across platforms, which the single-call hook does not support.
- **Rate limiter is single-instance** — acceptable for now. Documented in `lib/ratelimit.ts`. Upgrade path: swap the `Map` store for Upstash Redis.
- **fal.ai SDK `as any` casts in `services/`** — acceptable; the SDK's TypeScript types for video/music inputs are incomplete. All other `as any` is forbidden.
