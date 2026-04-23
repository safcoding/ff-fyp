import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/deleteDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { createSlot, deleteSlot, getSlotsAdmin, updateSlot } from "@/serverActions/slotActions"

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
  const [editingSlot, setEditingSlot] = useState<(SlotForm & { slot_id: string }) | null>(null)
  const [editValues, setEditValues] = useState<SlotForm>(defaultValues)
  const [deletingSlot, setDeletingSlot] = useState<{ slot_id: string; slot_name: string } | null>(null)

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

  const updateSlotMutation = useMutation({
    mutationFn: updateSlot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-slots"] })
      setEditingSlot(null)
    },
  })

  const deleteSlotMutation = useMutation({
    mutationFn: deleteSlot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-slots"] })
      setDeletingSlot(null)
    },
  })
      

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createSlotMutation.mutateAsync({ data: value })
      form.reset()
    },
  })

  function openEditModal(pkg: { slot_id: string } & SlotForm) {
    setEditingSlot(pkg)
    setEditValues({
      slot_id: pkg.slot_id,
      slot_name: pkg.slot_name,
      slot_start: pkg.slot_start,
      slot_end: pkg.slot_end,
      slot_capacity: pkg.slot_capacity,
    })
  }

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
            <form.Field 
            name="slot_id"
            validators={{
              onBlur: ({ value }) =>
                value.length < 1 ? 'Slot ID Required' : undefined,
            }}
            
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Slot ID</Label>
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
            name="slot_name"
            validators={{
              onBlur: ({ value }) =>
                value.length < 1 ? 'Slot Name Required' : undefined,
            }}            
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Slot Name</Label>
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
            name="slot_start"
            validators={{
              onBlur: ({ value }) =>
                value.length < 1 ? 'Start Time Required' : undefined,
            }}         
            >
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
                  {!field.state.meta.isValid && (
                    <em role="alert">{field.state.meta.errors.join(', ')}</em>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field 
            name="slot_end"
            validators={{
              onBlur: ({ value }) =>
                value.length < 1 ? 'Slot End Time Required' : undefined,
            }}
            >
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
                  {!field.state.meta.isValid && (
                    <em role="alert">{field.state.meta.errors.join(', ')}</em>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field 
            name="slot_capacity"
            validators={{
              onBlur: ({ value }) =>
                value < 1 ? 'At least 1 capacity Needed' : undefined,
            }}
            >
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
                  {!field.state.meta.isValid && (
                    <em role="alert">{field.state.meta.errors.join(', ')}</em>
                  )}
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
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">{slot.slot_name}</p>
                      <p>ID: {slot.slot_id}</p>
                      <p>
                        {slot.slot_start} - {slot.slot_end} | Capacity: {slot.slot_capacity}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditModal(slot)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingSlot({ slot_id: slot.slot_id, slot_name: slot.slot_name })}
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
        open={Boolean(editingSlot)}
        title="Edit Slot"
        description="Update slot details."
        onClose={() => setEditingSlot(null)}
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!editingSlot) {
              return
            }
            void updateSlotMutation.mutateAsync({ data: editValues })
          }}
        >
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="edit-slot-id">Slot ID</Label>
            <Input id="edit-slot-id" value={editValues.slot_id} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-slot-name">Slot Name</Label>
            <Input
              id="edit-slot-name"
              value={editValues.slot_name}
              onChange={(e) => setEditValues((prev) => ({ ...prev, slot_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-slot-capacity">Capacity</Label>
            <Input
              id="edit-slot-capacity"
              type="number"
              min={1}
              step={1}
              value={Number(editValues.slot_capacity)}
              onChange={(e) => setEditValues((prev) => ({ ...prev, slot_capacity: Number(e.target.value || 0) }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-slot-start">Start Time</Label>
            <Input
              id="edit-slot-start"
              type="time"
              value={editValues.slot_start}
              onChange={(e) => setEditValues((prev) => ({ ...prev, slot_start: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-slot-end">End Time</Label>
            <Input
              id="edit-slot-end"
              type="time"
              value={editValues.slot_end}
              onChange={(e) => setEditValues((prev) => ({ ...prev, slot_end: e.target.value }))}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <div className="flex gap-2">
              <Button type="submit" disabled={updateSlotMutation.isPending}>
                {updateSlotMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingSlot(null)}>
                Cancel
              </Button>
            </div>
            {updateSlotMutation.isError ? (
              <p className="text-sm text-red-600">{updateSlotMutation.error.message}</p>
            ) : null}
            {updateSlotMutation.isSuccess ? (
              <p className="text-sm text-green-700">{updateSlotMutation.data}</p>
            ) : null}
          </div>
        </form>
      </Modal>

      <DeleteDialog
        open={Boolean(deletingSlot)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingSlot(null)
          }
        }}
        onConfirm={() => {
          if (!deletingSlot) {
            return
          }
          void deleteSlotMutation.mutateAsync({ data: { slot_id: deletingSlot.slot_id } })
        }}
        pending={deleteSlotMutation.isPending}
        title="Remove Slot"
        description={`This will permanently remove ${deletingSlot?.slot_name ?? "this slot"}.`}
        confirmLabel="Confirm remove"
      />

      {deleteSlotMutation.isError ? (
        <p className="text-sm text-red-600">{deleteSlotMutation.error.message}</p>
      ) : null}
      {deleteSlotMutation.isSuccess ? (
        <p className="text-sm text-green-700">{deleteSlotMutation.data}</p>
      ) : null}
    </div>
  )
}