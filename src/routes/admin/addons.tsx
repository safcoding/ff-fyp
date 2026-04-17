import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createAddon, getAddons } from "@/serverActions/addonActions"

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

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createAddonMutation.mutateAsync({ data: value })
      form.reset()
    },
  })

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
            <form.Field name="addon_name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Addon Name</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="addon_price">
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
                </div>
              )}
            </form.Field>

            <form.Field name="addon_desc">
              {(field) => (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={field.name}>Description</Label>
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
                  <p className="font-medium">{addon.addon_name}</p>
                  <p>Price: {addon.addon_price}</p>
                  <p>Available: {addon.addon_avail ? "Yes" : "No"}</p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
