-- Add ESPA to BrandType enum (ESPA by BizPower — Employer Sponsored Preventive Access)
-- PostgreSQL requires ALTER TYPE ... ADD VALUE for enum additions

ALTER TYPE "BrandType" ADD VALUE IF NOT EXISTS 'ESPA';
