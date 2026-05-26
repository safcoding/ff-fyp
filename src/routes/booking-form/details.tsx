import { createFileRoute } from "@tanstack/react-router"
import { useMemo, useState } from "react"

import { validateDetails } from "@/lib/utils/booking/booking-form"
import { useBookingDraft } from "@/hooks/useBookingDraft"
import { StepIndicator } from "@/components/booking/StepIndicator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { org_categories, states } from "@/generated/prisma/enums"

export const Route = createFileRoute("/booking-form/details")({ component: BookingDetailsPage })

function BookingDetailsPage() {
  const navigate = Route.useNavigate()
  const { values, updateField, isHydrated } = useBookingDraft()
  const [error, setError] = useState<string | null>(null)

  const stateOptions = useMemo(() => Object.values(states), [])
  const orgTypeOptions = useMemo(() => Object.values(org_categories), [])

  const formatEnumLabel = (value: string) =>
    value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase())

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <p>Loading saved booking draft...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Wizard</CardTitle>
          <CardDescription>Step 3 of 5: Enter contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator step={3} />

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()

              if (values.packages.length === 0) {
                setError("Please select at least one package before entering details.")
                return
              }

              const message = validateDetails(values)
              if (message) {
                setError(message)
                return
              }
              setError(null)
              void navigate({ to: "/booking-form/addons-foods" })
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">Enter visitors and contact details.</p>
              <Button type="button" variant="outline" onClick={() => void navigate({ to: "/booking-form/package" })}>
                Back to packages
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pic_name">Person in Charge Name</Label>
                <Input id="pic_name" value={values.pic_name} onChange={(e) => updateField("pic_name", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pic_email">Person in Charge Email</Label>
                <Input
                  id="pic_email"
                  type="email"
                  required
                  value={values.pic_email}
                  onChange={(e) => updateField("pic_email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pic_hp">Phone (E.164 format)</Label>
                <Input
                  id="pic_hp"
                  placeholder="+60123456789"
                  pattern="\+?[1-9][0-9]{7,14}"
                  title="Use E.164 format, for example +60123456789"
                  required
                  value={values.pic_hp}
                  onChange={(e) => updateField("pic_hp", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org_name">Organization Name</Label>
                <Input id="org_name" value={values.org_name} onChange={(e) => updateField("org_name", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="event_name">Event Name</Label>
                <Input id="event_name" value={values.event_name} onChange={(e) => updateField("event_name", e.target.value)} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="org_address">Organization Address</Label>
                <Input
                  id="org_address"
                  value={values.org_address}
                  onChange={(e) => updateField("org_address", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org_state">Organization State</Label>
                <Select value={values.org_state} onValueChange={(value) => updateField("org_state", value)}>
                  <SelectTrigger className="w-full" id="org_state">
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {stateOptions.map((state) => (
                      <SelectItem key={state} value={state}>
                        {formatEnumLabel(state)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="org_type">Organization Type</Label>
                <Select value={values.org_type} onValueChange={(value) => updateField("org_type", value)}>
                  <SelectTrigger className="w-full" id="org_type">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    {orgTypeOptions.map((orgType) => (
                      <SelectItem key={orgType} value={orgType}>
                        {formatEnumLabel(orgType)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit">Next: Add-ons and foods</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
