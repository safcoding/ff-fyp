import { createAuthClient } from 'better-auth/react'

const baseURL =
  typeof window === 'undefined'
    ? (import.meta.env.BETTERAUTHURL ?? 'http://localhost:3000')
    : window.location.origin

export const {useSession, signIn, signOut, signUp} = createAuthClient({
  baseURL: `${baseURL}/api/auth`,
})