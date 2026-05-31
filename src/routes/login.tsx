import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useEffect } from 'react'
import { useSession, signIn } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SignUpForm } from '@/features/users/client/SignUpForm'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})

function LoginPage() {
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
    return <div className="mx-auto max-w-md p-6">Checking session...</div>
  }

  if (session?.user) {
    return null
  }

  return (
    <div className="mx-auto max-w-md p-6">
      <SignUpForm/>
      <Card>
        <CardHeader>
          <CardTitle>Admin login</CardTitle>
          <CardDescription>Sign in with the email and password provided by an admin.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={async (event) => {
              event.preventDefault()
              setError(null)

              if (!email.trim() || !password) {
                setError('Email and password are required.')
                return
              }

              try {
                setIsSubmitting(true)
                const result = await signIn.email({
                  email: email.trim(),
                  password,
                })

                if (result.error) {
                  setError(result.error.message ?? 'Unable to sign in.')
                  return
                }

                await navigate({ to: '/' })
              } catch (err) {
                setError(err instanceof Error ? err.message : 'Unable to sign in.')
              } finally {
                setIsSubmitting(false)
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="login-email">Email</Label>
              <Input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="login-password">Password</Label>
              <Input
                id="login-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
