import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { format } from "date-fns"
import { CalendarDays, Clock, Users } from "lucide-react"
import { getBookingAvailability } from "@/serverActions/bookingActions"
import { useBookingDraft } from "@/hooks/useBookingDraft"
import { StepIndicator } from "@/components/booking/StepIndicator"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/booking-form/date-slot")({ component: BookingDateSlotPage })

function BookingDateSlotPage() {
  const navigate = Route.useNavigate()
  const { values, updateField, isHydrated } = useBookingDraft()
  const [error, setError] = useState<string | null>(null)
  const [date, setDate] = useState<Date | undefined>(new Date())
  const selectedDate = values.booking_date ? new Date(`${values.booking_date}T00:00:00`) : undefined
  const monthKey = format(selectedDate ?? date ?? new Date(), "yyyy-MM")

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

  const slotsForSelectedDate = values.booking_date ? availabilityQuery.data?.slots_for_date ?? [] : []

  function handleDateSelect(selected: Date | undefined) {
    setDate(selected)

    if (!selected) {
      updateField("booking_date", "")
      updateField("slot_id", "")
      return
    }

    const dateKey = format(selected, "yyyy-MM-dd")
    updateField("booking_date", dateKey)
    updateField("slot_id", "")
    setError(null)
  }

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p>Loading saved booking draft...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CalendarDays className="h-6 w-6 text-rose-500" />
            Booking Wizard
          </CardTitle>
          <CardDescription>Step 1 of 5: Select date and slot.</CardDescription>
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
            <div className="grid gap-8 lg:grid-cols-[1fr,1fr]">
              <div className="flex flex-col">
                <Calendar
                mode="single"
                selected={selectedDate ?? date}
                onSelect={handleDateSelect}
                />
                <div className="mt-4 flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border border-emerald-300 bg-emerald-100" />
                    <span className="text-muted-foreground">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border border-amber-300 bg-amber-100" />
                    <span className="text-muted-foreground">Limited</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border border-muted-foreground/20 bg-muted" />
                    <span className="text-muted-foreground">Fully Booked</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col">
                {selectedDate ? (
                  <>
                    <div className="mb-4">
                      <h3 className="flex items-center gap-2 text-lg font-semibold">
                        <Clock className="h-5 w-5 text-rose-500" />
                        {format(selectedDate, "EEEE, MMMM d, yyyy")}
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">Select an available time slot</p>
                    </div>

                    {availabilityQuery.isPending ? <p>Loading slots...</p> : null}
                    {availabilityQuery.isError ? <p className="text-sm text-red-600">{availabilityQuery.error.message}</p> : null}

                    {slotsForSelectedDate.length > 0 ? (
                      <div className="grid gap-3">
                        {slotsForSelectedDate.map((slot) => {
                          const isFull = slot.is_full
                          const spotsLeft = slot.remaining_capacity
                          const isSelected = values.slot_id === slot.slot_id

                          return (
                            <button
                              key={slot.slot_id}
                              type="button"
                              disabled={isFull}
                              className={cn(
                                "group relative flex items-center justify-between rounded-xl border-2 p-4 text-left transition-all duration-200",
                                isFull
                                  ? "cursor-not-allowed border-muted bg-muted/50 opacity-60"
                                  : isSelected
                                    ? "border-rose-500 bg-rose-50 shadow-md"
                                    : "cursor-pointer border-border hover:border-rose-300 hover:bg-rose-50/50",
                              )}
                              onClick={() => {
                                if (isFull) {
                                  return
                                }
                                updateField("slot_id", slot.slot_id)
                                setError(null)
                              }}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg",
                                    isFull
                                      ? "bg-muted text-muted-foreground"
                                      : isSelected
                                        ? "bg-rose-500 text-white"
                                        : "bg-secondary text-foreground group-hover:bg-rose-100",
                                  )}
                                >
                                  <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                  <p className={cn("font-medium", isFull && "text-muted-foreground")}>{slot.slot_name}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {slot.slot_start} - {slot.slot_end}
                                  </p>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Users className="h-3 w-3" />
                                    <span>
                                      {slot.booked_visitors}/{slot.slot_capacity} booked
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                {isFull ? (
                                  <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                    Full
                                  </span>
                                ) : spotsLeft <= 2 ? (
                                  <span className="rounded-md bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                                    {spotsLeft} {spotsLeft === 1 ? "spot" : "spots"} left
                                  </span>
                                ) : (
                                  <span className="rounded-md bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                                    {spotsLeft} spots left
                                  </span>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    ) : availabilityQuery.isSuccess ? (
                      <p className="text-sm text-muted-foreground">No slots found for this date.</p>
                    ) : null}

                    {values.slot_id ? (
                      <div className="mt-6 rounded-xl border border-rose-200 bg-rose-50 p-4">
                        <h4 className="mb-2 font-medium text-rose-900">Your Selection</h4>
                        <p className="text-sm text-rose-700">
                          {format(selectedDate, "MMMM d, yyyy")} at{" "}
                          {slotsForSelectedDate.find((slot) => slot.slot_id === values.slot_id)?.slot_start ?? "Selected time"}
                        </p>
                      </div>
                    ) : null}
                  </>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center py-12 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <CalendarDays className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="mb-2 text-lg font-medium">Select a Date</h3>
                    <p className="max-w-55 text-sm text-muted-foreground">
                      Choose a date from the calendar to view available time slots.
                    </p>
                  </div>
                )}
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
