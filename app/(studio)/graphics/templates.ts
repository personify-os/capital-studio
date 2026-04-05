// Re-export from lib/ — source of truth moved to lib/graphic-templates.ts
// so AI prompt strings containing hex color descriptions are not in app/ files.
export type { GraphicTemplate } from '@/lib/graphic-templates'
export { GRAPHIC_TEMPLATES, getTemplate } from '@/lib/graphic-templates'
