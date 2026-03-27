import path from 'node:path'

// Prisma CLI config — used by migrate, studio, etc. (not the runtime client)
export default {
  schema: path.join('prisma', 'schema.prisma'),
}
