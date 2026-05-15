import { Link, useRouterState } from "@tanstack/react-router"

export function PublicHeader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (pathname.startsWith("/admin")) {
    return null
  }

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 md:px-8">
        <Link to="/" className="text-base font-semibold tracking-tight">
          Farm Fresh @ UPM
        </Link>
        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          <Link to="/" className="rounded-full px-3 py-1 hover:bg-slate-100">
            Home
          </Link>
          <Link to="/packages" className="rounded-full px-3 py-1 hover:bg-slate-100">
            Packages
          </Link>
          <Link to="/booking-form" className="rounded-full px-3 py-1 hover:bg-slate-100">
            Book Now
          </Link>
        </nav>
      </div>
    </header>
  )
}
