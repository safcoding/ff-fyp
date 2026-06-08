import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'
import { useState } from 'react'

import { requireAdminRoute } from '@/lib/admin-route-guard'
import { AdminItemRow, AdminPageHeader, AdminSectionCard, AdminStatPill } from '@/components/admin/AdminPageShell'
import { Button } from '@/components/ui/button'
import { DeleteDialog } from '@/components/deleteDialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createBlock, deleteBlock, getBlocks } from '@/features/blocks/server/blockActions'
import { getSlotsAdmin } from '@/features/slot/server/slotActions'

export const Route = createFileRoute('/admin/blocks')({
  beforeLoad: requireAdminRoute,
  component: BlocksPage,
})

type BlockForm = {
  block_date: string
  slot_id: string
  reason: string
}

const defaultValues: BlockForm = {
  block_date: '',
  slot_id: 'all',
  reason: '',
}

function BlocksPage() {
  const queryClient = useQueryClient()
  const [deletingBlock, setDeletingBlock] = useState<{ id: number; label: string } | null>(null)

  const blocksQuery = useQuery({
    queryKey: ['admin-blocks'],
    queryFn: () => getBlocks(),
  })

  const slotsQuery = useQuery({
    queryKey: ['admin-slots'],
    queryFn: () => getSlotsAdmin(),
  })

  const createBlockMutation = useMutation({
    mutationFn: createBlock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-blocks'] })
    },
  })

  const deleteBlockMutation = useMutation({
    mutationFn: deleteBlock,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-blocks'] })
      setDeletingBlock(null)
    },
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createBlockMutation.mutateAsync({
        data: {
          block_date: value.block_date,
          slot_id: value.slot_id === 'all' ? null : value.slot_id,
          reason: value.reason || null,
        },
      })
      form.reset()
    },
  })

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Date Blocks"
        description="Block out dates when the farm is unavailable for bookings."
        meta={<AdminStatPill label="Blocks" value={blocksQuery.data?.length ?? 0} />}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
      <AdminSectionCard title="Create Block" description="Reserve a whole day or a specific slot from public booking.">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field
              name="block_date"
              validators={{
                onBlur: ({ value }) =>
                  value.length < 1 ? 'Date is required' : undefined,
              }}
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Block date</Label>
                  <Input
                    id={field.name}
                    type="date"
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

            <form.Field name="slot_id">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Slot</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value)}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Whole day" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Whole day</SelectItem>
                      {slotsQuery.data?.map((slot) => (
                        <SelectItem key={slot.slot_id} value={slot.slot_id}>
                          {slot.slot_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="reason">
              {(field) => (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={field.name}>Reason (optional)</Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <div className="space-y-2 md:col-span-2">
              <Button type="submit" disabled={createBlockMutation.isPending}>
                {createBlockMutation.isPending ? 'Creating block...' : 'Create block'}
              </Button>
              {createBlockMutation.isError ? (
                <p className="text-sm text-red-600">{createBlockMutation.error.message}</p>
              ) : null}
              {createBlockMutation.isSuccess ? (
                <p className="text-sm text-green-700">{createBlockMutation.data}</p>
              ) : null}
            </div>
          </form>
      </AdminSectionCard>

      <AdminSectionCard title="Existing Blocks" description="Upcoming blocked dates and slot-specific closures.">
          {blocksQuery.isPending ? <p>Loading blocks...</p> : null}
          {blocksQuery.isError ? (
            <p className="text-sm text-red-600">{blocksQuery.error.message}</p>
          ) : null}
          {blocksQuery.data ? (
            <div className="grid gap-3">
              {blocksQuery.data.map((block) => (
                <AdminItemRow key={block.id} className="border-rose-100 bg-rose-50/50">
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                    <div className="space-y-1">
                      <p className="font-semibold text-stone-900">{block.block_date}</p>
                      <p className="text-stone-600">Slot: {block.slot_name ?? 'Whole day'}</p>
                      <p className="leading-6 text-stone-500">Reason: {block.reason ?? '-'}</p>
                    </div>
                    <div className="grid gap-2 sm:flex">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() =>
                          setDeletingBlock({
                            id: block.id,
                            label: `${block.block_date} ${block.slot_name ?? 'Whole day'}`,
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

      <DeleteDialog
        open={Boolean(deletingBlock)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingBlock(null)
          }
        }}
        onConfirm={() => {
          if (!deletingBlock) {
            return
          }
          void deleteBlockMutation.mutateAsync({ data: { id: deletingBlock.id } })
        }}
        pending={deleteBlockMutation.isPending}
        title="Remove block"
        description={`This will remove the block for ${deletingBlock?.label ?? 'this date'}.`}
        confirmLabel="Confirm remove"
      />

      {deleteBlockMutation.isError ? (
        <p className="text-sm text-red-600">{deleteBlockMutation.error.message}</p>
      ) : null}
      {deleteBlockMutation.isSuccess ? (
        <p className="text-sm text-green-700">{deleteBlockMutation.data}</p>
      ) : null}
      </div>
    </div>
  )
}
