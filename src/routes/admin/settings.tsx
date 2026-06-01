import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from '@tanstack/react-form'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getSettings, updateSettings } from '@/features/settings/server/settingsActions'

export const Route = createFileRoute('/admin/settings')({ component: SettingsPage })

type SettingsForm = {
  min_lead_days: number
  company_name: string
  company_address: string
  company_phone: string
  company_email: string
  sst_registration: string
}

function SettingsPage() {
  const queryClient = useQueryClient()

  const settingsQuery = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => getSettings(),
  })

  const updateMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
    },
  })

  const form = useForm<SettingsForm>({
    defaultValues: {
      min_lead_days: settingsQuery.data?.min_lead_days ?? 14,
      company_name: settingsQuery.data?.company_name ?? '',
      company_address: settingsQuery.data?.company_address ?? '',
      company_phone: settingsQuery.data?.company_phone ?? '',
      company_email: settingsQuery.data?.company_email ?? '',
      sst_registration: settingsQuery.data?.sst_registration ?? '',
    },
    onSubmit: async ({ value }) => {
      await updateMutation.mutateAsync({
        data: {
          min_lead_days: value.min_lead_days,
          company_name: value.company_name,
          company_address: value.company_address,
          company_phone: value.company_phone,
          company_email: value.company_email,
          sst_registration: value.sst_registration,
        },
      })
    },
  })

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Global Settings</CardTitle>
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
            <form.Field name="min_lead_days">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Minimum lead days</Label>
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

            <form.Field name="company_name">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Company name</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="company_phone">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Company phone</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="company_email">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>Company email</Label>
                  <Input
                    id={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="sst_registration">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>SST registration</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="company_address">
              {(field) => (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor={field.name}>Company address</Label>
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
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Saving...' : 'Save settings'}
              </Button>
              {updateMutation.isError ? (
                <p className="text-sm text-red-600">{updateMutation.error.message}</p>
              ) : null}
              {updateMutation.isSuccess ? (
                <p className="text-sm text-green-700">{updateMutation.data}</p>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
