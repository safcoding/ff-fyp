import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"

import { getPackages } from "@/features/package/server/packageActions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const Route = createFileRoute("/packages")({ component: PackagesShowcasePage })

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 2,
  }).format(value)
}

function PackagesShowcasePage() {
  const packagesQuery = useQuery({
    queryKey: ["public-packages"],
    queryFn: () => getPackages(),
  })

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Packages</h1>
        <p className="text-sm text-muted-foreground">Browse all available package options and pricing.</p>
      </div>

      {packagesQuery.isPending ? <p className="text-sm text-muted-foreground">Loading packages...</p> : null}
      {packagesQuery.isError ? <p className="text-sm text-red-600">{packagesQuery.error.message}</p> : null}

      {packagesQuery.data?.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {packagesQuery.data.map((pkg) => (
            <Card key={pkg.package_id} className="border-slate-200">
              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-lg">{pkg.package_name}</CardTitle>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      pkg.package_availability ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {pkg.package_availability ? "Available" : "Unavailable"}
                  </span>
                </div>
                <CardDescription>{pkg.package_note || "No additional notes."}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {pkg.package_features?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {pkg.package_features.map((feature) => (
                      <span
                        key={`${pkg.package_id}-${feature}`}
                        className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No package features listed.</p>
                )}
                <div className="grid gap-2 md:grid-cols-2">
                  <p>MY Adult: {formatCurrency(pkg.price_my_adult)}</p>
                  <p>MY Kid: {formatCurrency(pkg.price_my_kid)}</p>
                  <p>MY Senior: {formatCurrency(pkg.price_my_senior)}</p>
                  <p>MY OKU: {formatCurrency(pkg.price_my_oku)}</p>
                  <p>Non-MY Adult: {formatCurrency(pkg.price_non_my_adult)}</p>
                  <p>Non-MY Kid: {formatCurrency(pkg.price_non_my_kid)}</p>
                  <p>Non-MY Senior: {formatCurrency(pkg.price_non_my_senior)}</p>
                  <p>Non-MY OKU: {formatCurrency(pkg.price_non_my_oku)}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : packagesQuery.isSuccess ? (
        <p className="text-sm text-muted-foreground">No packages found.</p>
      ) : null}
    </div>
  )
}
