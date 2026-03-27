'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ShieldCheck, TrendingUp, Users, BarChart3 } from 'lucide-react'

const FEATURES = [
  { icon: TrendingUp,   text: 'AI-generated marketing content for LHC & SIMRP' },
  { icon: Users,        text: 'Multi-brand — LH Capital, The SIMRP, Personal Brand' },
  { icon: ShieldCheck,  text: 'Social scheduling across 9 platforms' },
  { icon: BarChart3,    text: 'Brand Vault with knowledge base & asset library' },
]

export default function LoginForm() {
  const router   = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const res = await signIn('credentials', {
      email:    email.trim().toLowerCase(),
      password,
      redirect: false,
    })

    if (res?.ok) {
      router.push('/dashboard')
    } else {
      setError('Invalid email or password.')
      setLoading(false)
    }
  }

  async function handleDemo() {
    setLoading(true)
    const res = await signIn('credentials', {
      email:    'demo@lhcapital.com',
      password: 'demo',
      redirect: false,
    })
    if (res?.ok) router.push('/dashboard')
    else setLoading(false)
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[52%] flex-col justify-between p-12 bg-[#041740]">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="w-10 h-10 rounded-full bg-[#0475ae] flex items-center justify-center">
              <span className="text-white font-bold text-sm">LHC</span>
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-none">Capital Studio</p>
              <p className="text-[#689EB8] text-xs mt-0.5">by LH Capital</p>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-white text-4xl font-bold leading-tight mb-4">
            Create. Generate.<br />Publish.
          </h1>
          <p className="text-[#689EB8] text-base leading-relaxed mb-12 max-w-sm">
            AI-powered content creation for LH Capital and The SIMRP — images, graphics, video, and social scheduling in one place.
          </p>

          {/* Feature list */}
          <ul className="space-y-4">
            {FEATURES.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <div className="mt-0.5 w-6 h-6 rounded-md bg-[#0475ae]/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-[#0475ae]" />
                </div>
                <span className="text-[#a8c4d8] text-sm leading-snug">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-[#3d5a78] text-xs">
          © {new Date().getFullYear()} LH Capital. Internal use only.
        </p>
      </div>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-full bg-[#0475ae] flex items-center justify-center">
              <span className="text-white font-bold text-xs">LHC</span>
            </div>
            <span className="font-semibold text-[#041740]">Capital Studio</span>
          </div>

          <h2 className="text-2xl font-bold text-[#041740] mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@lhcapital.com"
                required
                className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0475ae] focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0475ae] focus:border-transparent transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#0475ae] hover:bg-[#035d8a] disabled:opacity-60 text-white font-semibold text-sm rounded-lg transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="px-3 bg-white text-xs text-gray-400">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemo}
            disabled={loading}
            className="w-full py-2.5 border-2 border-[#041740] text-[#041740] hover:bg-[#041740] hover:text-white disabled:opacity-60 font-semibold text-sm rounded-lg transition-colors"
          >
            Demo View
          </button>

          <p className="mt-6 text-center text-xs text-gray-400">
            No account? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  )
}
