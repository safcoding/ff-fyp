import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"

import { paxFieldMeta, validateDetails } from "@/lib/utils/booking/booking-form"
import { useBookingDraft } from "@/hooks/useBookingDraft"
import { StepIndicator } from "@/components/booking/StepIndicator"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const Route = createFileRoute("/booking-form/details")({ component: BookingDetailsPage })

function BookingDetailsPage() {
  const navigate = Route.useNavigate()
  const { values, updateField, isHydrated } = useBookingDraft()
  const [error, setError] = useState<string | null>(null)

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
          <CardDescription>Step 3 of 5: Enter visitor and contact details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <StepIndicator step={3} />

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault()
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

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {paxFieldMeta.map((fieldMeta) => (
                <div key={fieldMeta.name} className="space-y-2">
                  <Label htmlFor={fieldMeta.name}>{fieldMeta.label}</Label>
                  <Input
                    id={fieldMeta.name}
                    type="number"
                    min={0}
                    step={1}
                    value={Number(values[fieldMeta.name])}
                    onChange={(e) => updateField(fieldMeta.name, Number(e.target.value || 0))}
                  />
                </div>
              ))}
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
                <Input id="org_state" value={values.org_state} onChange={(e) => updateField("org_state", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org_type">Organization Type</Label>
                <Input
                  id="org_type"
                  maxLength={20}
                  value={values.org_type}
                  onChange={(e) => updateField("org_type", e.target.value.toUpperCase())}
                />
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
