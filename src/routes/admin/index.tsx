import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CalendarDays, Package, Ticket, UtensilsCrossed,
  Percent, Activity, CalendarOff, Settings, Users,
} from 'lucide-react'

import { useSession } from '@/lib/auth-client'
import { isAdminUser } from '@/lib/authz'
import { AdminPageHeader, AdminStatPill } from '@/components/admin/AdminPageShell'

export const Route = createFileRoute('/admin/')({ component: AdminIndex })

const pages = [
  { href: '/admin/bookings',   label: 'Bookings',   icon: CalendarDays,    desc: 'View, approve, and manage group tour bookings' },
  { href: '/admin/packages',   label: 'Packages',   icon: Package,         desc: 'Create and edit tour packages and pricing' },
  { href: '/admin/slots',      label: 'Slots',      icon: Ticket,          desc: 'Configure available time slots' },
  { href: '/admin/addons',     label: 'Add-ons',    icon: Ticket,          desc: 'Manage optional add-ons for bookings' },
  { href: '/admin/foods',      label: 'Foods',      icon: UtensilsCrossed, desc: 'Edit food items and pricing' },
  { href: '/admin/discounts',  label: 'Discounts',  icon: Percent,         desc: 'Set up discount codes and rates', adminOnly: true },
  { href: '/admin/activities', label: 'Activities', icon: Activity,        desc: 'Manage on-farm activities' },
  { href: '/admin/blocks',     label: 'Blocks',     icon: CalendarOff,     desc: 'Block out unavailable dates', adminOnly: true },
  { href: '/admin/settings',   label: 'Settings',   icon: Settings,        desc: 'Company info and global settings', adminOnly: true },
  { href: '/admin/users',      label: 'Users',      icon: Users,           desc: 'Create and manage staff accounts', adminOnly: true },
]

function AdminIndex() {
  const { data: session } = useSession()
  const visiblePages = pages.filter((page) => !page.adminOnly || isAdminUser(session?.user))

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Dashboard"
        description="Welcome back. Select a module below to manage bookings, products, schedules, and settings."
        meta={<AdminStatPill label="Modules" value={visiblePages.length} />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visiblePages.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            to={href}
            className="group flex min-h-40 flex-col justify-between gap-5 rounded-md border border-[#445412]/10 bg-white/85 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#445412]/30 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#445412]/10 transition-colors group-hover:bg-[#445412]/20">
                <Icon className="h-5 w-5 text-[#445412]" />
              </div>
              <span className="rounded-full bg-stone-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                Admin
              </span>
            </div>
            <div>
              <p className="text-base font-bold text-stone-900">{label}</p>
              <p className="mt-1 text-sm leading-6 text-stone-500">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
