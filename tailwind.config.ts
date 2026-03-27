import type { Config } from 'tailwindcss'

// ─── LH Capital Brand Palette ───────────────────────────────────────────────
// Update hex values here only — all components use Tailwind tokens.
// Source: Canva brand kit (confirmed 2026-03-27) + lhccapital.org
const brand = {
  azure:   '#0475ae', // Vivid Azure — logo primary, buttons, CTAs
  navy:    '#041740', // Dark Blue — logo dark shade, sidebar
  navyWeb: '#0b2147', // Deep Navy — website dark sections
  darkest: '#070e1a', // Near-black — darkest backgrounds
  orange:  '#ed6835', // Orange Accent — website CTA, highlights
  teal:    '#00c4cc', // Teal — icon accent (from brand doc)
  light:   '#689EB8', // Light Blue — secondary, borders (from brand doc)
  white:   '#FFFFFF',
  offwhite:'#f9f9f9', // App background (from website)
  charcoal:'#1a1a2e', // Dark text
}

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './hooks/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          azure:   brand.azure,
          navy:    brand.navy,
          'navy-web': brand.navyWeb,
          darkest: brand.darkest,
          orange:  brand.orange,
          teal:    brand.teal,
          light:   brand.light,
          // aliases used in components
          blue:    brand.azure,
        },
        'app-bg': brand.offwhite,
        charcoal: brand.charcoal,
      },
      boxShadow: {
        card:       '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover':'0 4px 12px rgba(0,0,0,0.12), 0 2px 4px rgba(0,0,0,0.08)',
      },
      borderRadius: {
        card:  '10px',
        input: '6px',
        badge: '4px',
      },
    },
  },
  plugins: [],
}

export default config
