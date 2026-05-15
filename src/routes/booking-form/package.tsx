import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"

import { getPackages, getPackagePricing } from "@/features/package/server/packageActions"
import { useBookingDraft } from "@/hooks/useBookingDraft"
import { formatCurrency } from "@/lib/utils"
import { createEmptyPackageSelection } from "@/lib/utils/booking/booking-form"
import { StepIndicator } from "@/components/booking/StepIndicator"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/booking-form/package")({ component: BookingPackagePage })

function BookingPackagePage() {
  const navigate = Route.useNavigate()
  const { values, updateField, isHydrated } = useBookingDraft()
  const [error, setError] = useState<string | null>(null)

  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: () => getPackages(),
  })

  const selectedPackageId = values.packages.length > 0 ? values.packages[0].package_id : ""

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
          <CardDescription>Step 2 of 5: Select a package.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator step={2} />

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()

              if (!selectedPackageId) {
                setError("Please select a package to continue.")
                return
              }

              setError(null)
              void navigate({ to: "/booking-form/details" })
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Pick one package to continue.</p>
              <Button type="button" variant="outline" onClick={() => void navigate({ to: "/booking-form/date-slot" })}>
                Back to slots
              </Button>
            </div>

            {packagesQuery.isPending ? <p>Loading packages...</p> : null}
            {packagesQuery.isError ? <p className="text-sm text-red-600">{packagesQuery.error.message}</p> : null}

            {packagesQuery.data ? (
              <div className="grid gap-4 md:grid-cols-2">
                {packagesQuery.data.map((pkg) => {
                  const pricing = getPackagePricing(pkg as unknown as Record<string, unknown>)
                  const isSelected = selectedPackageId === pkg.package_id

                  return (
                    <button
                      key={pkg.package_id}
                      type="button"
                      className={`rounded-md border p-4 text-left transition ${
                        isSelected ? "border-black bg-slate-100" : "hover:bg-slate-50"
                      }`}
                      onClick={() => {
                        const current = values.packages.length > 0 ? values.packages[0] : null
                        const next =
                          current && current.package_id === pkg.package_id
                            ? current
                            : createEmptyPackageSelection(pkg.package_id)
                        updateField("packages", [next])
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

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">Next: Enter details</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
