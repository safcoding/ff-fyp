import { redirect } from '@tanstack/react-router'

import { getSessionFn } from '@/lib/auth-serverFn'
import { isAdminUser } from '@/lib/authz'

export async function requireAdminRoute() {
  const session = await getSessionFn()

  if (!session?.user) {
    throw redirect({ to: '/login' })
  }

  if (!isAdminUser(session.user)) {
    throw redirect({ to: '/admin' })
  }

  return { session }
}
