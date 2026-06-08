type SessionUser = {
  role?: string | null
}

type SessionLike = {
  user?: SessionUser | null
} | null

export function isAdminUser(user: SessionUser | null | undefined) {
  return user?.role === 'admin'
}

export function assertAdminSession(session: SessionLike) {
  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  if (!isAdminUser(session.user)) {
    throw new Error('Forbidden: admin role required')
  }
}
