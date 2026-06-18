import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from "@tanstack/react-form"
import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { AdminItemRow, AdminListSkeleton, AdminPageHeader, AdminSectionCard, AdminStatPill, AdminStatusBadge } from "@/components/admin/AdminPageShell"
import { Button } from "@/components/ui/button"
import { DeleteDialog } from "@/components/deleteDialog"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { getActivities, createActivity, updateActivity, deleteActivity } from "@/features/activities/server/activityActions"

export const Route = createFileRoute("/admin/activities")({ component: ActivityPage })

type ActivityForm = {
  activity_name: string
  activity_desc: string
  is_active: boolean
}

const defaultValues: ActivityForm = {
  activity_name: "",
  activity_desc: "",
  is_active: true,
}

function ActivityPage() {
  const queryClient = useQueryClient()
  const [editingActivity, setEditingActivity] = useState<(ActivityForm & { activity_id: number }) | null>(null)
  const [editValues, setEditValues] = useState<ActivityForm>(defaultValues)
  const [deletingActivity, setDeletingActivity] = useState<{ activity_id: number; activity_name: string } | null>(null)

  const activitiesQuery = useQuery({
    queryKey: ["admin-activity"],
    queryFn: () => getActivities(),
  })

  const createActivityMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-activity"] })
    },
  })

  const updateActivityMutation = useMutation({
    mutationFn: updateActivity,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-activity"] })
      setEditingActivity(null)
    },
  })

  const deleteActivityMutation = useMutation({
    mutationFn: deleteActivity,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-activity"] })
      setDeletingActivity(null)
    },
  })

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createActivityMutation.mutateAsync({ data: value })
      form.reset()
    },
  })

  function openEditModal(data: { activity_id: number } & ActivityForm) {
    setEditingActivity(data)
    setEditValues({
      activity_name: data.activity_name,
      activity_desc: data.activity_desc,
      is_active: data.is_active,
    })
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Activities"
        description="Manage on-farm activities offered in tour packages."
        meta={<AdminStatPill label="Total" value={activitiesQuery.data?.length ?? 0} />}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)]">
      <AdminSectionCard title="Create Activity" description="Add experiences that can be linked to packages.">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              e.stopPropagation()
              void form.handleSubmit()
            }}
          >
            <form.Field 
            name="activity_name"
            validators={{
              onBlur: ({ value }) =>
                value.trim().length < 1 ? 'Name Required' : undefined,
            }} 
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Activity Name</Label>
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
            name="activity_desc"
            validators={{
              onBlur: ({ value }) =>
                value.trim().length < 1 ? 'Description Required' : undefined,
            }}            
            >
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Activity Description</Label>
                  <Textarea
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

            <form.Field name="is_active">
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
              <Button type="submit" disabled={createActivityMutation.isPending}>
                {createActivityMutation.isPending ? "Creating activity..." : "Create activity"}
              </Button>
              {createActivityMutation.isError ? (
                <p className="text-sm text-red-600">{createActivityMutation.error.message}</p>
              ) : null}
              {createActivityMutation.isSuccess ? (
                <p className="text-sm text-green-700">{createActivityMutation.data}</p>
              ) : null}
            </div>
          </form>
      </AdminSectionCard>

      <AdminSectionCard title="Existing Activities" description="Check current activity descriptions and visibility.">
          {activitiesQuery.isPending ? <AdminListSkeleton rows={4} /> : null}
          {activitiesQuery.isError ? <p className="text-sm text-red-600">{activitiesQuery.error.message}</p> : null}
          {activitiesQuery.data ? (
            <div className="grid gap-3">
              {activitiesQuery.data.map((activity) => (
                <AdminItemRow key={activity.activity_id}>
                  <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-stone-900">{activity.activity_name}</p>
                        <AdminStatusBadge active={activity.is_active} activeLabel="Active" inactiveLabel="Hidden" />
                      </div>
                      <p className="leading-6 text-stone-600">{activity.activity_desc}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:flex">
                      <Button type="button" variant="outline" size="sm" onClick={() => openEditModal(activity)}>
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingActivity({ activity_id: activity.activity_id, activity_name: activity.activity_name })}
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
        open={Boolean(editingActivity)}
        title="Edit Activity"
        description="Update activity details."
        onClose={() => setEditingActivity(null)}
      >
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault()
            if (!editingActivity) {
              return
            }
            void updateActivityMutation.mutateAsync({
              data: {
                activity_id: editingActivity.activity_id,
                ...editValues,
              },
            })
          }}
        >
          <div className="space-y-2">
            <Label htmlFor="edit-activity-name">Activity Name</Label>
            <Input
              id="edit-activity-name"
              value={editValues.activity_name}
              onChange={(e) => setEditValues((prev) => ({ ...prev, activity_name: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-activity-desc">Activity Description</Label>
            <Textarea
              id="edit-activity-desc"
              value={editValues.activity_desc}
              onChange={(e) => setEditValues((prev) => ({ ...prev, activity_desc: e.target.value }))}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Available</Label>
            <div className="flex h-10 items-center">
              <Switch
                checked={editValues.is_active}
                onCheckedChange={(checked) => setEditValues((prev) => ({ ...prev, is_active: checked }))}
              />
            </div>
          </div>

          <div className="space-y-2 md:col-span-2">
            <div className="flex gap-2">
              <Button type="submit" disabled={updateActivityMutation.isPending}>
                {updateActivityMutation.isPending ? "Saving..." : "Save changes"}
              </Button>
              <Button type="button" variant="outline" onClick={() => setEditingActivity(null)}>
                Cancel
              </Button>
            </div>
            {updateActivityMutation.isError ? (
              <p className="text-sm text-red-600">{updateActivityMutation.error.message}</p>
            ) : null}
            {updateActivityMutation.isSuccess ? (
              <p className="text-sm text-green-700">{updateActivityMutation.data}</p>
            ) : null}
          </div>
        </form>
      </Modal>

      <DeleteDialog
        open={Boolean(deletingActivity)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingActivity(null)
          }
        }}
        onConfirm={() => {
          if (!deletingActivity) {
            return
          }
          void deleteActivityMutation.mutateAsync({ data: { activity_id: deletingActivity.activity_id } })
        }}
        pending={deleteActivityMutation.isPending}
        title="Remove Activity"
        description={`This will permanently remove ${deletingActivity?.activity_name ?? "this activity"}.`}
        confirmLabel="Confirm remove"
      />

      {deleteActivityMutation.isError ? (
        <p className="text-sm text-red-600">{deleteActivityMutation.error.message}</p>
      ) : null}
      {deleteActivityMutation.isSuccess ? (
        <p className="text-sm text-green-700">{deleteActivityMutation.data}</p>
      ) : null}
      </div>
    </div>
  )
}
