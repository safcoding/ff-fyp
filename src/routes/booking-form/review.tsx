import { createFileRoute } from '@tanstack/react-router'
import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { formatCurrency } from '@/lib/utils'
import {
  computeTotal,
  getGuideAssignmentPreview,
  getPaxTotals,
  getTotalVisitors,
  paxFieldMeta,
} from '@/lib/utils/booking/booking-form'
import { useBookingDraft } from '@/hooks/useBookingDraft'
import { getAddons } from '@/features/addon/server/addonActions'
import { getFoods } from '@/features/food/server/foodActions'
import {
  getPackagePricing,
  getPackages,
} from '@/features/package/server/packageActions'
import {
  createBooking,
  getBookings,
} from '@/features/booking/server/bookingActions'
import { getSlots } from '@/features/slot/server/slotActions'
import { StepIndicator } from '@/components/booking/StepIndicator'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const Route = createFileRoute('/booking-form/review')({
  component: BookingReviewPage,
})

function BookingReviewPage() {
  const navigate = Route.useNavigate()
  const queryClient = useQueryClient()
  const { values, clearDraft, isHydrated } = useBookingDraft()

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => getBookings(),
  })

  const packagesQuery = useQuery({
    queryKey: ['packages'],
    queryFn: () => getPackages(),
  })

  const slotsQuery = useQuery({
    queryKey: ['slots', 'booking-form'],
    queryFn: () => getSlots(),
  })

  const addonsQuery = useQuery({
    queryKey: ['addons'],
    queryFn: () => getAddons(),
  })

  const foodsQuery = useQuery({
    queryKey: ['foods'],
    queryFn: () => getFoods(),
  })

  const createBookingMutation = useMutation({
    mutationFn: createBooking,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      clearDraft()
      void navigate({ to: '/booking-form/date-slot' })
    },
  })

  const selectedSlot = useMemo(
    () =>
      (slotsQuery.data ?? []).find((slot) => slot.slot_id === values.slot_id),
    [slotsQuery.data, values.slot_id],
  )

  const packagePricingMap = useMemo(() => {
    return Object.fromEntries(
      (packagesQuery.data ?? []).map((pkg) => [
        pkg.package_id,
        getPackagePricing(pkg as unknown as Record<string, unknown>),
      ]),
    )
  }, [packagesQuery.data])

  const totalVisitors = getTotalVisitors(values)
  const paxTotals = getPaxTotals(values)
  const guideAssignment = getGuideAssignmentPreview(
    selectedSlot?.slot_type,
    totalVisitors,
  )

  const estimatedTotal = useMemo(
    () =>
      computeTotal(
        values,
        packagePricingMap,
        addonsQuery.data ?? [],
        foodsQuery.data ?? [],
        guideAssignment.guideFee,
      ),
    [
      values,
      packagePricingMap,
      addonsQuery.data,
      foodsQuery.data,
      guideAssignment.guideFee,
    ],
  )

  const addonById = useMemo(() => {
    return new Map(
      (addonsQuery.data ?? []).map((addon) => [addon.addon_id, addon]),
    )
  }, [addonsQuery.data])

  const foodById = useMemo(() => {
    return new Map((foodsQuery.data ?? []).map((food) => [food.food_id, food]))
  }, [foodsQuery.data])

  const packageById = useMemo(() => {
    return new Map(
      (packagesQuery.data ?? []).map((pkg) => [pkg.package_id, pkg]),
    )
  }, [packagesQuery.data])

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
              if (guideAssignment.error) {
                return
              }
              createBookingMutation.mutate({ data: values })
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Review your booking before submission.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  void navigate({ to: '/booking-form/addons-foods' })
                }
              >
                Back to add-ons
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p>Date: {values.booking_date || '-'}</p>
                  <p>Slot: {selectedSlot?.slot_name ?? '-'}</p>
                  <p>Slot Type: {selectedSlot?.slot_type ?? '-'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {values.packages.length === 0 ? (
                    <p className="text-slate-600">No package selected.</p>
                  ) : (
                    values.packages.map((pkg) => {
                      const info = packageById.get(pkg.package_id)
                      return (
                        <div key={pkg.package_id} className="space-y-1">
                          <p>{info?.package_name ?? pkg.package_id}</p>
                          {info?.package_note ? (
                            <p className="text-slate-600">
                              {info.package_note}
                            </p>
                          ) : null}
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Visitors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {paxFieldMeta.map((meta) => (
                    <p key={meta.name}>
                      {meta.label}: {Number(paxTotals[meta.name])}
                    </p>
                  ))}
                  <p className="pt-2 font-medium">
                    Total Visitors: {totalVisitors}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tour Guides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {selectedSlot?.slot_type === 'GUIDED' ? (
                    guideAssignment.error ? (
                      <p className="text-red-600">{guideAssignment.error}</p>
                    ) : (
                      <>
                        <p>Assigned Guides: {guideAssignment.guideCount}</p>
                        <p>
                          Guide Fee: {formatCurrency(guideAssignment.guideFee)}
                        </p>
                      </>
                    )
                  ) : (
                    <>
                      <p>Assigned Guides: Not required</p>
                      <p>Guide Fee: {formatCurrency(0)}</p>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add-ons and Foods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {values.addons.length === 0 && values.foods.length === 0 ? (
                    <p className="text-slate-600">
                      No add-ons or foods selected.
                    </p>
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
                  <CardTitle className="text-base">
                    PIC and Organization
                  </CardTitle>
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
                <CardTitle className="text-base">
                  Estimated Total Amount
                </CardTitle>
                <CardDescription>
                  Computed from selected package pricing, pax counts, add-ons,
                  foods, and guided tour guide fees.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">
                  {formatCurrency(estimatedTotal)}
                </p>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={
                createBookingMutation.isPending ||
                Boolean(guideAssignment.error)
              }
            >
              {createBookingMutation.isPending
                ? 'Creating booking...'
                : 'Confirm and create booking'}
            </Button>

            {createBookingMutation.isError ? (
              <p className="text-sm text-red-600">
                {createBookingMutation.error.message}
              </p>
            ) : null}
            {createBookingMutation.isSuccess ? (
              <p className="text-sm text-green-700">
                {createBookingMutation.data}
              </p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Bookings</CardTitle>
          <CardDescription>
            Recent bookings fetched via TanStack Query and server function.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bookingsQuery.isPending ? <p>Loading bookings...</p> : null}
          {bookingsQuery.isError ? (
            <p className="text-red-600">{bookingsQuery.error.message}</p>
          ) : null}
          {bookingsQuery.data ? (
            <div className="space-y-3">
              {bookingsQuery.data.map((booking) => (
                <div
                  key={booking.booking_id}
                  className="rounded-md border p-3 text-sm"
                >
                  <p className="font-medium">{booking.org_name}</p>
                  <p>Package ID: {booking.package_id}</p>
                  <p>Slot ID: {booking.slot_id}</p>
                  <p>
                    Tour Guides:{' '}
                    {booking.slot_type === 'GUIDED'
                      ? (booking.assigned_guide_count ?? '-')
                      : 'Not required'}
                  </p>
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
