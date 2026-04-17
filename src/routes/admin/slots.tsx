import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createSlot, getSlotsAdmin } from "@/serverActions/slotActions"

export const Route = createFileRoute("/admin/slots")({ component: SlotsPage })

type SlotForm = {
  slot_id: string
  slot_name: string
  slot_start: string
  slot_end: string
  slot_capacity: number
}

const defaultValues: SlotForm = {
  slot_id: "",
  slot_name: "",
  slot_start: "09:00",
  slot_end: "10:00",
  slot_capacity: 1,
}

function SlotsPage() {
  const queryClient = useQueryClient()

  const slotsQuery = useQuery({
    queryKey: ["admin-slots"],
    queryFn: () => getSlotsAdmin(),
  })

  const createSlotMutation = useMutation({
    mutationFn: createSlot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-slots"] })
    },
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createSlotMutation.mutateAsync({ data: value })
      form.reset()
    },
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Slot</CardTitle>
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
            <form.Field name="slot_id">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Slot ID</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="slot_name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Slot Name</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="slot_start">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Start Time</Label>
                  <Input
                    id={field.name}
                    type="time"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="slot_end">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>End Time</Label>
                  <Input
                    id={field.name}
                    type="time"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="slot_capacity">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Capacity</Label>
                  <Input
                    id={field.name}
                    type="number"
                    min={1}
                    step={1}
                    value={Number(field.state.value)}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value || 0))}
                  />
                </div>
              )}
            </form.Field>

            <div className="md:col-span-2 space-y-2">
              <Button type="submit" disabled={createSlotMutation.isPending}>
                {createSlotMutation.isPending ? "Creating slot..." : "Create slot"}
              </Button>
              {createSlotMutation.isError ? (
                <p className="text-sm text-red-600">{createSlotMutation.error.message}</p>
              ) : null}
              {createSlotMutation.isSuccess ? (
                <p className="text-sm text-green-700">{createSlotMutation.data}</p>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {slotsQuery.isPending ? <p>Loading slots...</p> : null}
          {slotsQuery.isError ? <p className="text-sm text-red-600">{slotsQuery.error.message}</p> : null}
          {slotsQuery.data ? (
            <div className="space-y-3">
              {slotsQuery.data.map((slot) => (
                <div key={slot.slot_id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{slot.slot_name}</p>
                  <p>ID: {slot.slot_id}</p>
                  <p>
                    {slot.slot_start} - {slot.slot_end} | Capacity: {slot.slot_capacity}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
