import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"

import { getPackages, getPackagePricing } from "@/features/package/server/packageActions"
import { useBookingDraft } from "@/hooks/useBookingDraft"
import { formatCurrency } from "@/lib/utils"
import { createEmptyPackageSelection, getTotalVisitors, paxFieldMeta } from "@/lib/utils/booking/booking-form"
import { StepIndicator } from "@/components/booking/StepIndicator"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/booking-form/package")({ component: BookingPackagePage })

function BookingPackagePage() {
  const navigate = Route.useNavigate()
  const { values, updateField, isHydrated } = useBookingDraft()
  const [error, setError] = useState<string | null>(null)

  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: () => getPackages(),
  })

  const selectedPackageIds = useMemo(() => new Set(values.packages.map((pkg) => pkg.package_id)), [values.packages])
  const totalVisitors = getTotalVisitors(values)

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
          <CardDescription>Step 2 of 5: Select packages and pax.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator step={2} />

          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault()

              if (values.packages.length === 0) {
                setError("Please select at least one package to continue.")
                return
              }

              if (totalVisitors < 20) {
                setError("At least 20 visitors are required.")
                return
              }

              setError(null)
              void navigate({ to: "/booking-form/details" })
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Pick one or more packages, then set pax for each.</p>
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
                  const isSelected = selectedPackageIds.has(pkg.package_id)
                  const selectedPackage = values.packages.find((item) => item.package_id === pkg.package_id)

                  return (
                    <div
                      key={pkg.package_id}
                      className={`rounded-md border p-4 text-left transition ${
                        isSelected ? "border-black bg-slate-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{pkg.package_name}</p>
                          {pkg.package_note ? (
                            <p className="mt-1 text-sm text-slate-600">{pkg.package_note}</p>
                          ) : null}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant={isSelected ? "destructive" : "outline"}
                          onClick={() => {
                            if (isSelected) {
                              updateField(
                                "packages",
                                values.packages.filter((item) => item.package_id !== pkg.package_id),
                              )
                              return
                            }
                            updateField("packages", [...values.packages, createEmptyPackageSelection(pkg.package_id)])
                          }}
                        >
                          {isSelected ? "Remove" : "Add"}
                        </Button>
                      </div>

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

                      {isSelected && selectedPackage ? (
                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          {paxFieldMeta.map((fieldMeta) => (
                            <div key={`${pkg.package_id}-${fieldMeta.name}`} className="space-y-1">
                              <Label className="text-xs text-slate-600" htmlFor={`${pkg.package_id}-${fieldMeta.name}`}>
                                {fieldMeta.label}
                              </Label>
                              <Input
                                id={`${pkg.package_id}-${fieldMeta.name}`}
                                type="number"
                                min={0}
                                step={1}
                                value={Number(selectedPackage[fieldMeta.name])}
                                onChange={(e) => {
                                  const nextValue = Math.max(0, Math.floor(Number(e.target.value || 0)))
                                  updateField(
                                    "packages",
                                    values.packages.map((item) =>
                                      item.package_id === pkg.package_id
                                        ? { ...item, [fieldMeta.name]: nextValue }
                                        : item,
                                    ),
                                  )
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
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
