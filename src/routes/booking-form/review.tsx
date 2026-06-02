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
import {createBooking} from '@/features/booking/server/bookingActions'
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
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      void navigate({ 
        to: '/booking-form/success',
        search: {bookingId: data.id} ,
      })
      clearDraft()
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
      <Card className="bg-[#fbf0d8] shadow-xl mt-10">
        <CardHeader className="pb-4 items-center text-center">
          <CardTitle className="gap-2 text-6xl font-fraunces text-amber-500 font-black">
            PRE-BOOKING SLOT
          </CardTitle>
          <CardDescription className="font-sans text-black font-bold">Step 5 of 5:Review Details and submit.</CardDescription>
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
                  <CardTitle className="text-2xl font-fraunces text-amber-500 font-black">Schedule</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xl font-sans font-bold ">
                  <p>Date: {values.booking_date || '-'}</p>
                  <p>Slot: {selectedSlot?.slot_name ?? '-'}</p>
                  <p>Slot Type: {selectedSlot?.slot_type ?? '-'}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-fraunces text-amber-500 font-black">Package</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  {values.packages.length === 0 ? (
                    <p className="text-slate-600">No package selected.</p>
                  ) : (
                    values.packages.map((pkg) => {
                      const info = packageById.get(pkg.package_id)
                      return (
                        <div key={pkg.package_id} className="space-y-1 text-xl font-sans font-bold">
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
                  <CardTitle className="text-2xl font-fraunces text-amber-500 font-black">Visitors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xl font-sans font-bold">
                  {paxFieldMeta.map((meta) => (
                    <p key={meta.name}>
                      {meta.label}: {Number(paxTotals[meta.name])}
                    </p>
                  ))}
                  <p className="pt-2 font-black text-amber-500 text-xl ">
                    Total Visitors: {totalVisitors}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-fraunces text-amber-500 font-black">Tour Guides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xl font-sans font-bold">
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
                  <CardTitle className="text-2xl font-fraunces text-amber-500 font-black">Add-ons and Foods</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xl font-sans font-bold">
                  {values.addons.length === 0 && values.foods.length === 0 ? (
                    <p className="text-slate-600">
                      No add-ons or foods selected.
                    </p>
                  ) : (
                    <>
                      {values.addons.length > 0 ? (
                        <div>
                          <p className="text-2xl font-fraunces text-amber-500 font-black">Add-ons</p>
                          <div className="mt-1 space-y-1 text-xl font-sans font-bold">
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
                          <p className="text-xl font-sans font-bold text-amber-500">Foods</p>
                          <div className="mt-1 space-y-1">
                            {values.foods.map((item) => {
                              const food = foodById.get(item.food_id)
                              if (!food) {
                                return null
                              }
                              return (
                                <p key={`food-${item.food_id}`} className='text-xl font-sans font-bold'>
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
                  <CardTitle className="text-2xl font-fraunces text-amber-500 font-black">
                    PIC and Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-xl font-sans font-bold">
                  <p>Person In Charge: {values.pic_name}</p>
                  <p>Email: {values.pic_email}</p>
                  <p>Phone: {values.pic_hp}</p>
                  <p>Organization Name: {values.org_name}</p>
                  <p>State: {values.org_state}</p>
                  <p>Type: {values.org_type}</p>
                  <p>Address: {values.org_address}</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-3xl font-fraunces text-amber-500 font-black">
                  Estimated Total Amount
                </CardTitle>
                <CardDescription>
                  Computed from selected package pricing, pax counts, add-ons,
                  foods, and guided tour guide fees if applicable.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-black text-amber-500 ">
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
    </div>
  )
}
