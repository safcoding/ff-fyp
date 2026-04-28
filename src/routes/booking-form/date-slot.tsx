import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { format } from "date-fns"

import { getBookingAvailability } from "@/serverActions/bookingActions"
import { useBookingDraft } from "@/hooks/useBookingDraft"
import { StepIndicator } from "@/components/booking/StepIndicator"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/booking-form/date-slot")({ component: BookingDateSlotPage })

function BookingDateSlotPage() {
  const navigate = Route.useNavigate()
  const { values, updateField, isHydrated } = useBookingDraft()
  const [error, setError] = useState<string | null>(null)
  const [visibleMonth, setVisibleMonth] = useState<Date>(() =>
    values.booking_date ? new Date(`${values.booking_date}T00:00:00`) : new Date(),
  )

  const monthKey = format(visibleMonth, "yyyy-MM")

  const availabilityQuery = useQuery({
    queryKey: ["booking-availability", monthKey, values.booking_date],
    enabled: true,
    queryFn: () =>
      getBookingAvailability({
        data: {
          month: monthKey,
          date: values.booking_date || undefined,
        },
      }),
  })

  const fullyBookedDates = new Set(availabilityQuery.data?.fully_booked_dates ?? [])
  const slotsForSelectedDate = values.booking_date ? availabilityQuery.data?.slots_for_date ?? [] : []

  const today = new Date()
  today.setHours(0, 0, 0, 0)

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

              const selectedSlot = slotsForSelectedDate.find((slot) => slot.slot_id === values.slot_id)
              if (selectedSlot?.is_full) {
                setError("Selected slot is already full. Please choose another slot.")
                return
              }

              setError(null)
              void navigate({ to: "/booking-form/package" })
            }}
          >
            <div className="grid gap-5 lg:grid-cols-[auto,1fr]">
              <div className="rounded-md border bg-card p-3">
                <Calendar
                  mode="single"
                  month={visibleMonth}
                  onMonthChange={setVisibleMonth}
                  selected={values.booking_date ? new Date(`${values.booking_date}T00:00:00`) : undefined}
                  onSelect={(date) => {
                    if (!date) {
                      updateField("booking_date", "")
                      updateField("slot_id", "")
                      return
                    }

                    const dateKey = format(date, "yyyy-MM-dd")
                    if (fullyBookedDates.has(dateKey)) {
                      return
                    }

                    updateField("booking_date", dateKey)
                    updateField("slot_id", "")
                  }}
                  modifiers={{
                    fullyBooked: (date) => fullyBookedDates.has(format(date, "yyyy-MM-dd")),
                  }}
                  modifiersClassNames={{
                    fullyBooked: "line-through text-muted-foreground opacity-50",
                  }}
                  disabled={(date) => {
                    if (date < today) {
                      return true
                    }
                    return fullyBookedDates.has(format(date, "yyyy-MM-dd"))
                  }}
                />
              </div>

              <div className="rounded-md border bg-card p-4">
                <h3 className="mb-3 text-base font-semibold">Time Slots</h3>

                {!values.booking_date ? <p className="text-sm text-slate-600">Pick a date to show available slots.</p> : null}
                {values.booking_date && availabilityQuery.isPending ? <p>Loading slots...</p> : null}
                {values.booking_date && availabilityQuery.isError ? (
                  <p className="text-sm text-red-600">{availabilityQuery.error.message}</p>
                ) : null}

                {values.booking_date && slotsForSelectedDate.length > 0 ? (
                  <div className="space-y-2">
                    {slotsForSelectedDate.map((slot) => {
                      const isSelected = values.slot_id === slot.slot_id

                      return (
                        <button
                          key={slot.slot_id}
                          type="button"
                          disabled={slot.is_full}
                          className={`w-full rounded-md border p-3 text-left transition ${
                            slot.is_full
                              ? "cursor-not-allowed bg-muted/40 text-muted-foreground"
                              : isSelected
                                ? "border-black bg-slate-100"
                                : "hover:bg-slate-50"
                          }`}
                          onClick={() => {
                            if (slot.is_full) {
                              return
                            }
                            updateField("slot_id", slot.slot_id)
                          }}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium">{slot.slot_name}</p>
                              <p className="text-xs text-slate-500">
                                {slot.slot_start} - {slot.slot_end}
                              </p>
                              <p className="text-xs text-slate-500">
                                {slot.booked_visitors}/{slot.slot_capacity} booked, {slot.remaining_capacity} remaining
                              </p>
                            </div>
                            <span
                              className={`rounded px-2 py-1 text-xs font-medium ${
                                slot.is_full ? "bg-slate-300 text-slate-700" : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {slot.is_full ? "FULL" : "BOOK NOW"}
                            </span>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                ) : null}
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">Next: Choose package</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
