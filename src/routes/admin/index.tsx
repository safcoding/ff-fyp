import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CalendarDays, Package, Ticket, UtensilsCrossed,
  Percent, Activity, CalendarOff, Settings, Users,
} from 'lucide-react'

export const Route = createFileRoute('/admin/')({ component: AdminIndex })

const pages = [
  { href: '/admin/bookings',   label: 'Bookings',   icon: CalendarDays,    desc: 'View, approve, and manage group tour bookings' },
  { href: '/admin/packages',   label: 'Packages',   icon: Package,         desc: 'Create and edit tour packages and pricing' },
  { href: '/admin/slots',      label: 'Slots',      icon: Ticket,          desc: 'Configure available time slots' },
  { href: '/admin/addons',     label: 'Add-ons',    icon: Ticket,          desc: 'Manage optional add-ons for bookings' },
  { href: '/admin/foods',      label: 'Foods',      icon: UtensilsCrossed, desc: 'Edit food items and pricing' },
  { href: '/admin/discounts',  label: 'Discounts',  icon: Percent,         desc: 'Set up discount codes and rates' },
  { href: '/admin/activities', label: 'Activities', icon: Activity,        desc: 'Manage on-farm activities' },
  { href: '/admin/blocks',     label: 'Blocks',     icon: CalendarOff,     desc: 'Block out unavailable dates' },
  { href: '/admin/settings',   label: 'Settings',   icon: Settings,        desc: 'Company info and global settings' },
  { href: '/admin/users',      label: 'Users',      icon: Users,           desc: 'Create and manage staff accounts' },
]

function AdminIndex() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#445412]/10 pb-6">
        <h1 className="font-fraunces font-black text-4xl text-[#445412]">Dashboard</h1>
        <p className="text-sm text-stone-500 mt-1">Welcome back. Select a module below to get started.</p>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pages.map(({ href, label, icon: Icon, desc }) => (
          <Link
            key={href}
            to={href}
            className="group flex flex-col gap-3 bg-white border border-[#445412]/10 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[#445412]/30 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#445412]/10 flex items-center justify-center group-hover:bg-[#445412]/20 transition-colors">
              <Icon className="w-5 h-5 text-[#445412]" />
            </div>
            <div>
              <p className="font-bold text-stone-800 text-sm">{label}</p>
              <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
