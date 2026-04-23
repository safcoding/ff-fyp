import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { getSlots } from "@/serverActions/bookingActions"
import { useBookingDraft } from "@/hooks/useBookingDraft"
import { StepIndicator } from "@/components/booking/StepIndicator"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/booking-form/date-slot")({ component: BookingDateSlotPage })

function BookingDateSlotPage() {
  const navigate = Route.useNavigate()
  const { values, updateField, isHydrated } = useBookingDraft()
  const [error, setError] = useState<string | null>(null)

  const slotsQuery = useQuery({
    queryKey: ["slots", "booking-form"],
    enabled: true,
    queryFn: () => getSlots(),
  })

  const slotsQueryData = values.booking_date ? slotsQuery.data : undefined

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p>Loading saved booking draft...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Wizard</CardTitle>
          <CardDescription>Step 1 of 4: Select date and slot.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator step={1} />

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()

              if (!values.booking_date) {
                setError("Please select a booking date.")
                return
              }

              if (!values.slot_id) {
                setError("Please select an available slot.")
                return
              }

              setError(null)
              void navigate({ to: "/booking-form/package" })
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="booking-date">Select a date</Label>
              <Input
                id="booking-date"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={values.booking_date}
                onChange={(e) => {
                  updateField("booking_date", e.target.value)
                  updateField("slot_id", "")
                }}
              />
            </div>

            {!values.booking_date ? <p className="text-sm text-slate-600">Pick a date to continue.</p> : null}
            {values.booking_date && slotsQuery.isPending ? <p>Loading slots...</p> : null}
            {values.booking_date && slotsQuery.isError ? (
              <p className="text-sm text-red-600">{slotsQuery.error.message}</p>
            ) : null}

            {values.booking_date && slotsQueryData ? (
              <div className="grid gap-3 md:grid-cols-2">
                {slotsQueryData.map((slot) => {
                  const isSelected = values.slot_id === slot.slot_id

                  return (
                    <button
                      key={slot.slot_id}
                      type="button"
                      className={`rounded-md border p-4 text-left transition ${
                        isSelected ? "border-black bg-slate-100" : "hover:bg-slate-50"
                      }`}
                      onClick={() => {
                        updateField("slot_id", slot.slot_id)
                      }}
                    >
                      <p className="text-sm font-medium">{slot.slot_name}</p>
                      <p className="text-xs text-slate-500">Capacity: {slot.slot_capacity}</p>
                    </button>
                  )
                })}
              </div>
            ) : null}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">Next: Choose package</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
