import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createPackage, getPackages } from "@/serverActions/packageActions"

export const Route = createFileRoute("/admin/packages")({ component: PackagesPage })

type PackageForm = {
  package_name: string
  package_note: string
  package_availability: boolean
  price_my_adult: number
  price_my_kid: number
  price_my_senior: number
  price_my_oku: number
  price_non_my_adult: number
  price_non_my_kid: number
  price_non_my_senior: number
  price_non_my_oku: number
}

const defaultValues: PackageForm = {
  package_name: "",
  package_note: "",
  package_availability: true,
  price_my_adult: 0,
  price_my_kid: 0,
  price_my_senior: 0,
  price_my_oku: 0,
  price_non_my_adult: 0,
  price_non_my_kid: 0,
  price_non_my_senior: 0,
  price_non_my_oku: 0,
}

const priceFields: ReadonlyArray<{ name: keyof PackageForm; label: string }> = [
  { name: "price_my_adult", label: "MY Adult" },
  { name: "price_my_kid", label: "MY Kid" },
  { name: "price_my_senior", label: "MY Senior" },
  { name: "price_my_oku", label: "MY OKU" },
  { name: "price_non_my_adult", label: "Non-MY Adult" },
  { name: "price_non_my_kid", label: "Non-MY Kid" },
  { name: "price_non_my_senior", label: "Non-MY Senior" },
  { name: "price_non_my_oku", label: "Non-MY OKU" },
]

function PackagesPage() {
  const queryClient = useQueryClient()

  const packagesQuery = useQuery({
    queryKey: ["admin-packages"],
    queryFn: () => getPackages(),
  })

  const createPackageMutation = useMutation({
    mutationFn: createPackage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-packages"] })
    },
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createPackageMutation.mutateAsync({ data: value })
      form.reset()
    },
  })

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Package</CardTitle>
          <CardDescription>Add package details and per-category pricing.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <form.Field name="package_name">
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Package Name</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="package_availability">
                {(field) => (
                  <div className="space-y-2">
                    <Label>Package Availability</Label>
                    <div className="flex h-10 items-center">
                      <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                    </div>
                  </div>
                )}
              </form.Field>

              <form.Field name="package_note">
                {(field) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={field.name}>Package Note (optional)</Label>
                    <Textarea
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {priceFields.map((meta) => (
                <form.Field key={meta.name} name={meta.name}>
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>{meta.label}</Label>
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

            <Button type="submit" disabled={createPackageMutation.isPending}>
              {createPackageMutation.isPending ? "Creating package..." : "Create package"}
            </Button>

            {createPackageMutation.isError ? (
              <p className="text-sm text-red-600">{createPackageMutation.error.message}</p>
            ) : null}
            {createPackageMutation.isSuccess ? (
              <p className="text-sm text-green-700">{createPackageMutation.data}</p>
            ) : null}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Packages</CardTitle>
        </CardHeader>
        <CardContent>
          {packagesQuery.isPending ? <p>Loading packages...</p> : null}
          {packagesQuery.isError ? <p className="text-sm text-red-600">{packagesQuery.error.message}</p> : null}
          {packagesQuery.data ? (
            <div className="space-y-3">
              {packagesQuery.data.map((pkg) => (
                <div key={pkg.package_id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{pkg.package_name}</p>
                  <p>Available: {pkg.package_availability ? "Yes" : "No"}</p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
