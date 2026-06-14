import nextPlugin from '@next/eslint-plugin-next'

// Next 16 removed `next lint`. FlatCompat + eslint-config-next crashes under
// ESLint 9 (circular ref in the bundled react config), so we use the Next
// plugin's native flat config directly — it enforces the Next-specific rules
// (no-img-element, no-html-link-for-pages, etc.) that matter most here.
const config = [
  { ignores: ['.next/**', 'node_modules/**', 'prisma/migrations/**', 'next-env.d.ts'] },
  nextPlugin.configs['core-web-vitals'],
]

export default config
