import { createFileRoute } from "@tanstack/react-router"
import { useMemo } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { formatCurrency } from "@/lib/booking-utils"
import { computeTotal, getTotalVisitors, paxFieldMeta } from "@/lib/booking-form"
import { useBookingDraft } from "@/hooks/useBookingDraft"
import { getAddons } from "@/serverActions/addonActions"
import { getFoods } from "@/serverActions/foodActions"
import { getPackagePricing, getPackages } from "@/serverActions/packageActions"
import { createBooking, getBookings, getSlots } from "@/serverActions/bookingActions"
import { StepIndicator } from "@/components/booking/StepIndicator"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/booking-form/review")({ component: BookingReviewPage })

function BookingReviewPage() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const { values, clearDraft, isHydrated } = useBookingDraft()

  const bookingsQuery = useQuery({
    queryKey: ["bookings"],
    queryFn: () => getBookings(),
  })

  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: () => getPackages(),
  })

  const slotsQuery = useQuery({
    queryKey: ["slots", "booking-form"],
    queryFn: () => getSlots(),
  })

  const addonsQuery = useQuery({
    queryKey: ["addons"],
    queryFn: () => getAddons(),
  })

  const foodsQuery = useQuery({
    queryKey: ["foods"],
    queryFn: () => getFoods(),
  })

  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
      clearDraft()
      void navigate({ to: "/booking-form/date-slot" })
    },
  })

  const selectedSlot = useMemo(
    () => (slotsQuery.data ?? []).find((slot) => slot.slot_id === values.slot_id),
    [slotsQuery.data, values.slot_id],
  )

  const selectedPackage = useMemo(
    () => (packagesQuery.data ?? []).find((pkg) => pkg.package_id === values.package_id),
    [packagesQuery.data, values.package_id],
  )

  const selectedPackagePricing = useMemo(
    () => (selectedPackage ? getPackagePricing(selectedPackage as unknown as Record<string, unknown>) : null),
    [selectedPackage],
  )

  const totalVisitors = getTotalVisitors(values)
  const estimatedTotal = useMemo(
    () => computeTotal(values, selectedPackagePricing, addonsQuery.data ?? [], foodsQuery.data ?? []),
    [values, selectedPackagePricing, addonsQuery.data, foodsQuery.data],
  )

  const addonById = useMemo(() => {
    return new Map((addonsQuery.data ?? []).map((addon) => [addon.addon_id, addon]))
  }, [addonsQuery.data])

  const foodById = useMemo(() => {
    return new Map((foodsQuery.data ?? []).map((food) => [food.food_id, food]))
  }, [foodsQuery.data])

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
          <CardDescription>Step 5 of 5: Review and submit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator step={5} />

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              createBookingMutation.mutate({ data: values })
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Review your booking before submission.</p>
              <Button type="button" variant="outline" onClick={() => void navigate({ to: "/booking-form/addons-foods" })}>
                Back to add-ons
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Date: {values.booking_date || "-"}</p>
                  <p>Slot: {selectedSlot?.slot_name ?? "-"}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>{selectedPackage?.package_name ?? "-"}</p>
                  {selectedPackage?.package_note ? <p className="text-slate-600">{selectedPackage.package_note}</p> : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Visitors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {paxFieldMeta.map((meta) => (
                    <p key={meta.name}>
                      {meta.label}: {Number(values[meta.name])}
                    </p>
                  ))}
                  <p className="pt-2 font-medium">Total Visitors: {totalVisitors}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add-ons and Foods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {values.addons.length === 0 && values.foods.length === 0 ? (
                    <p className="text-slate-600">No add-ons or foods selected.</p>
                  ) : (
                    <>
                      {values.addons.length > 0 ? (
                        <div>
                          <p className="font-medium">Add-ons</p>
                          <div className="mt-1 space-y-1">
                            {values.addons.map((item) => {
                              const addon = addonById.get(item.addon_id)
                              if (!addon) {
                                return null
                              }
                              return (
                                <p key={`addon-${item.addon_id}`}>
                                  {addon.addon_name} x {item.quantity}
                                </p>
                              )
                            })}
                          </div>
                        </div>
                      ) : null}

                      {values.foods.length > 0 ? (
                        <div>
                          <p className="font-medium">Foods</p>
                          <div className="mt-1 space-y-1">
                            {values.foods.map((item) => {
                              const food = foodById.get(item.food_id)
                              if (!food) {
                                return null
                              }
                              return (
                                <p key={`food-${item.food_id}`}>
                                  {food.food_name} x {item.quantity}
                                </p>
                              )
                            })}
                          </div>
                        </div>
                      ) : null}
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">PIC and Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>PIC: {values.pic_name}</p>
                  <p>Email: {values.pic_email}</p>
                  <p>Phone: {values.pic_hp}</p>
                  <p>Organization: {values.org_name}</p>
                  <p>State: {values.org_state}</p>
                  <p>Type: {values.org_type}</p>
                  <p>Address: {values.org_address}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estimated Total Amount</CardTitle>
                <CardDescription>
                  Computed from selected package pricing and pax counts, and validated server-side on submit.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatCurrency(estimatedTotal)}</p>
              </CardContent>
            </Card>

            <Button type="submit" disabled={createBookingMutation.isPending}>
              {createBookingMutation.isPending ? "Creating booking..." : "Confirm and create booking"}
            </Button>

            {createBookingMutation.isError ? <p className="text-sm text-red-600">{createBookingMutation.error.message}</p> : null}
            {createBookingMutation.isSuccess ? <p className="text-sm text-green-700">{createBookingMutation.data}</p> : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Bookings</CardTitle>
          <CardDescription>Recent bookings fetched via TanStack Query and server function.</CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsQuery.isPending ? <p>Loading bookings...</p> : null}
          {bookingsQuery.isError ? <p className="text-red-600">{bookingsQuery.error.message}</p> : null}
          {bookingsQuery.data ? (
            <div className="space-y-3">
              {bookingsQuery.data.map((booking) => (
                <div key={booking.booking_id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{booking.org_name}</p>
                  <p>Package ID: {booking.package_id}</p>
                  <p>Slot ID: {booking.slot_id}</p>
                  <p>Total Price: {booking.booking_price}</p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
