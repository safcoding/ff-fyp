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
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

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
      <Card className="bg-[#fbf0d8] shadow-xl mt-10">
        <CardHeader className="pb-4 items-center text-center">
          <CardTitle className="gap-2 text-6xl font-fraunces text-amber-500 font-black">
            PRE-BOOKING SLOT
          </CardTitle>
          <CardDescription className="font-sans text-black font-bold">Step 2 of 5: Select Packages and Pax.</CardDescription>
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
              <p className="text-sm text-slate-600">Pick one or more packages and set pax for each. Please refer to the Package details page for pricing</p>
              <Button type="button" variant="outline" onClick={() => void navigate({ to: "/booking-form/date-slot" })}>
                Back to step 1
              </Button>
            </div>

            {packagesQuery.isPending ? <p>Loading packages...</p> : null}
            {packagesQuery.isError ? <p className="text-sm text-red-600">{packagesQuery.error.message}</p> : null}

            {packagesQuery.data ? (
              <div className="grid gap-4 grid-row-auto">
                {packagesQuery.data.map((pkg) => {
                  const pricing = getPackagePricing(pkg as unknown as Record<string, unknown>)
                  const isSelected = selectedPackageIds.has(pkg.package_id)
                  const selectedPackage = values.packages.find((item) => item.package_id === pkg.package_id)
                  const activities = Array.isArray((pkg as { activities?: unknown }).activities)
                    ? ((pkg as { activities: Array<{ activity_id: number; activity_name: string }> }).activities)
                    : []

                  return (
                    <div
                      key={pkg.package_id}
                      className={`rounded-md border p-4 text-left transition border-[#445412] bg-white/40 ${
                        isSelected ? "border-black bg-white/40" : "hover:bg-bg-white/40"
                      }`}
                    >
                      <div className="grid grid-rows-2 justify-between gap-3 w-max">

                        <Accordion
                        type="single"
                        collapsible
                        defaultValue=""
                        className="max-w-lg"
                        >
                          <AccordionItem value="desc">
                            <AccordionTrigger>
                              <p className="font-black font-fraunces text-2xl text-amber-500">{pkg.package_name}</p>
                            </AccordionTrigger>
                            <AccordionContent className="grid grid-row-2 md:w-full">
                              {pkg.package_note ? (
                                <p className="mt-1 text-sm text-black font-sans mx-auto">{pkg.package_note}</p>
                              ) : null}
                              <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-sm text-black">
                                <p>MY Adult: {formatCurrency(pricing.price_my_adult)}</p>
                                <p>MY Kid: {formatCurrency(pricing.price_my_kid)}</p>
                                <p>MY Senior: {formatCurrency(pricing.price_my_senior)}</p>
                                <p>MY OKU: {formatCurrency(pricing.price_my_oku)}</p>
                                <p>Non-MY Adult: {formatCurrency(pricing.price_non_my_adult)}</p>
                                <p>Non-MY Kid: {formatCurrency(pricing.price_non_my_kid)}</p>
                                <p>Non-MY Senior: {formatCurrency(pricing.price_non_my_senior)}</p>
                                <p>Non-MY OKU: {formatCurrency(pricing.price_non_my_oku)}</p>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>

                        <Button
                          type="button"
                          className="mr-auto text-left justify-start bg-[#445412] text-white font-bold font-sans uppercase text-lg p-4"
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
                          {isSelected ? "remove" : "add"}
                        </Button>
                      </div>

                      {isSelected && selectedPackage ? (
                        <div className="mt-2 space-y-4">
                          {activities.length > 0 ? (
                            <div className="space-y-2">
                              <Label className="text-xs text-slate-600" htmlFor={`${pkg.package_id}-activity`}>
                                Select activity
                              </Label>
                              <select
                                id={`${pkg.package_id}-activity`}
                                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                                value={selectedPackage.selected_activity ?? ""}
                                onChange={(e) => {
                                  const nextValue = e.target.value ? Number(e.target.value) : null
                                  updateField(
                                    "packages",
                                    values.packages.map((item) =>
                                      item.package_id === pkg.package_id
                                        ? { ...item, selected_activity: nextValue }
                                        : item,
                                    ),
                                  )
                                }}
                              >
                                <option value="">No activity selected</option>
                                {activities.map((activity) => (
                                  <option key={activity.activity_id} value={activity.activity_id}>
                                    {activity.activity_name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ) : null}

                          <div className="grid gap-3 md:grid-cols-2">
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
