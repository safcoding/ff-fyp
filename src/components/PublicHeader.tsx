import { Link, useRouterState } from "@tanstack/react-router"

export function PublicHeader() {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  if (pathname.startsWith("/admin")) {
    return null
  }

  const logo = '/ff-logo.png'

 return (
  <header className="w-full bg-[#fbf0d8] shadow-sm relative z-50">
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-10 sm:gap-0">
        <div className="flex justify-center sm:justify-start">
            <div className="w-30 h-30 sm:w-28 sm:h-28 -mb-14 rounded-full flex items-center justify-center bg-[#fbf0d8] rounded-b-full">
            <Link to="/">
              <img src={logo} alt="Farm Fresh @ UPM Logo" />
            </Link>
          </div>
      </div>

        {/* RIGHT SIDE: Navigation Links & Action Buttons */}
      <nav className="flex justify-center sm:justify-end">
        <div className="grid grid-cols-3 w-full sm:w-auto gap-2 text-xs sm:text-sm md:text-base uppercase tracking-wider text-white font-sans font-bold">
            <Link
              to="/packages"
              className="bg-emerald-800 hover:bg-emerald-900 px-2 h-12 flex items-center justify-center transition-colors min-w-25 sm:text-sm"
            >
            Group Packages
            </Link>
            <Link
              to="/booking-form" 
              className="bg-amber-500 hover:bg-amber-600 px-2 h-12 flex items-center justify-center transition-colors min-w-25 sm:text-sm"
            >
              Book Group Tour
            </Link>
            <a
              href="https://www.ticket2u.com.my/farmfresh" 
              className="bg-lime-600 hover:bg-lime-700 px-2 h-12 flex items-center justify-center transition-colors min-w-25 sm:text-sm"
            >
            Book now
            </a>
          </div>
        </nav>
      </div>
    </div>
    </header>
  );
}