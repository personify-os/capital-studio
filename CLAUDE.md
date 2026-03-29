# Capital Studio — Claude Code Standing Instructions

**Product:** Capital Studio
**Port:** 3004
**Segment:** Internal — LH Capital team use only

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
- Exception: `lib/brands.ts` is the source of truth for brand color values used in AI prompts

### Multi-Tenancy
- Every DB query involving user/tenant data MUST include `where: { tenantId: session.user.tenantId }`
- Cross-tenant data leakage is a critical security violation

### API-First
- All features have a `/api/v1/` endpoint before the UI consumes it
- UI components call the API — never hit the DB or call AI APIs directly from a component
- Service layer (`services/`) is the only place that touches external AI APIs

### Shared Hooks
- Use `useGenerate()` from `hooks/useGenerate.ts` for all generation calls
- Do NOT duplicate fetch/loading/error state in individual modules

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

---

## Brand System

Three brand identities — all config lives in `lib/brands.ts`:

| ID        | Name              | Primary   | Accent    |
|-----------|-------------------|-----------|-----------|
| lhcapital | LH Capital        | `#0475ae` | `#ed6835` |
| simrp     | The SIMRP         | `#689EB8` | `#00c4cc` |
| personal  | Personal Brand    | `#0475ae` | `#37ca37` |

**NEVER hardcode these values in components.** Use Tailwind tokens or pass BrandConfig objects.

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Framework  | Next.js 14 (App Router)           |
| Language   | TypeScript (strict)               |
| Styling    | Tailwind CSS + brand tokens       |
| Auth       | NextAuth v4 (Credentials + demo)  |
| Database   | Neon PostgreSQL + Prisma 6        |
| Storage    | AWS S3                            |
| AI — Text  | Anthropic Claude                  |
| AI — Image | fal.ai (Flux, Ideogram, Recraft)  |
| AI — Image | OpenAI (DALL-E 3)                 |
| AI — Video | Kling, Runway, Sora (Phase 2)     |
| AI — Voice | ElevenLabs (Phase 2)              |
| AI — Video Likeness | HeyGen (Phase 2)         |

---

## File Structure

```
app/(auth)/           — Login page
app/(studio)/         — All studio pages (session-protected)
app/api/v1/           — All versioned API routes
components/ui/        — Button, Spinner, Badge, Textarea
components/layout/    — Sidebar, Topbar
components/shared/    — BrandSelector, cross-module components
hooks/                — useGenerate (shared across all modules)
lib/                  — auth, db, brands, utils, schemas
services/             — AI service layer (image, graphics, caption)
prisma/               — Schema + migrations
```

---

## Rate Limiting (Pillar 11)
- Auth endpoints: 5 req/min per IP — brute-force guard
- AI generation endpoints: 10 req/min per user — cost guard
- General API: 60 req/min per tenant
- Implementation: `lib/ratelimit.ts` (in-memory sliding window) + `middleware.ts`
- Upgrade path: swap store for Upstash Redis when multi-instance deployment required

## Input Validation (Pillar 12)
- ALL POST/PATCH/PUT routes validate body with Zod before any DB write
- Schemas live in `lib/schemas/` — one file per domain
- Reuse schemas between frontend (`useGenerate`) and backend API routes
- Never trust `req.body` directly — always `schema.safeParse(body)`

## Observability (Pillar 9)
- Error visibility: Railway log dashboard + `console.error` in every API catch block
- AI cost tracking: `metadata.cost` stored on every Asset (see `lib/cost.ts`)
- Internal tool — Sentry not needed; Railway logs are sufficient

## Data Governance (Pillar 8)
- Passwords: bcrypt hashed (salt rounds 12)
- API keys: Anthropic, fal.ai, AWS, ElevenLabs — env vars only, never in source
- Tenant isolation: enforced at query layer (`where: { tenantId }` required on all data queries)
- PII: user email + name stored in DB — encrypted at rest via Neon's storage encryption

## Compliance (Pillar 13)
- HTTPS enforced at hosting layer (Railway / Vercel)
- No SMS/outbound calls — TCPA not applicable
- HIPAA: not applicable — no health data handled

## Feature Flags (Pillar 5)
- Controlled via `FLAG_*` env vars — see `lib/flags.ts`
- Phase 2 modules (video, voiceover, motion, likeness) default OFF
- Social platforms default ON except YouTube/TikTok (require OAuth app review)
- Check `flags.videoGeneration` etc. before rendering phase-2 UI

## CI/CD (Pillar 4)
- GitHub Actions: `.github/workflows/ci.yml`
- On every PR: type-check → lint → build
- On merge to `main`: validate then `railway up --detach`
- Required secrets: `DATABASE_URL`, `DIRECT_URL`, `RAILWAY_TOKEN`

## Module Status

| Module           | Status      |
|------------------|-------------|
| Dashboard        | Built       |
| Create Images    | Built       |
| Graphics Studio  | Built       |
| Writer           | Built       |
| Brand Vault      | Built       |
| Content Library  | Built       |
| Music            | Built       |
| Motion Video     | Built       |
| Analytics        | Built       |
| Social Scheduler | Built       |
| Videos           | Built (Phase 2 gate) |
| VoiceOver        | Built (Phase 2 gate) |
| Likeness Video   | Planned (Phase 2) |
