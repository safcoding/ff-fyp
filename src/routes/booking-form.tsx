import { Outlet, createFileRoute } from "@tanstack/react-router"
import { useEffect } from "react"

export const Route = createFileRoute("/booking-form")({ component: BookingFormEntryPage })

function BookingFormEntryPage() {
  const navigate = Route.useNavigate()

  useEffect(() => {
    void navigate({ to: "/booking-form/date-slot", replace: true })
  }, [navigate])

  return <Outlet />
}
