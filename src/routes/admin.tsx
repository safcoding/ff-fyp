import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router'
import { useEffect } from 'react'
import { signOut, useSession } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
signOut
export const Route = createFileRoute('/admin')({
  component: AdminLayout,
})

function AdminLayout() {
  const navigate = useNavigate()
  const { data: session, isPending } = useSession()

  useEffect(() => {
    if ( !session?.user) {
      void navigate({ to: '/login' })
    }
  }, [ isPending, session, navigate])
  if (isPending) return <div>Checking session...</div>
  if (!session?.user) {
    return null
  }

  return (  
  <div>
    <p>Client signed in as {session?.user.name}</p>
    {session && <Button onClick={() => signOut()}>Sign out</Button>}
    <Outlet />
  </div>)
}