import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"

import { formatCurrency } from "@/lib/utils"
import { computeTotal } from "@/lib/utils/booking/booking-form"
import { useBookingDraft } from "@/hooks/useBookingDraft"
import { getAddons } from "@/features/addon/server/addonActions"
import { getFoods } from "@/features/food/server/foodActions"
import { getPackagePricing, getPackages } from "@/features/package/server/packageActions"
import { StepIndicator } from "@/components/booking/StepIndicator"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/booking-form/addons-foods")({ component: BookingAddonsFoodsPage })

function BookingAddonsFoodsPage() {
  const navigate = Route.useNavigate()
  const { values, updateField, isHydrated } = useBookingDraft()
  const [error, setError] = useState<string | null>(null)

  const addonsQuery = useQuery({
    queryKey: ["addons"],
    queryFn: () => getAddons(),
  })

  const foodsQuery = useQuery({
    queryKey: ["foods"],
    queryFn: () => getFoods(),
  })

  const packagesQuery = useQuery({
    queryKey: ["packages"],
    queryFn: () => getPackages(),
  })

  const packagePricingMap = useMemo(() => {
    return Object.fromEntries(
      (packagesQuery.data ?? []).map((pkg) => [
        pkg.package_id,
        getPackagePricing(pkg as unknown as Record<string, unknown>),
      ])
    )
  }, [packagesQuery.data])

  const estimatedTotal = useMemo(
    () => computeTotal(values, packagePricingMap, addonsQuery.data ?? [], foodsQuery.data ?? []),
    [values, packagePricingMap, addonsQuery.data, foodsQuery.data],
  )

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p>Loading saved booking draft...</p>
      </div>
    )
  }

  function updateAddonQuantity(addonId: number, quantity: number) {
    const nextQty = Math.max(0, Math.floor(Number(quantity) || 0))
    const next = values.addons.filter((item) => item.addon_id !== addonId)

    if (nextQty > 0) {
      next.push({ addon_id: addonId, quantity: nextQty })
    }

    updateField("addons", next)
  }

  function updateFoodQuantity(foodId: number, quantity: number) {
    const parsed = Math.floor(Number(quantity) || 0)
    const nextQty = parsed > 0 ? Math.max(parsed, 20) : 0
    const next = values.foods.filter((item) => item.food_id !== foodId)

    if (nextQty > 0) {
      next.push({ food_id: foodId, quantity: nextQty })
    }

    updateField("foods", next)
  }

  function getAddonQuantity(addonId: number) {
    return values.addons.find((item) => item.addon_id === addonId)?.quantity ?? 0
  }

  function getFoodQuantity(foodId: number) {
    return values.foods.find((item) => item.food_id === foodId)?.quantity ?? 0
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Wizard</CardTitle>
          <CardDescription>Step 4 of 5: Add optional add-ons and foods.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator step={4} />

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              setError(null)
              void navigate({ to: "/booking-form/review" })
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Select add-ons and foods, then set quantities.</p>
              <Button type="button" variant="outline" onClick={() => void navigate({ to: "/booking-form/details" })}>
                Back to details
              </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Add-ons</CardTitle>
                  <CardDescription>Optional add-ons available for your booking.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {addonsQuery.isPending ? <p>Loading add-ons...</p> : null}
                  {addonsQuery.isError ? <p className="text-sm text-red-600">{addonsQuery.error.message}</p> : null}

                  {addonsQuery.data?.length ? (
                    <div className="space-y-3">
                      {addonsQuery.data.map((addon) => {
                        const isAvailable = addon.addon_avail
                        const quantity = getAddonQuantity(addon.addon_id)

                        return (
                          <div key={addon.addon_id} className="rounded-md border p-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-medium">{addon.addon_name}</p>
                                {addon.addon_desc ? (
                                  <p className="text-sm text-slate-600">{addon.addon_desc}</p>
                                ) : null}
                                <p className="text-sm text-slate-600">{formatCurrency(addon.addon_price)}</p>
                              </div>
                              <div className="min-w-[120px] space-y-1">
                                <Label htmlFor={`addon-${addon.addon_id}`}>Quantity</Label>
                                <Input
                                  id={`addon-${addon.addon_id}`}
                                  type="number"
                                  min={0}
                                  step={1}
                                  disabled={!isAvailable}
                                  value={quantity}
                                  onChange={(e) => updateAddonQuantity(addon.addon_id, Number(e.target.value || 0))}
                                />
                                {!isAvailable ? <p className="text-xs text-slate-500">Unavailable</p> : null}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : addonsQuery.isSuccess ? (
                    <p className="text-sm text-slate-600">No add-ons available.</p>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Foods</CardTitle>
                  <CardDescription>Optional foods to include with your booking.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {foodsQuery.isPending ? <p>Loading foods...</p> : null}
                  {foodsQuery.isError ? <p className="text-sm text-red-600">{foodsQuery.error.message}</p> : null}

                  {foodsQuery.data?.length ? (
                    <div className="space-y-3">
                      {foodsQuery.data.map((food) => {
                        const quantity = getFoodQuantity(food.food_id)

                        return (
                          <div key={food.food_id} className="rounded-md border p-3">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="font-medium">{food.food_name}</p>
                                <p className="text-sm text-slate-600">{formatCurrency(food.food_price)}</p>
                              </div>
                              <div className="min-w-[120px] space-y-1">
                                <Label htmlFor={`food-${food.food_id}`}>Quantity</Label>
                                <Input
                                  id={`food-${food.food_id}`}
                                  type="number"
                                  min={0}
                                  step={1}
                                  value={quantity}
                                  onChange={(e) => updateFoodQuantity(food.food_id, Number(e.target.value || 0))}
                                />
                                <p className="text-xs text-slate-500">Minimum 20 per food selection.</p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : foodsQuery.isSuccess ? (
                    <p className="text-sm text-slate-600">No foods available.</p>
                  ) : null}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Estimated Total Amount</CardTitle>
                <CardDescription>Includes package pricing, add-ons, and foods.</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{formatCurrency(estimatedTotal)}</p>
              </CardContent>
            </Card>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">Next: Review summary</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
