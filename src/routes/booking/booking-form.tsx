import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import { useMemo, useState } from "react"

import {
  createBooking,
  getAvailablePackages,
  getBookings,
  getSlots,
} from "@/serverActions/bookingActions"
import { formatCurrency } from "@/lib/booking-utils"
import type { PackagePricing } from "@/serverActions/packageActions"
import { getPackagePricing } from "@/serverActions/packageActions"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/booking/booking-form")({ component: Booking })

type Step = 1 | 2 | 3 | 4

type FormValues = {
  pax_my_adult: number
  pax_my_kid: number
  pax_my_senior: number
  pax_my_oku: number
  pax_non_my_adult: number
  pax_non_my_kid: number
  pax_non_my_senior: number
  pax_non_my_oku: number
  pic_name: string
  pic_email: string
  pic_hp: string
  org_address: string
  org_name: string
  org_state: string
  org_type: string
  slot_id: string
  package_id: string
  booking_date: string
}

const defaultFormValues: FormValues = {
  pax_my_adult: 0,
  pax_my_kid: 0,
  pax_my_senior: 0,
  pax_my_oku: 0,
  pax_non_my_adult: 0,
  pax_non_my_kid: 0,
  pax_non_my_senior: 0,
  pax_non_my_oku: 0,
  booking_date: "",
  pic_name: "",
  pic_email: "",
  pic_hp: "",
  org_address: "",
  org_name: "",
  org_state: "",
  org_type: "",
  slot_id: "",
  package_id: "",
}

const paxFieldMeta: ReadonlyArray<{ name: keyof FormValues; label: string }> = [
  { name: "pax_my_adult", label: "MY Adult" },
  { name: "pax_my_kid", label: "MY Kid" },
  { name: "pax_my_senior", label: "MY Senior" },
  { name: "pax_my_oku", label: "MY OKU" },
  { name: "pax_non_my_adult", label: "Non-MY Adult" },
  { name: "pax_non_my_kid", label: "Non-MY Kid" },
  { name: "pax_non_my_senior", label: "Non-MY Senior" },
  { name: "pax_non_my_oku", label: "Non-MY OKU" },
]

function computeTotal(values: FormValues, pricing: PackagePricing | null): number {
  if (!pricing) return 0

  return (
    values.pax_my_adult * pricing.price_my_adult +
    values.pax_my_kid * pricing.price_my_kid +
    values.pax_my_senior * pricing.price_my_senior +
    values.pax_my_oku * pricing.price_my_oku +
    values.pax_non_my_adult * pricing.price_non_my_adult +
    values.pax_non_my_kid * pricing.price_non_my_kid +
    values.pax_non_my_senior * pricing.price_non_my_senior +
    values.pax_non_my_oku * pricing.price_non_my_oku
  )
}

