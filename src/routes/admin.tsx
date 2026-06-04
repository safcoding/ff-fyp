import { createFileRoute, Link, Outlet, redirect, useLocation } from '@tanstack/react-router'
import { signOut } from '@/lib/auth-client'
import { getSessionFn } from '@/lib/auth-serverFn'
import {
  LayoutDashboard,
  CalendarDays,
  Package,
  Ticket,
  UtensilsCrossed,
  Percent,
  Activity,
  CalendarOff,
  Settings,
  Users,
  LogOut,
  ChevronRight,
  Leaf,
} from 'lucide-react'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const session = await getSessionFn()
    if (!session?.user) {
      throw redirect({ to: '/login' })
    }
  },
  component: AdminLayout,
})

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/bookings', label: 'Bookings', icon: CalendarDays },
  { href: '/admin/packages', label: 'Packages', icon: Package },
  { href: '/admin/slots', label: 'Slots', icon: Ticket },
  { href: '/admin/addons', label: 'Add-ons', icon: Ticket },
  { href: '/admin/foods', label: 'Foods', icon: UtensilsCrossed },
  { href: '/admin/discounts', label: 'Discounts', icon: Percent },
  { href: '/admin/activities', label: 'Activities', icon: Activity },
  { href: '/admin/blocks', label: 'Blocks', icon: CalendarOff },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/users', label: 'Users', icon: Users },
]

function AdminLayout() {
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-[#fbf0d8]">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-[#445412] text-[#fbf0d8] flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-[#fbf0d8]/10">
          <Leaf className="w-5 h-5 text-[#a8c15a]" />
          <span className="font-fraunces font-black text-lg tracking-tight">Farm Fresh</span>
        </div>
        <p className="px-6 pt-1 pb-4 text-[10px] uppercase tracking-widest text-[#fbf0d8]/50 border-b border-[#fbf0d8]/10">
          Admin Portal
        </p>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact
              ? location.pathname === href
              : location.pathname.startsWith(href) && href !== '/admin'
                ? true
                : location.pathname === href
            return (
              <Link
                key={href}
                to={href}
                className={`flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#fbf0d8]/15 text-white'
                    : 'text-[#fbf0d8]/70 hover:bg-[#fbf0d8]/10 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
                {active && <ChevronRight className="w-3 h-3 ml-auto opacity-60" />}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-[#fbf0d8]/10">
          <button
            onClick={() =>
              signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/' } } })
            }
            className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#fbf0d8]/70 hover:text-white hover:bg-[#fbf0d8]/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between bg-[#445412] text-[#fbf0d8] px-4 py-3">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#a8c15a]" />
            <span className="font-fraunces font-black text-base">Farm Fresh Admin</span>
          </div>
          <button
            onClick={() =>
              signOut({ fetchOptions: { onSuccess: () => { window.location.href = '/' } } })
            }
            className="flex items-center gap-1 text-xs text-[#fbf0d8]/70 hover:text-white"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </header>

        {/* Mobile nav strip */}
        <nav className="md:hidden flex overflow-x-auto bg-[#445412]/90 px-2 py-1 gap-1 border-t border-[#fbf0d8]/10">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? location.pathname === href : location.pathname.startsWith(href) && href !== '/admin' ? true : location.pathname === href
            return (
              <Link
                key={href}
                to={href}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  active ? 'bg-[#fbf0d8]/20 text-white' : 'text-[#fbf0d8]/60 hover:text-white hover:bg-[#fbf0d8]/10'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Page content */}
        <main className="flex-1 px-4 py-5 sm:px-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
