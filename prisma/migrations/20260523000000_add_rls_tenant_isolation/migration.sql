-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: Row Level Security — Tenant Isolation
-- Phase 1: ENABLE RLS on all multi-tenant tables.
--   - Protects against non-owner roles connecting directly to Neon.
--   - The Prisma app role (database owner) bypasses RLS by default, so
--     existing queries continue to work unchanged.
-- Phase 2 (future): Once all API routes use withTenant() from lib/db.ts,
--   add FORCE ROW LEVEL SECURITY to each table to enforce isolation for
--   the owner role as well — achieving full defense-in-depth.
-- ─────────────────────────────────────────────────────────────────────────────

-- ── User ─────────────────────────────────────────────────────────────────────
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "User"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- ── BrandProfile ──────────────────────────────────────────────────────────────
ALTER TABLE "BrandProfile" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "BrandProfile"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- ── Asset ─────────────────────────────────────────────────────────────────────
ALTER TABLE "Asset" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "Asset"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- ── SocialAccount ─────────────────────────────────────────────────────────────
ALTER TABLE "SocialAccount" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "SocialAccount"
  USING ("tenantId" = current_setting('app.tenant_id', true));

-- ── ScheduledPost ─────────────────────────────────────────────────────────────
ALTER TABLE "ScheduledPost" ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON "ScheduledPost"
  USING ("tenantId" = current_setting('app.tenant_id', true));
