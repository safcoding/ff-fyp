import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import {
  approveBooking as approveBookingAction,
  deleteBooking as deleteBookingAction,
  getBookingById,
  getBookings,
  sendTestBookingEmail,
} from '@/features/booking/server/bookingActions'
import { getDiscounts } from '@/features/discount/server/discountActions'
import { buildQuotationPdfBlob } from '@/components/booking/QuotationPdf'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DeleteDialog } from '@/components/deleteDialog'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/admin/bookings')({
  component: BookingPage,
})

function BookingPage() {
  const queryClient = useQueryClient()
  const [expandedBookingId, setExpandedBookingId] = useState<string | null>(
    null,
  )
  const [deletingBooking, setDeletingBooking] = useState<{
    booking_id: string
    pic_name: string
  } | null>(null)
  const [approvingBooking, setApprovingBooking] = useState<{
    booking_id: string
    pic_name: string
  } | null>(null)
  const [approvalDiscountId, setApprovalDiscountId] = useState('')

  const bookingQuery = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: getBookings,
  })

  const discountsQuery = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: () => getDiscounts(),
  })

  const deleteBookingMutation = useMutation({
    mutationFn: deleteBookingAction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      setDeletingBooking(null)
    },
  })

  const approveBookingMutation = useMutation({
    mutationFn: approveBookingAction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      setApprovingBooking(null)
    },
  })

  const testEmailMutation = useMutation({
    mutationFn: sendTestBookingEmail,
  })

  const quotationMutation = useMutation({
    mutationFn: getBookingById,
    onSuccess: async (booking) => {
      const blob = await buildQuotationPdfBlob(booking)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `quotation-${booking.booking_id}.pdf`
      link.click()
      URL.revokeObjectURL(url)
    },
  })

  function toggleExpanded(bookingId: string) {
    setExpandedBookingId((prev) => (prev === bookingId ? null : bookingId))
  }

  function confirmDelete() {
    if (!deletingBooking) {
      return
    }

    deleteBookingMutation.mutate({
      data: { booking_id: deletingBooking.booking_id },
    })
  }

  function confirmApprove() {
    if (!approvingBooking) {
      return
    }

    approveBookingMutation.mutate({
      data: {
        booking_id: approvingBooking.booking_id,
        discount_id: approvalDiscountId || undefined,
      },
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Bookings list</CardTitle>
        </CardHeader>
        <CardContent>
          {bookingQuery.isPending ? <p>Loading bookings...</p> : null}
          {bookingQuery.isError ? (
            <p className="text-sm text-red-600">{bookingQuery.error.message}</p>
          ) : null}
          {bookingQuery.data ? (
            <div className="space-y-3">
              {bookingQuery.data.map((booking) => {
                const isExpanded = expandedBookingId === booking.booking_id
                const isPending =
                  (booking.booking_status ?? '').toUpperCase() === 'PENDING'

                return (
                  <div
                    key={booking.booking_id}
                    className="rounded-md border p-3 text-sm transition-colors hover:bg-muted/40 cursor-pointer"
                    onClick={() => toggleExpanded(booking.booking_id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        toggleExpanded(booking.booking_id)
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <p className="font-medium">PIC: {booking.pic_name}</p>
                        <p>
                          Booking Date:{' '}
                          {booking.booking_date
                            ? new Date(booking.booking_date).toDateString()
                            : '-'}
                        </p>
                        <p>Package: {booking.package_id}</p>
                        <p>Status: {booking.booking_status}</p>
                      </div>
                      <div
                        className="flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button type="button" variant="outline" size="sm">
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setDeletingBooking({
                              booking_id: booking.booking_id,
                              pic_name: booking.pic_name,
                            })
                          }
                        >
                          Delete
                        </Button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className="mt-4 space-y-3 border-t pt-3 text-xs">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-md bg-muted/30 p-3 space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Contact
                            </p>
                            <p>
                              <span className="font-medium">Name:</span>{' '}
                              {booking.pic_name}
                            </p>
                            <p>
                              <span className="font-medium">Email:</span>{' '}
                              {booking.pic_email}
                            </p>
                            <p>
                              <span className="font-medium">Phone:</span>{' '}
                              {booking.pic_hp}
                            </p>
                          </div>

                          <div className="rounded-md bg-muted/30 p-3 space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Organization
                            </p>
                            <p>
                              <span className="font-medium">Org:</span>{' '}
                              {booking.org_name}
                            </p>
                            <p>
                              <span className="font-medium">Type:</span>{' '}
                              {booking.org_type}
                            </p>
                            <p>
                              <span className="font-medium">State:</span>{' '}
                              {booking.org_state}
                            </p>
                            <p>
                              <span className="font-medium">Address:</span>{' '}
                              {booking.org_address}
                            </p>
                          </div>

                          <div className="rounded-md bg-muted/30 p-3 space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Booking
                            </p>
                            <p>
                              <span className="font-medium">Booking ID:</span>{' '}
                              {booking.booking_id}
                            </p>
                            <p>
                              <span className="font-medium">Slot:</span>{' '}
                              {booking.slot_id}
                            </p>
                            <p>
                              <span className="font-medium">Tour Guides:</span>{' '}
                              {booking.slot_type === 'GUIDED'
                                ? (booking.assigned_guide_count ?? '-')
                                : 'Not required'}
                            </p>
                            <p>
                              <span className="font-medium">Package:</span>{' '}
                              {booking.package_id}
                            </p>
                            <p>
                              <span className="font-medium">Activity:</span>{' '}
                              {booking.packages?.[0]?.selected_activity_name ?? '-'}
                            </p>
                            <p>
                              <span className="font-medium">Quotation:</span>{' '}
                              {booking.quotation_id ?? '-'}
                            </p>
                            <p>
                              <span className="font-medium">Price:</span>{' '}
                              {booking.booking_price}
                            </p>
                            <p>
                              <span className="font-medium">Discount:</span>{' '}
                              {booking.discount_id ?? '-'}
                            </p>
                          </div>

                          <div className="rounded-md bg-muted/30 p-3 space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Pax
                            </p>
                            <p>
                              <span className="font-medium">MY Adult:</span>{' '}
                              {booking.pax_my_adult}
                            </p>
                            <p>
                              <span className="font-medium">MY Kid:</span>{' '}
                              {booking.pax_my_kid}
                            </p>
                            <p>
                              <span className="font-medium">MY Senior:</span>{' '}
                              {booking.pax_my_senior}
                            </p>
                            <p>
                              <span className="font-medium">MY OKU:</span>{' '}
                              {booking.pax_my_oku}
                            </p>
                            <p>
                              <span className="font-medium">Non-MY Adult:</span>{' '}
                              {booking.pax_non_my_adult}
                            </p>
                            <p>
                              <span className="font-medium">Non-MY Kid:</span>{' '}
                              {booking.pax_non_my_kid}
                            </p>
                            <p>
                              <span className="font-medium">
                                Non-MY Senior:
                              </span>{' '}
                              {booking.pax_non_my_senior}
                            </p>
                            <p>
                              <span className="font-medium">Non-MY OKU:</span>{' '}
                              {booking.pax_non_my_oku}
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="rounded-md bg-muted/30 p-3 space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Add-ons
                            </p>
                            {booking.booking_addons?.length ? (
                              booking.booking_addons.map((addon) => (
                                <p
                                  key={`${booking.booking_id}-addon-${addon.addon_id}`}
                                >
                                  <span className="font-medium">
                                    {addon.addon_name}:
                                  </span>{' '}
                                  {addon.addon_quantity}
                                </p>
                              ))
                            ) : (
                              <p className="text-muted-foreground">
                                No add-ons selected.
                              </p>
                            )}
                          </div>

                          <div className="rounded-md bg-muted/30 p-3 space-y-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              Foods
                            </p>
                            {booking.booking_foods?.length ? (
                              booking.booking_foods.map((food) => (
                                <p
                                  key={`${booking.booking_id}-food-${food.food_id}`}
                                >
                                  <span className="font-medium">
                                    {food.food_name}:
                                  </span>{' '}
                                  {food.food_quantity}
                                </p>
                              ))
                            ) : (
                              <p className="text-muted-foreground">
                                No foods selected.
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={quotationMutation.isPending}
                            onClick={(e) => {
                              e.stopPropagation()
                              quotationMutation.mutate({
                                data: { booking_id: booking.booking_id },
                              })
                            }}
                          >
                            {quotationMutation.isPending
                              ? 'Preparing quotation...'
                              : 'Download quotation'}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={testEmailMutation.isPending}
                            onClick={(e) => {
                              e.stopPropagation()
                              testEmailMutation.mutate({
                                data: {
                                  booking_id: booking.booking_id,
                                },
                              })
                            }}
                          >
                            {testEmailMutation.isPending
                              ? 'Sending test email...'
                              : 'Send test email'}
                          </Button>
                        </div>

                        {testEmailMutation.isError ? (
                          <p className="text-sm text-red-600">
                            {testEmailMutation.error.message}
                          </p>
                        ) : null}
                        {testEmailMutation.isSuccess ? (
                          <p className="text-sm text-emerald-700">
                            {testEmailMutation.data}
                          </p>
                        ) : null}

                        {isPending ? (
                          <div className="flex items-center justify-between rounded-md border bg-amber-50 p-3 text-sm">
                            <p className="text-amber-900">
                              Review completed? Confirm this booking to move
                              status from PENDING to APPROVED.
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                setApprovingBooking({
                                  booking_id: booking.booking_id,
                                  pic_name: booking.pic_name,
                                })
                                setApprovalDiscountId(booking.discount_id ?? '')
                              }}
                            >
                              Approve Booking
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <DeleteDialog
        open={Boolean(deletingBooking)}
        onOpenChange={(open) => {
          if (!open) {
            setDeletingBooking(null)
          }
        }}
        onConfirm={confirmDelete}
        pending={deleteBookingMutation.isPending}
        title="Delete booking?"
        description={`This will permanently delete the booking for ${deletingBooking?.pic_name ?? 'this person'}.`}
        confirmLabel="Confirm delete"
      />

      <DeleteDialog
        open={Boolean(approvingBooking)}
        onOpenChange={(open) => {
          if (!open) {
            setApprovingBooking(null)
            setApprovalDiscountId('')
          }
        }}
        onConfirm={confirmApprove}
        pending={approveBookingMutation.isPending}
        pendingLabel="Approving..."
        confirmVariant="default"
        title="Approve booking?"
        description={`Please confirm all details are correct for ${approvingBooking?.pic_name ?? 'this booking'}. This will update status to APPROVED.`}
        confirmLabel="Confirm approval"
      >
        <div className="space-y-2">
          <label htmlFor="approval-discount" className="text-sm font-medium">
            Discount Code
          </label>
          <select
            id="approval-discount"
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={approvalDiscountId}
            disabled={
              approveBookingMutation.isPending || discountsQuery.isPending
            }
            onChange={(e) => setApprovalDiscountId(e.target.value)}
          >
            <option value="">No discount</option>
            {discountsQuery.data?.map((discount) => (
              <option key={discount.discount_id} value={discount.discount_id}>
                {discount.discount_id} -{' '}
                {discount.discount_type === 'PERCENTAGE'
                  ? `${discount.discount_amount}%`
                  : `RM ${discount.discount_amount.toFixed(2)}`}
              </option>
            ))}
          </select>
          {discountsQuery.isError ? (
            <p className="text-sm text-red-600">
              {discountsQuery.error.message}
            </p>
          ) : null}
        </div>
      </DeleteDialog>

      {approveBookingMutation.isError ? (
        <p className="text-sm text-red-600">
          {approveBookingMutation.error.message}
        </p>
      ) : null}
      {approveBookingMutation.isSuccess ? (
        <p className="text-sm text-green-700">{approveBookingMutation.data}</p>
      ) : null}

      {quotationMutation.isError ? (
        <p className="text-sm text-red-600">
          {quotationMutation.error.message}
        </p>
      ) : null}
    </>
  )
}
