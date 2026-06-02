import { createAuthClient } from 'better-auth/react'
import { adminClient } from 'better-auth/client/plugins'

const baseURL =
  typeof window === 'undefined'
    ? (import.meta.env.BETTERAUTHURL ?? 'http://localhost:3000')
    : window.location.origin

export const authClient = createAuthClient({
  baseURL: `${baseURL}/api/auth`,
  plugins: [adminClient()],
})

export const { useSession, signIn, signOut } = authClient
