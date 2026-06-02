import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"

import { getActivities } from "@/features/activities/server/activityActions"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/deleteDialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createPackage, deletePackage, getPackages, updatePackage } from "@/features/package/server/packageActions"

export const Route = createFileRoute("/admin/packages")({ component: PackagesPage })

type PackageForm = {
  package_name: string
  package_note: string
  package_features: string
  package_availability: boolean
  price_my_adult: number
  price_my_kid: number
  price_my_senior: number
  price_my_oku: number
  price_non_my_adult: number
  price_non_my_kid: number
  price_non_my_senior: number
  price_non_my_oku: number
  activity_ids:number[]
}

const defaultValues: PackageForm = {
  package_name: "",
  package_note: "",
  package_features: "",
  package_availability: true,
  price_my_adult: 0,
  price_my_kid: 0,
  price_my_senior: 0,
  price_my_oku: 0,
  price_non_my_adult: 0,
  price_non_my_kid: 0,
  price_non_my_senior: 0,
  price_non_my_oku: 0,
  activity_ids: [],
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

type PackageData = {
  package_id: string
  package_name: string
  package_note: string | null
  package_features: string[]
  package_availability: boolean
  price_my_adult: number
  price_my_kid: number
  price_my_senior: number
  price_my_oku: number
  price_non_my_adult: number
  price_non_my_kid: number
  price_non_my_senior: number
  price_non_my_oku: number
  activity_ids: number[]
}

function normalizeFeatures(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
}

function PackagesPage() {
  const queryClient = useQueryClient()
  const [editingPackage, setEditingPackage] = useState<PackageData | null>(null)
  const [editValues, setEditValues] = useState<PackageForm>(defaultValues)
  const [deletingPackage, setDeletingPackage] = useState<{ package_id: string; package_name: string } | null>(null)
  
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

  const updatePackageMutation = useMutation({
    mutationFn: updatePackage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-packages"] })
      setEditingPackage(null)
    },
  })

  const deletePackageMutation = useMutation({
    mutationFn: deletePackage,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-packages"] })
      setDeletingPackage(null)
    },
  })

  const activitiesQuery = useQuery({
    queryKey: ["admin-activity"],
    queryFn: () => getActivities(),
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      const package_features = normalizeFeatures(value.package_features)
      await createPackageMutation.mutateAsync({
        data: {
          ...value,
          package_features,
        },
      })
      form.reset()
    },
  })

  function openEditModal(pkg: PackageData) {
    setEditingPackage(pkg)
    setEditValues({
      package_name: pkg.package_name,
      package_note: pkg.package_note ?? "",
      package_features: pkg.package_features.join("\n"),
      package_availability: pkg.package_availability,
      price_my_adult: pkg.price_my_adult,
      price_my_kid: pkg.price_my_kid,
      price_my_senior: pkg.price_my_senior,
      price_my_oku: pkg.price_my_oku,
      price_non_my_adult: pkg.price_non_my_adult,
      price_non_my_kid: pkg.price_non_my_kid,
      price_non_my_senior: pkg.price_non_my_senior,
      price_non_my_oku: pkg.price_non_my_oku,
      activity_ids: pkg.activity_ids ?? [],
    })
  }

  return (
    <div className="space-y-6"><div className="border-b border-[#445412]/10 pb-6"><h1 className="font-fraunces font-black text-4xl text-[#445412]">Packages</h1><p className="text-sm text-stone-500 mt-1">Create and manage tour packages and pricing tiers.</p></div><div className="mx-auto max-w-6xl space-y-8">
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
              <form.Field 
              name="package_name"
            validators={{
              onBlur: ({ value }) =>
                value.length < 1 ? 'Package Name Required' : undefined,
            }}              
              >
                {(field) => (
                  <div className="space-y-2">
                    <Label htmlFor={field.name}>Package Name</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                  {!field.state.meta.isValid && (
                    <em role="alert">{field.state.meta.errors.join(', ')}</em>
                  )}
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

              <form.Field
                name="package_features"
                validators={{
                  onBlur: ({ value }) =>
                    normalizeFeatures(value).length < 1 ? "Add at least one feature." : undefined,
                }}
              >
                {(field) => (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={field.name}>Package Features (one per line)</Label>
                    <Textarea
                      id={field.name}
                      rows={4}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                    />
                    {!field.state.meta.isValid ? (
                      <em role="alert">{field.state.meta.errors.join(", ")}</em>
                    ) : null}
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

            <form.Field name="activity_ids">
              {(field) => (
                <div className="space-y-2">
                  <Label>Activities</Label>
                  {activitiesQuery.isError ? (
                    <p className="text-sm text-red-600">Failed to load activities.</p>
                  ) : null}
                  <div className="grid gap-2 sm:grid-cols-2">
                    {activitiesQuery.data?.map((activity) => {
                      const checked = field.state.value.includes(activity.activity_id)
                      return (
                        <label key={activity.activity_id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...field.state.value, activity.activity_id]
                                : field.state.value.filter((id) => id !== activity.activity_id)
                              field.handleChange(next)
                            }}
                          />
                          {activity.activity_name}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </form.Field>

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
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{pkg.package_name}</p>
                      <p>Available: {pkg.package_availability ? "Yes" : "No"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditModal(pkg)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setDeletingPackage({ package_id: pkg.package_id, package_name: pkg.package_name })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Modal
        open={Boolean(editingPackage)}
        title="Edit Package"
        description="Update package details and pricing."
        onClose={() => setEditingPackage(null)}
      >
        <form
          className="space-y-6"
          onSubmit={(e) => {
            e.preventDefault()
            if (!editingPackage) {
              return
            }
            const package_features = normalizeFeatures(editValues.package_features)
            if (package_features.length < 1) {
              return
            }
            void updatePackageMutation.mutateAsync({
              data: {
                package_id: editingPackage.package_id,
                ...editValues,
                package_features,
              },
            })
          }}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-package-name">Package Name</Label>
              <Input
                id="edit-package-name"
                value={editValues.package_name}
                onChange={(e) => setEditValues((prev) => ({ ...prev, package_name: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Package Availability</Label>
              <div className="flex h-10 items-center">
                <Switch
                  checked={editValues.package_availability}
                  onCheckedChange={(value) =>
                    setEditValues((prev) => ({ ...prev, package_availability: value }))
                  }
                />
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-package-note">Package Note (optional)</Label>
              <Textarea
                id="edit-package-note"
                value={editValues.package_note}
                onChange={(e) => setEditValues((prev) => ({ ...prev, package_note: e.target.value }))}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-package-features">Package Features (one per line)</Label>
              <Textarea
                id="edit-package-features"
                rows={4}
                value={editValues.package_features}
                onChange={(e) => setEditValues((prev) => ({ ...prev, package_features: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {priceFields.map((meta) => (
              <div key={`edit-${meta.name}`} className="space-y-2">
                <Label htmlFor={`edit-${meta.name}`}>{meta.label}</Label>
                <Input
                  id={`edit-${meta.name}`}
                  type="number"
                  min={0}
                  step={1}
                  value={Number(editValues[meta.name])}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      [meta.name]: Number(e.target.value || 0),
                    }))
                  }
                />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Activities</Label>
            {activitiesQuery.isError ? (
              <p className="text-sm text-red-600">Failed to load activities.</p>
            ) : null}
            <div className="grid gap-2 sm:grid-cols-2">
              {activitiesQuery.data?.map((activity) => {
                const checked = editValues.activity_ids.includes(activity.activity_id)
                return (
                  <label key={activity.activity_id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setEditValues((prev) => ({
                          ...prev,
                          activity_ids: e.target.checked
                            ? [...prev.activity_ids, activity.activity_id]
                            : prev.activity_ids.filter((id) => id !== activity.activity_id),
                        }))
                      }
                    />
                    {activity.activity_name}
                  </label>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex gap-2">
              <Button type="submit" disabled={updatePackageMutation.isPending}>
                {updatePackageMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingPackage(null)}>
                Cancel
              </Button>
            </div>
            {updatePackageMutation.isError ? (
              <p className="text-sm text-red-600">{updatePackageMutation.error.message}</p>
            ) : null}
            {updatePackageMutation.isSuccess ? (
              <p className="text-sm text-green-700">{updatePackageMutation.data}</p>
            ) : null}
          </div>
        </form>
      </Modal>

      <DeleteDialog
        open={Boolean(deletingPackage)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingPackage(null)
          }
        }}
        onConfirm={() => {
          if (!deletingPackage) {
            return
          }
          void deletePackageMutation.mutateAsync({ data: { package_id: deletingPackage.package_id } })
        }}
        pending={deletePackageMutation.isPending}
        title="Remove Package"
        description={`This will permanently remove ${deletingPackage?.package_name ?? "this package"}.`}
        confirmLabel="Confirm remove"
      />

      {deletePackageMutation.isError ? (
        <p className="text-sm text-red-600">{deletePackageMutation.error.message}</p>
      ) : null}
      {deletePackageMutation.isSuccess ? (
        <p className="text-sm text-green-700">{deletePackageMutation.data}</p>
      ) : null}
      </div></div>
  )
}
