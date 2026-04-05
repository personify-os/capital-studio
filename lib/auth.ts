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
            await new Promise((r) => setTimeout(r, 2500))
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

