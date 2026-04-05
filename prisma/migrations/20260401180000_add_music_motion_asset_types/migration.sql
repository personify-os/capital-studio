-- Add MUSIC and MOTION to AssetType enum
-- PostgreSQL requires ALTER TYPE ... ADD VALUE for enum additions

ALTER TYPE "AssetType" ADD VALUE IF NOT EXISTS 'MUSIC';
ALTER TYPE "AssetType" ADD VALUE IF NOT EXISTS 'MOTION';
