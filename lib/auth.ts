import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/db'

// Extend next-auth session types
declare module 'next-auth' {
  interface Session {
    user: { id: string; tenantId: string; role: string; email: string; name?: string | null }
  }
  interface User {
    id: string; tenantId: string; role: string
  }
}
declare module 'next-auth/jwt' {
  interface JWT {
    id: string; tenantId: string; role: string
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages:   { signIn: '/login' },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email.toLowerCase().trim()

        // ── Standard credentials ───────────────────────────────────────────
        // Retry once — Neon cold-starts can cause the first query to fail
        let user
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            user = await prisma.user.findUnique({ where: { email } })
            break
          } catch (e) {
            if (attempt === 2) { console.error('[auth] DB error after retry:', e); return null }
            await new Promise((r) => setTimeout(r, 1500))
          }
        }
        if (!user || !user.password) return null

        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email, name: user.name ?? undefined, tenantId: user.tenantId, role: user.role }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id       = user.id
        token.tenantId = user.tenantId
        token.role     = user.role
      }
      return token
    },
    async session({ session, token }) {
      session.user.id       = token.id
      session.user.tenantId = token.tenantId
      session.user.role     = token.role
      return session
    },
  },
}

// ─── Demo user bootstrap ─────────────────────────────────────────────────────
async function getOrCreateDemoUser() {
  const email = 'demo@lhcapital.com'

  let user = await prisma.user.findUnique({ where: { email } })
  if (user) return { id: user.id, email: user.email, name: user.name ?? undefined, tenantId: user.tenantId, role: user.role }

  // Create demo tenant + user in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: {
        name: 'LH Capital Demo',
        slug: 'lhcapital-demo',
        brands: {
          create: [
            {
              type:      'LHC',
              name:      'LH Capital',
              isDefault: true,
              config: {
                colors:   { primary: '#0475ae', secondary: '#041740', accent: '#ed6835', dark: '#070e1a', light: '#f9f9f9' },
                fonts:    { heading: 'Inter', body: 'Inter' },
                tagline:  'Building Legacies. Protecting Futures.',
                tone:     'Professional, trustworthy, consultative.',
                audience: 'Business owners, HR directors, CFOs',
                products: ['SIMRP', 'Supplemental Benefits', 'Employee Wellness'],
              },
            },
            {
              type:      'SIMRP',
              name:      'The SIMRP',
              isDefault: false,
              config: {
                colors:   { primary: '#689EB8', secondary: '#041740', accent: '#00c4cc', dark: '#041740', light: '#f0f7ff' },
                fonts:    { heading: 'Inter', body: 'Inter' },
                tagline:  'The Infinite Savings Plan',
                tone:     'Educational, empowering, clarity-focused.',
                audience: 'Employers and CFOs seeking tax-advantaged benefits',
                products: ['SIMRP', '$550/employee/yr savings', '$150/employee/month allotment', 'Telehealth'],
              },
            },
          ],
        },
      },
    })

    const newUser = await tx.user.create({
      data: {
        tenantId: tenant.id,
        email,
        name:     'Demo User',
        role:     'OWNER',
        password: null,
      },
    })

    return newUser
  })

  return { id: result.id, email: result.email, name: result.name ?? undefined, tenantId: result.tenantId, role: result.role }
}
