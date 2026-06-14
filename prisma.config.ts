import { defineConfig } from 'prisma/config'

// Prisma 7 moves connection URLs out of schema.prisma. The runtime PrismaClient
// connects via the Neon driver adapter (see lib/db.ts); only the CLI
// (migrate/introspect) needs a URL here — use the direct (non-pooled) connection.
//
// Use process.env directly (not the `env()` helper) so the config loads without
// throwing when DIRECT_URL is unset — `prisma generate` (build) doesn't need a
// URL; only migrate/introspect do, and those always run with env set
// (npm scripts wrap with `dotenv -e .env.local`; CI/Railway set it directly).
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: process.env.DIRECT_URL,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
})
