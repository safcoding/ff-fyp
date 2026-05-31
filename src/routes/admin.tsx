import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { signOut } from '@/lib/auth-client'
import { Button } from '@/components/ui/button'
import { getSessionFn } from '@/lib/auth-middleware'

export const Route = createFileRoute('/admin')({
  beforeLoad: async() => {
    const session = await getSessionFn();
    if(!session?.user){
      throw redirect({to: "/login"});
    }
  },
  component: AdminLayout,
})

function AdminLayout() {

  return (  
  <div>
    <Button onClick={() => signOut()}>Sign out</Button>
    <Outlet />
  </div>)
}