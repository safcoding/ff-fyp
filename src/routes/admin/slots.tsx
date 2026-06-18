import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

import { AdminItemRow, AdminListSkeleton, AdminPageHeader, AdminSectionCard, AdminStatPill } from '@/components/admin/AdminPageShell'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/deleteDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createSlot,
  deleteSlot,
  getSlotsAdmin,
  updateSlot,
} from '@/features/slot/server/slotActions'
import { slot_types } from '@/generated/prisma/enums'

export const Route = createFileRoute('/admin/slots')({ component: SlotsPage })

type SlotForm = {
  slot_id: string
  slot_name: string
  slot_start: string
  slot_end: string
  slot_capacity: number
  slot_type: slot_types | ''
  weekday_start: string
  weekday_end: string
  weekend_start: string
  weekend_end: string
}

const defaultValues: SlotForm = {
  slot_id: '',
  slot_name: '',
  slot_start: '09:00',
  slot_end: '10:00',
  slot_capacity: 1,
  slot_type: '',
  weekday_start: '10:00',
  weekday_end: '12:00',
  weekend_start: '09:00',
  weekend_end: '11:00',
}

const slotTypeOptions = Object.values(slot_types)

function SlotsPage() {
  const queryClient = useQueryClient()
  const [editingSlot, setEditingSlot] = useState<
    (SlotForm & { slot_id: string }) | null
  >(null)
  const [editValues, setEditValues] = useState<SlotForm>(defaultValues)
  const [createSlotType, setCreateSlotType] = useState<slot_types | ''>(
    defaultValues.slot_type,
  )
  const [deletingSlot, setDeletingSlot] = useState<{
    slot_id: string
    slot_name: string
  } | null>(null)

  const slotsQuery = useQuery({
    queryKey: ['admin-slots'],
    queryFn: () => getSlotsAdmin(),
  })

  const createSlotMutation = useMutation({
    mutationFn: createSlot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-slots'] })
    },
  })

  const updateSlotMutation = useMutation({
    mutationFn: updateSlot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-slots'] })
      setEditingSlot(null)
    },
  })

  const deleteSlotMutation = useMutation({
    mutationFn: deleteSlot,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-slots'] })
      setDeletingSlot(null)
    },
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (!value.slot_type) {
        return
      }
      await createSlotMutation.mutateAsync({
        data: { ...value, slot_type: value.slot_type },
      })
      form.reset()
      setCreateSlotType(defaultValues.slot_type)
    },
  })

  function openEditModal(pkg: {
    slot_id: string
    slot_name: string
    slot_start: string
    slot_end: string
    slot_capacity: number
    slot_type: slot_types | null
    weekday_start: string
    weekday_end: string
    weekend_start: string
    weekend_end: string
  }) {
    const normalized: SlotForm = {
      slot_id: pkg.slot_id,
      slot_name: pkg.slot_name,
      slot_start: pkg.slot_start,
      slot_end: pkg.slot_end,
      slot_capacity: pkg.slot_capacity,
      slot_type: pkg.slot_type ?? '',
      weekday_start: pkg.weekday_start || defaultValues.weekday_start,
      weekday_end: pkg.weekday_end || defaultValues.weekday_end,
      weekend_start: pkg.weekend_start || defaultValues.weekend_start,
      weekend_end: pkg.weekend_end || defaultValues.weekend_end,
    }

    setEditingSlot(normalized)
    setEditValues({
      slot_id: normalized.slot_id,
      slot_name: normalized.slot_name,
      slot_start: normalized.slot_start,
      slot_end: normalized.slot_end,
      slot_capacity: normalized.slot_capacity,
      slot_type: normalized.slot_type,
      weekday_start: normalized.weekday_start,
      weekday_end: normalized.weekday_end,
      weekend_start: normalized.weekend_start,
      weekend_end: normalized.weekend_end,
    })
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Slots"
        description="Configure available time slots and tour schedules."
        meta={<AdminStatPill label="Slots" value={slotsQuery.data?.length ?? 0} />}
      />
      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.85fr)]">
      <AdminSectionCard title="Create Slot" description="Set guided or unguided visit windows with capacity.">
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
              name="slot_type"
              validators={{
                onBlur: ({ value }) =>
                  value.length < 1 ? 'Slot Type Required' : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Slot Type</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => {
                      setCreateSlotType(value as slot_types)
                      field.handleChange(value as slot_types)
                    }}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select slot type" />
                    </SelectTrigger>
                    <SelectContent>
                      {slotTypeOptions.map((slotType) => (
                        <SelectItem key={slotType} value={slotType}>
                          {slotType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!field.state.meta.isValid && (
                    <em role="alert">{field.state.meta.errors.join(', ')}</em>
                  )}
                </div>
              )}
            </form.Field>

            {createSlotType === 'GUIDED' ? (
              <>
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
                        <em role="alert">
                          {field.state.meta.errors.join(', ')}
                        </em>
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
                        <em role="alert">
                          {field.state.meta.errors.join(', ')}
                        </em>
                      )}
                    </div>
                  )}
                </form.Field>
              </>
            ) : null}

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
                    onChange={(e) =>
                      field.handleChange(Number(e.target.value || 0))
                    }
                  />
                  {!field.state.meta.isValid && (
                    <em role="alert">{field.state.meta.errors.join(', ')}</em>
                  )}
                </div>
              )}
            </form.Field>

            {createSlotType === 'UNGUIDED' ? (
              <>
                <div className="md:col-span-2 border-t pt-4">
                  <p className="text-sm font-medium">Visiting Times</p>
                </div>

                <form.Field name="weekday_start">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Weekday Start Time</Label>
                      <Input
                        id={field.name}
                        type="time"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {!field.state.meta.isValid && (
                        <em role="alert">
                          {field.state.meta.errors.join(', ')}
                        </em>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="weekday_end">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Weekday End Time</Label>
                      <Input
                        id={field.name}
                        type="time"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {!field.state.meta.isValid && (
                        <em role="alert">
                          {field.state.meta.errors.join(', ')}
                        </em>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="weekend_start">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Weekend Start Time</Label>
                      <Input
                        id={field.name}
                        type="time"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {!field.state.meta.isValid && (
                        <em role="alert">
                          {field.state.meta.errors.join(', ')}
                        </em>
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="weekend_end">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Weekend End Time</Label>
                      <Input
                        id={field.name}
                        type="time"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                      {!field.state.meta.isValid && (
                        <em role="alert">
                          {field.state.meta.errors.join(', ')}
                        </em>
                      )}
                    </div>
                  )}
                </form.Field>
              </>
            ) : null}

            <div className="md:col-span-2 space-y-2">
              <Button type="submit" disabled={createSlotMutation.isPending}>
                {createSlotMutation.isPending
                  ? 'Creating slot...'
                  : 'Create slot'}
              </Button>
              {createSlotMutation.isError ? (
                <p className="text-sm text-red-600">
                  {createSlotMutation.error.message}
                </p>
              ) : null}
              {createSlotMutation.isSuccess ? (
                <p className="text-sm text-green-700">
                  {createSlotMutation.data}
                </p>
              ) : null}
            </div>
          </form>
      </AdminSectionCard>

      <AdminSectionCard title="Existing Slots" description="Review tour timing, slot type, and capacity.">
          {slotsQuery.isPending ? <AdminListSkeleton rows={4} /> : null}
          {slotsQuery.isError ? (
            <p className="text-sm text-red-600">{slotsQuery.error.message}</p>
          ) : null}
          {slotsQuery.data ? (
            <div className="grid gap-3">
              {slotsQuery.data.map((slot) => (
                <AdminItemRow key={slot.slot_id}>
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-stone-900">{slot.slot_name}</p>
                        <span className="rounded-full border border-[#445412]/10 bg-white px-2.5 py-1 text-xs font-semibold text-[#445412]">
                          {slot.slot_type}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-stone-500">ID: {slot.slot_id}</p>
                      {slot.slot_type === 'UNGUIDED' ? (
                        <p className="leading-6 text-stone-600">
                          Weekday: {slot.weekday_start} - {slot.weekday_end} |
                          Weekend: {slot.weekend_start} - {slot.weekend_end}
                        </p>
                      ) : (
                        <p className="leading-6 text-stone-600">
                          {slot.slot_start} - {slot.slot_end} | Capacity:{' '}
                          {slot.slot_capacity}
                        </p>
                      )}
                      {slot.slot_type === 'UNGUIDED' ? (
                        <p className="text-stone-600">Capacity: {slot.slot_capacity}</p>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openEditModal(slot)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setDeletingSlot({
                            slot_id: slot.slot_id,
                            slot_name: slot.slot_name,
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </AdminItemRow>
              ))}
            </div>
          ) : null}
      </AdminSectionCard>

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
            if (!editValues.slot_type) {
              return
            }
            void updateSlotMutation.mutateAsync({
              data: { ...editValues, slot_type: editValues.slot_type },
            })
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
              onChange={(e) =>
                setEditValues((prev) => ({
                  ...prev,
                  slot_name: e.target.value,
                }))
              }
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
              onChange={(e) =>
                setEditValues((prev) => ({
                  ...prev,
                  slot_capacity: Number(e.target.value || 0),
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-slot-type">Slot Type</Label>
            <Select
              value={editValues.slot_type}
              onValueChange={(value) =>
                setEditValues((prev) => ({
                  ...prev,
                  slot_type: value as slot_types,
                }))
              }
            >
              <SelectTrigger id="edit-slot-type">
                <SelectValue placeholder="Select slot type" />
              </SelectTrigger>
              <SelectContent>
                {slotTypeOptions.map((slotType) => (
                  <SelectItem key={slotType} value={slotType}>
                    {slotType}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {editValues.slot_type === 'GUIDED' ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="edit-slot-start">Start Time</Label>
                <Input
                  id="edit-slot-start"
                  type="time"
                  value={editValues.slot_start}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      slot_start: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-slot-end">End Time</Label>
                <Input
                  id="edit-slot-end"
                  type="time"
                  value={editValues.slot_end}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      slot_end: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          ) : null}

          {editValues.slot_type === 'UNGUIDED' ? (
            <>
              <div className="md:col-span-2 border-t pt-4">
                <p className="text-sm font-medium">Visiting Times</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-weekday-start">Weekday Start Time</Label>
                <Input
                  id="edit-weekday-start"
                  type="time"
                  value={editValues.weekday_start}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      weekday_start: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-weekday-end">Weekday End Time</Label>
                <Input
                  id="edit-weekday-end"
                  type="time"
                  value={editValues.weekday_end}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      weekday_end: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-weekend-start">Weekend Start Time</Label>
                <Input
                  id="edit-weekend-start"
                  type="time"
                  value={editValues.weekend_start}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      weekend_start: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-weekend-end">Weekend End Time</Label>
                <Input
                  id="edit-weekend-end"
                  type="time"
                  value={editValues.weekend_end}
                  onChange={(e) =>
                    setEditValues((prev) => ({
                      ...prev,
                      weekend_end: e.target.value,
                    }))
                  }
                />
              </div>
            </>
          ) : null}

          <div className="md:col-span-2 space-y-2">
            <div className="flex gap-2">
              <Button type="submit" disabled={updateSlotMutation.isPending}>
                {updateSlotMutation.isPending ? 'Saving...' : 'Save changes'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingSlot(null)}
              >
                Cancel
              </Button>
            </div>
            {updateSlotMutation.isError ? (
              <p className="text-sm text-red-600">
                {updateSlotMutation.error.message}
              </p>
            ) : null}
            {updateSlotMutation.isSuccess ? (
              <p className="text-sm text-green-700">
                {updateSlotMutation.data}
              </p>
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
          void deleteSlotMutation.mutateAsync({
            data: { slot_id: deletingSlot.slot_id },
          })
        }}
        pending={deleteSlotMutation.isPending}
        title="Remove Slot"
        description={`This will permanently remove ${deletingSlot?.slot_name ?? 'this slot'}.`}
        confirmLabel="Confirm remove"
      />

      {deleteSlotMutation.isError ? (
        <p className="text-sm text-red-600">
          {deleteSlotMutation.error.message}
        </p>
      ) : null}
      {deleteSlotMutation.isSuccess ? (
        <p className="text-sm text-green-700">{deleteSlotMutation.data}</p>
      ) : null}
      </div>
    </div>
  )
}
