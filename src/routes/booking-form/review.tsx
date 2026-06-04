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

function ReviewRow({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-stone-200/70 py-2 last:border-b-0">
      <span className="text-sm text-stone-500">{label}</span>
      <span className="max-w-[65%] break-words text-right text-sm font-semibold text-stone-900">
        {value || '-'}
      </span>
    </div>
  )
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="font-fraunces text-xl font-black text-[#445412]">
      {children}
    </h3>
  )
}

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

  const selectedAddons = values.addons
    .map((item) => {
      const addon = addonById.get(item.addon_id)
      return addon
        ? {
            id: `addon-${item.addon_id}`,
            name: addon.addon_name,
            quantity: item.quantity,
            subtotal: addon.addon_price * item.quantity,
          }
        : null
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  const selectedFoods = values.foods
    .map((item) => {
      const food = foodById.get(item.food_id)
      return food
        ? {
            id: `food-${item.food_id}`,
            name: food.food_name,
            quantity: item.quantity,
            subtotal: food.food_price * item.quantity,
          }
        : null
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p>Loading saved booking draft...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:py-10">
      <Card className="mt-2 border-[#445412]/10 bg-[#fbf0d8] shadow-xl sm:mt-6">
        <CardHeader className="items-center px-4 pb-4 text-center sm:px-6">
          <CardTitle className="font-fraunces text-3xl font-black leading-tight text-amber-500 sm:text-5xl lg:text-6xl">
            PRE-BOOKING SLOT
          </CardTitle>
          <CardDescription className="font-sans text-black font-bold">Step 5 of 5:Review Details and submit.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 px-4 sm:px-6">
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
            <div className="flex flex-col gap-3 rounded-md border border-[#445412]/10 bg-white/55 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">
                  Final Review
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  Check the details below before submitting your pre-booking.
                </p>
              </div>
              <Button
                className="w-full sm:w-auto"
                type="button"
                variant="outline"
                onClick={() =>
                  void navigate({ to: '/booking-form/addons-foods' })
                }
              >
                Back to add-ons
              </Button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                    <p className="text-xs font-semibold uppercase text-amber-700">
                      Date
                    </p>
                    <p className="mt-1 text-lg font-black text-stone-950">
                      {values.booking_date || '-'}
                    </p>
                  </div>
                  <div className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-xs font-semibold uppercase text-emerald-700">
                      Visitors
                    </p>
                    <p className="mt-1 text-lg font-black text-stone-950">
                      {totalVisitors} pax
                    </p>
                  </div>
                  <div className="rounded-md border border-sky-200 bg-sky-50 p-4">
                    <p className="text-xs font-semibold uppercase text-sky-700">
                      Slot
                    </p>
                    <p className="mt-1 text-lg font-black text-stone-950">
                      {selectedSlot?.slot_name ?? '-'}
                    </p>
                  </div>
                </div>

                <Card className="border-[#445412]/10 bg-white/70">
                  <CardHeader>
                    <SectionTitle>Booking Details</SectionTitle>
                  </CardHeader>
                  <CardContent className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-stone-500">
                        Schedule
                      </p>
                      <ReviewRow label="Date" value={values.booking_date} />
                      <ReviewRow
                        label="Slot"
                        value={selectedSlot?.slot_name ?? '-'}
                      />
                      <ReviewRow
                        label="Slot Type"
                        value={selectedSlot?.slot_type ?? '-'}
                      />
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase text-stone-500">
                        Organization
                      </p>
                      <ReviewRow label="PIC" value={values.pic_name} />
                      <ReviewRow label="Email" value={values.pic_email} />
                      <ReviewRow label="Phone" value={values.pic_hp} />
                      <ReviewRow label="Organization" value={values.org_name} />
                      <ReviewRow label="State" value={values.org_state} />
                      <ReviewRow label="Type" value={values.org_type} />
                      <ReviewRow label="Address" value={values.org_address} />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-[#445412]/10 bg-white/70">
                  <CardHeader>
                    <SectionTitle>Packages And Visitors</SectionTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {values.packages.length === 0 ? (
                      <p className="text-sm text-slate-600">
                        No package selected.
                      </p>
                    ) : (
                      values.packages.map((pkg) => {
                        const info = packageById.get(pkg.package_id)
                        return (
                          <div
                            key={pkg.package_id}
                            className="rounded-md border border-stone-200 bg-stone-50 p-4"
                          >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                              <div>
                                <p className="font-fraunces text-xl font-black text-amber-600">
                                  {info?.package_name ?? pkg.package_id}
                                </p>
                                {info?.package_note ? (
                                  <p className="mt-1 text-sm text-slate-600">
                                    {info.package_note}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                              {paxFieldMeta
                                .map((meta) => ({
                                  label: meta.label,
                                  value: Number(pkg[meta.name]),
                                }))
                                .filter((entry) => entry.value > 0)
                                .map((entry) => (
                                  <div
                                    key={`${pkg.package_id}-${entry.label}`}
                                    className="rounded-md bg-white px-3 py-2 text-sm"
                                  >
                                    <span className="text-stone-500">
                                      {entry.label}
                                    </span>
                                    <span className="float-right font-bold text-stone-900">
                                      {entry.value}
                                    </span>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </CardContent>
                </Card>

                <Card className="border-[#445412]/10 bg-white/70">
                  <CardHeader>
                    <SectionTitle>Add-ons And Foods</SectionTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedAddons.length === 0 && selectedFoods.length === 0 ? (
                      <p className="text-sm text-slate-600">
                        No add-ons or foods selected.
                      </p>
                    ) : null}

                    {selectedAddons.length > 0 ? (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase text-stone-500">
                          Add-ons
                        </p>
                        <div className="space-y-2">
                          {selectedAddons.map((item) => (
                            <ReviewRow
                              key={item.id}
                              label={`${item.name} x ${item.quantity}`}
                              value={formatCurrency(item.subtotal)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {selectedFoods.length > 0 ? (
                      <div>
                        <p className="mb-2 text-xs font-semibold uppercase text-stone-500">
                          Foods
                        </p>
                        <div className="space-y-2">
                          {selectedFoods.map((item) => (
                            <ReviewRow
                              key={item.id}
                              label={`${item.name} x ${item.quantity}`}
                              value={formatCurrency(item.subtotal)}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              <aside className="lg:sticky lg:top-6 lg:self-start">
                <Card className="border-[#445412]/20 bg-white shadow-md">
                  <CardHeader>
                    <CardTitle className="font-fraunces text-2xl font-black text-[#445412]">
                      Booking Summary
                    </CardTitle>
                    <CardDescription>
                      Estimated amount before staff approval and final
                      confirmation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ReviewRow label="Total Visitors" value={totalVisitors} />
                    <ReviewRow
                      label="Tour Guides"
                      value={
                        selectedSlot?.slot_type === 'GUIDED'
                          ? guideAssignment.error
                            ? 'Contact staff'
                            : (guideAssignment.guideCount ?? '-')
                          : 'Not required'
                      }
                    />
                    <ReviewRow
                      label="Guide Fee"
                      value={formatCurrency(guideAssignment.guideFee)}
                    />
                    <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-semibold uppercase text-amber-700">
                        Estimated Total
                      </p>
                      <p className="mt-1 text-3xl font-black text-amber-600">
                        {formatCurrency(estimatedTotal)}
                      </p>
                    </div>

                    {guideAssignment.error ? (
                      <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {guideAssignment.error}
                      </p>
                    ) : null}

                    <Button
                      className="h-12 w-full font-bold"
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
                  </CardContent>
                </Card>
              </aside>
            </div>

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
