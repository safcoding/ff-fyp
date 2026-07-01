import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useSession, signIn } from '@/lib/auth-client'
import { Lock, Mail } from 'lucide-react'
import { Image } from '@unpic/react'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
  const logo = `/ff-logo.png`
  const navigate = Route.useNavigate()
  const { data: session, isPending } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isPending && session?.user) {
      void navigate({ to: '/admin' })
    }
  }, [isPending, session, navigate])

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#fbf0d8] flex items-center justify-center">
        <p className="text-sm text-stone-500">Checking session...</p>
      </div>
    )
  }

  if (session?.user) return null

  return (
    <div className="min-h-screen bg-[#fbf0d8] flex flex-col items-center justify-center px-4">
      {/* Card */}
      <div className="w-full max-w-sm bg-white border border-[#445412]/10 rounded-2xl shadow-lg overflow-hidden">
        {/* Green header strip */}
        <div className="bg-[#445412] px-8 py-7 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Image
              src={logo}
              alt="Farm Fresh @ UPM Logo"
              width={170}
              height={120}
              layout="constrained"
              loading="eager"
              className="w-[20vh]"
            />
          </div>
          <p className="text-[#fbf0d8]/60 text-xs uppercase tracking-widest"> Farm Fresh @ UPM Admin Portal</p>
        </div>

        <div className="px-8 py-7">
          <h2 className="font-fraunces font-black text-2xl text-[#445412] mb-1">Sign in</h2>
          <p className="text-xs text-stone-400 mb-6">Use the credentials provided by your administrator.</p>

          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault()
              setError(null)
              if (!email.trim() || !password) {
                setError('Email and password are required.')
                return
              }
              try {
                setIsSubmitting(true)
                const result = await signIn.email({ email: email.trim(), password })
                if (result.error) {
                  setError(result.error.message ?? 'Unable to sign in.')
                  return
                }
                await navigate({ to: '/admin' })
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to sign in.')
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            <div className="space-y-1">
              <label htmlFor="login-email" className="block text-xs font-bold text-stone-500 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                <input
                  id="login-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 h-10 border border-stone-200 rounded-lg text-sm outline-none focus:border-[#445412] transition-colors"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="login-password" className="block text-xs font-bold text-stone-500 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                <input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 h-10 border border-stone-200 rounded-lg text-sm outline-none focus:border-[#445412] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error ? (
              <p 
              data-testid="login-error"
              className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-[#445412] hover:bg-[#3a4810] text-[#fbf0d8] font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>

      <p className="mt-6 text-xs text-stone-400">
        Farm Fresh @ UPM — Admin Portal
      </p>
    </div>
  )
}
