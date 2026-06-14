-- Add sortOrder to BrandProfile for user-defined brand ordering in the Brand Vault
ALTER TABLE "BrandProfile" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;
