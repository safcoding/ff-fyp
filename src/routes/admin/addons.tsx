import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createAddon, deleteAddon, getAddons, updateAddon } from "@/serverActions/addonActions"

export const Route = createFileRoute("/admin/addons")({ component: AddonsPage })

type AddonForm = {
  addon_name: string
  addon_desc: string
  addon_price: number
  addon_avail: boolean
}

const defaultValues: AddonForm = {
  addon_name: "",
  addon_desc: "",
  addon_price: 0,
  addon_avail: true,
}

function AddonsPage() {
  const queryClient = useQueryClient()
  const [editingAddon, setEditingAddon] = useState<(AddonForm & { addon_id: number }) | null>(null)
  const [editValues, setEditValues] = useState<AddonForm>(defaultValues)
  const [deletingAddon, setDeletingAddon] = useState<{ addon_id: number; addon_name: string } | null>(null)

  const addonsQuery = useQuery({
    queryKey: ["admin-addons"],
    queryFn: () => getAddons(),
  })

  const createAddonMutation = useMutation({
    mutationFn: createAddon,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-addons"] })
    },
  })

  const updateAddonMutation = useMutation({
    mutationFn: updateAddon,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-addons"] })
      setEditingAddon(null)
    },
  })

  const deleteAddonMutation = useMutation({
    mutationFn: deleteAddon,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-addons"] })
      setDeletingAddon(null)
    },
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createAddonMutation.mutateAsync({ data: value })
      form.reset()
    },
  })

  function openEditModal(addon: { addon_id: number } & AddonForm) {
    setEditingAddon(addon)
    setEditValues({
      addon_name: addon.addon_name,
      addon_desc: addon.addon_desc,
      addon_price: addon.addon_price,
      addon_avail: addon.addon_avail,
    })
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Addon</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field 
            name="addon_name"
            validators={{
              onBlur: ({ value }) =>
                value.length < 1 ? 'Addon Name is required' : undefined,
            }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Addon Name</Label>
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

            <form.Field 
            name="addon_price"
            validators={{
              onBlur: ({ value }) =>
                value < 0 ? 'Price must be RM0 or more' : undefined,
            }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Addon Price</Label>
                  <Input
                    id={field.name}
                    type="number"
                    min={0}
                    step={1}
                    value={Number(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value || 0))}
                  />
                  {!field.state.meta.isValid && (
                    <em role="alert">{field.state.meta.errors.join(', ')}</em>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field name="addon_desc">
              {(field) => (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={field.name}>Description (optional)</Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="addon_avail">
              {(field) => (
                <div className="space-y-2">
                  <Label>Available</Label>
                  <div className="flex h-10 items-center">
                    <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
                  </div>
                </div>
              )}
            </form.Field>

            <div className="space-y-2 md:col-span-2">
              <Button type="submit" disabled={createAddonMutation.isPending}>
                {createAddonMutation.isPending ? "Creating addon..." : "Create addon"}
              </Button>
              {createAddonMutation.isError ? (
                <p className="text-sm text-red-600">{createAddonMutation.error.message}</p>
              ) : null}
              {createAddonMutation.isSuccess ? (
                <p className="text-sm text-green-700">{createAddonMutation.data}</p>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Addons</CardTitle>
        </CardHeader>
        <CardContent>
          {addonsQuery.isPending ? <p>Loading addons...</p> : null}
          {addonsQuery.isError ? <p className="text-sm text-red-600">{addonsQuery.error.message}</p> : null}
          {addonsQuery.data ? (
            <div className="space-y-3">
              {addonsQuery.data.map((addon) => (
                <div key={addon.addon_id} className="rounded-md border p-3 text-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{addon.addon_name}</p>
                      <p>Price: {addon.addon_price}</p>
                      <p>Available: {addon.addon_avail ? "Yes" : "No"}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditModal(addon)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingAddon({ addon_id: addon.addon_id, addon_name: addon.addon_name })}
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
        open={Boolean(editingAddon)}
        title="Edit Addon"
        description="Update addon details."
        onClose={() => setEditingAddon(null)}
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!editingAddon) {
              return
            }
            void updateAddonMutation.mutateAsync({
              data: {
                addon_id: editingAddon.addon_id,
                ...editValues,
              },
            })
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="edit-addon-name">Addon Name</Label>
            <Input
              id="edit-addon-name"
              value={editValues.addon_name}
              onChange={(e) => setEditValues((prev) => ({ ...prev, addon_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-addon-price">Addon Price</Label>
            <Input
              id="edit-addon-price"
              type="number"
              min={0}
              step={1}
              value={Number(editValues.addon_price)}
              onChange={(e) =>
                setEditValues((prev) => ({ ...prev, addon_price: Number(e.target.value || 0) }))
              }
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="edit-addon-desc">Description</Label>
            <Textarea
              id="edit-addon-desc"
              value={editValues.addon_desc}
              onChange={(e) => setEditValues((prev) => ({ ...prev, addon_desc: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label>Available</Label>
            <div className="flex h-10 items-center">
              <Switch
                checked={editValues.addon_avail}
                onCheckedChange={(value) => setEditValues((prev) => ({ ...prev, addon_avail: value }))}
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex gap-2">
              <Button type="submit" disabled={updateAddonMutation.isPending}>
                {updateAddonMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingAddon(null)}>
                Cancel
              </Button>
            </div>
            {updateAddonMutation.isError ? (
              <p className="text-sm text-red-600">{updateAddonMutation.error.message}</p>
            ) : null}
            {updateAddonMutation.isSuccess ? (
              <p className="text-sm text-green-700">{updateAddonMutation.data}</p>
            ) : null}
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(deletingAddon)}
        title="Remove Addon"
        description={`This will permanently remove ${deletingAddon?.addon_name ?? "this addon"}.`}
        onClose={() => setDeletingAddon(null)}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={deleteAddonMutation.isPending}
              onClick={() => {
                if (!deletingAddon) {
                  return
                }
                void deleteAddonMutation.mutateAsync({ data: { addon_id: deletingAddon.addon_id } })
              }}
            >
              {deleteAddonMutation.isPending ? "Removing..." : "Confirm remove"}
            </Button>
            <Button type="button" variant="outline" onClick={() => setDeletingAddon(null)}>
              Cancel
            </Button>
          </div>
          {deleteAddonMutation.isError ? (
            <p className="text-sm text-red-600">{deleteAddonMutation.error.message}</p>
          ) : null}
          {deleteAddonMutation.isSuccess ? (
            <p className="text-sm text-green-700">{deleteAddonMutation.data}</p>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}
