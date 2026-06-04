import { Outlet, createFileRoute, useLocation } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/booking-form")({ component: BookingFormEntryPage })

function BookingFormEntryPage() {
  const navigate = Route.useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (location.pathname === "/booking-form") {
      void navigate({ to: "/booking-form/date-slot", replace: true })
    }
  }, [location.pathname, navigate])

  return (
  <div className="bg-[#445412] min-h-screen">
    <Outlet />
  </div>

)
}
