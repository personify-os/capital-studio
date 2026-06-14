-- Reconcile drift: the unique index declared in the schema (and the init
-- migration) is missing in some environments, which allowed duplicate brand
-- profiles of the same type per tenant. Recreate it idempotently.
CREATE UNIQUE INDEX IF NOT EXISTS "BrandProfile_tenantId_type_key"
  ON "BrandProfile" ("tenantId", "type");