function Booking() {
  const queryClient = useQueryClient()
  const [step, setStep] = useState<Step>(1)
  const [selectedDate, setSelectedDate] = useState("")
  const [detailsStepError, setDetailsStepError] = useState<string | null>(null)

  const bookingsQuery = useQuery({
    queryKey: ["bookings"],
    queryFn: () => getBookings(),
  })

  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: () => getAvailablePackages(),
  })

  const slotsQuery = useQuery({
    queryKey: ["slots", selectedDate],
    enabled: Boolean(selectedDate),
    queryFn: () => getSlots(),
  })

  const createBookingMutation = useMutation({
    mutationFn: createBooking,
  })

  const form = useForm({
    defaultValues: defaultFormValues,
    onSubmit: async ({ value }) => {
      await createBookingMutation.mutateAsync({ data: value })
      await queryClient.invalidateQueries({ queryKey: ["bookings"] })
      setStep(1)
      setSelectedDate("")
      form.reset()
    },
  })

  const formValues = form.state.values as FormValues

  const selectedSlot = useMemo(
    () => (slotsQuery.data ?? []).find((slot) => slot.slot_id === formValues.slot_id),
    [slotsQuery.data, formValues.slot_id],
  )

  const selectedPackage = useMemo(
    () => (packagesQuery.data ?? []).find((pkg) => pkg.package_id === formValues.package_id),
    [packagesQuery.data, formValues.package_id],
  )

  const selectedPackagePricing = useMemo(
    () => (selectedPackage ? getPackagePricing(selectedPackage as unknown as Record<string, unknown>) : null),
    [selectedPackage],
  )

  const totalVisitors =
    formValues.pax_my_adult +
    formValues.pax_my_kid +
    formValues.pax_my_senior +
    formValues.pax_my_oku +
    formValues.pax_non_my_adult +
    formValues.pax_non_my_kid +
    formValues.pax_non_my_senior +
    formValues.pax_non_my_oku

  const estimatedTotal = useMemo(
    () => computeTotal(formValues, selectedPackagePricing),
    [formValues, selectedPackagePricing],
  )

  const validateDetailsStep = () => {
    if (totalVisitors < 1) {
      setDetailsStepError("At least one visitor is required.")
      return false
    }

    const requiredTextFields: Array<{ key: keyof FormValues; label: string }> = [
      { key: "pic_name", label: "Person in Charge Name" },
      { key: "pic_email", label: "Person in Charge Email" },
      { key: "pic_hp", label: "Phone" },
      { key: "org_name", label: "Organization Name" },
      { key: "org_address", label: "Organization Address" },
      { key: "org_state", label: "Organization State" },
      { key: "org_type", label: "Organization Type" },
    ]

    for (const field of requiredTextFields) {
      const value = String(formValues[field.key] ?? "").trim()
      if (!value) {
        setDetailsStepError(`${field.label} is required.`)
        return false
      }
    }

    setDetailsStepError(null)
    return true
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Wizard</CardTitle>
          <CardDescription>
            Step {step} of 4: Choose date/slot, package, details, then confirm summary.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className={`rounded-md border px-3 py-2 text-sm ${
                  step === item ? "border-black bg-slate-100 font-medium" : "text-slate-500"
                }`}
              >
                Step {item}
              </div>
            ))}
          </div>

          {step === 1 ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="booking-date">Select a date</Label>
                <Input
                  id="booking-date"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    form.setFieldValue("booking_date", e.target.value)
                    form.setFieldValue("slot_id", "")
                  }}
                />
                <p className="text-xs text-slate-600">
                  Select a date to load available slots. Current backend stores slot selection but not booking date yet.
                </p>
              </div>

              {!selectedDate ? <p className="text-sm text-slate-600">Pick a date to continue.</p> : null}
              {selectedDate && slotsQuery.isPending ? <p>Loading slots...</p> : null}
              {selectedDate && slotsQuery.isError ? (
                <p className="text-sm text-red-600">{slotsQuery.error.message}</p>
              ) : null}

              {selectedDate && slotsQuery.data ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {slotsQuery.data.map((slot) => {
                    const isSelected = formValues.slot_id === slot.slot_id

                    return (
                      <button
                        key={slot.slot_id}
                        type="button"
                        className={`rounded-md border p-4 text-left transition ${
                          isSelected ? "border-black bg-slate-100" : "hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          form.setFieldValue("slot_id", slot.slot_id)
                          setStep(2)
                        }}
                      >
                        <p className="text-sm font-medium">{slot.slot_name}</p>
                        <p className="text-xs text-slate-500">Click to continue to package selection</p>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">Pick one package to continue.</p>
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back to slots
                </Button>
              </div>

              {packagesQuery.isPending ? <p>Loading packages...</p> : null}
              {packagesQuery.isError ? (
                <p className="text-sm text-red-600">{packagesQuery.error.message}</p>
              ) : null}

              {packagesQuery.data ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {packagesQuery.data.map((pkg) => {
                    const pricing = getPackagePricing(pkg as unknown as Record<string, unknown>)
                    const isSelected = formValues.package_id === pkg.package_id

                    return (
                      <button
                        key={pkg.package_id}
                        type="button"
                        className={`rounded-md border p-4 text-left transition ${
                          isSelected ? "border-black bg-slate-100" : "hover:bg-slate-50"
                        }`}
                        onClick={() => {
                          form.setFieldValue("package_id", pkg.package_id)
                          setStep(3)
                        }}
                      >
                        <p className="font-medium">{pkg.package_name}</p>
                        {pkg.package_note ? <p className="mt-1 text-sm text-slate-600">{pkg.package_note}</p> : null}
                        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-slate-600">
                          <p>MY Adult: {formatCurrency(pricing.price_my_adult)}</p>
                          <p>MY Kid: {formatCurrency(pricing.price_my_kid)}</p>
                          <p>MY Senior: {formatCurrency(pricing.price_my_senior)}</p>
                          <p>MY OKU: {formatCurrency(pricing.price_my_oku)}</p>
                          <p>Non-MY Adult: {formatCurrency(pricing.price_non_my_adult)}</p>
                          <p>Non-MY Kid: {formatCurrency(pricing.price_non_my_kid)}</p>
                          <p>Non-MY Senior: {formatCurrency(pricing.price_non_my_senior)}</p>
                          <p>Non-MY OKU: {formatCurrency(pricing.price_non_my_oku)}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </div>
          ) : null}

          {step === 3 ? (
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                if (validateDetailsStep()) {
                  setStep(4)
                }
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">Enter visitors and contact details.</p>
                <Button type="button" variant="outline" onClick={() => setStep(2)}>
                  Back to packages
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {paxFieldMeta.map((fieldMeta) => (
                  <form.Field key={fieldMeta.name} name={fieldMeta.name}>
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>{fieldMeta.label}</Label>
                        <Input
                          id={field.name}
                          type="number"
                          min={0}
                          step={1}
                          value={Number(field.state.value)}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(Number(e.target.value || 0))}
                        />
                      </div>
                    )}
                  </form.Field>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field name="pic_name">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Person in Charge Name</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="pic_email">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Person in Charge Email</Label>
                      <Input
                        id={field.name}
                        type="email"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="pic_hp">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Phone (E.164 format)</Label>
                      <Input
                        id={field.name}
                        placeholder="+60123456789"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="org_name">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Organization Name</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="org_address">
                  {(field) => (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={field.name}>Organization Address</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="org_state">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Organization State</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="org_type">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Organization Type</Label>
                      <Input
                        id={field.name}
                        maxLength={20}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      />
                    </div>
                  )}
                </form.Field>
              </div>

              <div className="space-y-2">
                <p className="text-sm">Current total visitors: {totalVisitors}</p>
                {detailsStepError ? <p className="text-sm text-red-600">{detailsStepError}</p> : null}
              </div>

              <Button type="submit">Next: Review Summary</Button>
            </form>
          ) : null}

          {step === 4 ? (
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void form.handleSubmit()
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">Review your booking before submission.</p>
                <Button type="button" variant="outline" onClick={() => setStep(3)}>
                  Back to details
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Schedule</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>Date: {selectedDate || "-"}</p>
                    <p>Slot: {selectedSlot?.slot_name ?? "-"}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Package</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>{selectedPackage?.package_name ?? "-"}</p>
                    {selectedPackage?.package_note ? (
                      <p className="text-slate-600">{selectedPackage.package_note}</p>
                    ) : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Visitors</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    {paxFieldMeta.map((meta) => (
                      <p key={meta.name}>
                        {meta.label}: {Number(formValues[meta.name])}
                      </p>
                    ))}
                    <p className="pt-2 font-medium">Total Visitors: {totalVisitors}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">PIC & Organization</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>PIC: {formValues.pic_name}</p>
                    <p>Email: {formValues.pic_email}</p>
                    <p>Phone: {formValues.pic_hp}</p>
                    <p>Organization: {formValues.org_name}</p>
                    <p>State: {formValues.org_state}</p>
                    <p>Type: {formValues.org_type}</p>
                    <p>Address: {formValues.org_address}</p>
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

              {createBookingMutation.isError ? (
                <p className="text-sm text-red-600">{createBookingMutation.error.message}</p>
              ) : null}
              {createBookingMutation.isSuccess ? (
                <p className="text-sm text-green-700">{createBookingMutation.data}</p>
              ) : null}
            </form>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Bookings</CardTitle>
          <CardDescription>Recent bookings fetched via TanStack Query + server function.</CardDescription>
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
