import { createFileRoute } from "@tanstack/react-router"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useForm } from '@tanstack/react-form'

import {
  createBooking,
  getAvailablePackages,
  getBookings,
  getSlots,
} from "@/serverActions/bookingActions"
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


export const Route = createFileRoute ('/booking/booking-form') ({component: Booking})

function Booking(){
    const queryClient = useQueryClient()

    const bookingsQuery = useQuery({
      queryKey: ['bookings'],
      queryFn: () => getBookings(),
    })

    const packagesQuery = useQuery({
      queryKey: ['packages'],
      queryFn: () => getAvailablePackages(),
    })

    const slotsQuery = useQuery({
      queryKey: ['slots'],
      queryFn: () => getSlots(),
    })

    const createBookingMutation = useMutation({
      mutationFn: createBooking,
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: ['bookings'] })
      },
    })

    const form = useForm({
      defaultValues: {
        pax_my_adult: 0,
        pax_my_kid: 0,
        pax_my_senior: 0,
        pax_my_oku: 0,
        pax_non_my_adult: 0,
        pax_non_my_kid: 0,
        pax_non_my_senior: 0,
        pax_non_my_oku: 0,
        pic_name: "",
        pic_email: "",
        pic_hp: "",
        org_address: "",
        org_name: "",
        org_state: "",
        org_type: "A",
        quotation_id: "",
        slot_id: "",
        package_id: "",
      },
      onSubmit: async ({ value }) => {
        await createBookingMutation.mutateAsync({ data: value })
      },
    })

    const paxFields = [
      { name: 'pax_my_adult', label: 'MY Adult' },
      { name: 'pax_my_kid', label: 'MY Kid' },
      { name: 'pax_my_senior', label: 'MY Senior' },
      { name: 'pax_my_oku', label: 'MY OKU' },
      { name: 'pax_non_my_adult', label: 'Non-MY Adult' },
      { name: 'pax_non_my_kid', label: 'Non-MY Kid' },
      { name: 'pax_non_my_senior', label: 'Non-MY Senior' },
      { name: 'pax_non_my_oku', label: 'Non-MY OKU' },
    ] as const

    return (
      <div className="mx-auto max-w-6xl space-y-8 p-6">
        <Card>
          <CardHeader>
            <CardTitle>Create Booking</CardTitle>
            <CardDescription>
              Submit booking details. Final price is calculated server-side from package pricing.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-6"
              onSubmit={(e) => {
                e.preventDefault()
                e.stopPropagation()
                void form.handleSubmit()
              }}
            >
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {paxFields.map((fieldMeta) => (
                  <form.Field
                    key={fieldMeta.name}
                    name={fieldMeta.name}
                  >
                    {(field) => (
                      <div className="space-y-2">
                        <Label htmlFor={field.name}>{fieldMeta.label}</Label>
                        <Input
                          id={field.name}
                          type="number"
                          min={0}
                          step={1}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(Number(e.target.value || 0))}
                        />
                      </div>
                    )}
                  </form.Field>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <form.Field name="pic_name">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Person in Charge Name</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="pic_email">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Person in Charge Email</Label>
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

                <form.Field name="pic_hp">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Phone (E.164 format)</Label>
                      <Input
                        id={field.name}
                        placeholder="+60123456789"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="org_name">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Organization Name</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="org_address">
                  {(field) => (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={field.name}>Organization Address</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="org_state">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Organization State</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="org_type">
                  {(field) => (
                    <div className="space-y-2">
                      <Label htmlFor={field.name}>Organization Type (1 char)</Label>
                      <Input
                        id={field.name}
                        maxLength={1}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="quotation_id">
                  {(field) => (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor={field.name}>Quotation ID (optional UUID)</Label>
                      <Input
                        id={field.name}
                        placeholder="Leave blank to auto-generate"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                      />
                    </div>
                  )}
                </form.Field>

                <form.Field name="package_id">
                  {(field) => (
                    <div className="space-y-2">
                      <Label>Package</Label>
                      <Select value={field.state.value} onValueChange={field.handleChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select package" />
                        </SelectTrigger>
                        <SelectContent>
                          {(packagesQuery.data ?? []).map((pkg) => (
                            <SelectItem key={pkg.package_id} value={pkg.package_id}>
                              {pkg.package_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>

                <form.Field name="slot_id">
                  {(field) => (
                    <div className="space-y-2">
                      <Label>Slot</Label>
                      <Select value={field.state.value} onValueChange={field.handleChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {(slotsQuery.data ?? []).map((slot) => (
                            <SelectItem key={slot.slot_id} value={slot.slot_id}>
                              {slot.slot_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </form.Field>
              </div>

              <Button type="submit" disabled={createBookingMutation.isPending}>
                {createBookingMutation.isPending ? 'Creating booking...' : 'Create booking'}
              </Button>

              {createBookingMutation.isError ? (
                <p className="text-sm text-red-600">{createBookingMutation.error.message}</p>
              ) : null}
              {createBookingMutation.isSuccess ? (
                <p className="text-sm text-green-700">{createBookingMutation.data}</p>
              ) : null}
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Bookings</CardTitle>
            <CardDescription>Recent bookings fetched via TanStack Query + server function.</CardDescription>
          </CardHeader>
          <CardContent>
            {bookingsQuery.isPending ? <p>Loading bookings...</p> : null}
            {bookingsQuery.isError ? <p className="text-red-600">{bookingsQuery.error.message}</p> : null}
            {bookingsQuery.data ? (
              <div className="space-y-3">
                {bookingsQuery.data.map((booking) => (
                  <div key={booking.booking_id} className="rounded-md border p-3 text-sm">
                    <p className="font-medium">{booking.org_name}</p>
                    <p>Package ID: {booking.package_id}</p>
                    <p>Slot ID: {booking.slot_id}</p>
                    <p>Total Price: {booking.booking_price}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    )
}