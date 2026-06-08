import { createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'
import { useState } from 'react'

import {
  approveBooking as approveBookingAction,
  changeBookingStatus,
  deleteBooking as deleteBookingAction,
  getBookingById,
  getBookings,
  getMonthlyBookingReport,
  sendTestBookingEmail,
  updateBooking as updateBookingAction,
} from '@/features/booking/server/bookingActions'
import { getDiscounts } from '@/features/discount/server/discountActions'
import { useSession } from '@/lib/auth-client'
import { isAdminUser } from '@/lib/authz'
import { buildQuotationPdfBlob } from '@/components/booking/QuotationPdf'
import { buildMonthlyReportPdfBlob } from '@/components/booking/MonthlyReportPdf'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { DeleteDialog } from '@/components/deleteDialog'
import { booking_status, org_categories, states } from '@/generated/prisma/enums'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Modal } from '@/components/ui/modal'
import { Textarea } from '@/components/ui/textarea'
import { cn, formatCurrency, formatDate } from '@/lib/utils'
import {
  CalendarDays,
  ChevronDown,
  ChevronRight,
  Clock3,
  Mail,
  MapPin,
  Package,
  Phone,
  Users,
} from 'lucide-react'

export const Route = createFileRoute('/admin/bookings')({
  component: BookingPage,
})

const bookingStatusOptions = Object.values(booking_status)
const orgCategoryOptions = Object.values(org_categories)
const stateOptions = Object.values(states)

type BookingStatus = (typeof bookingStatusOptions)[number]
type AdminBooking = Awaited<ReturnType<typeof getBookings>>[number]
type EditBookingValues = {
  booking_date: string
  booking_status: BookingStatus
  pic_name: string
  pic_email: string
  pic_hp: string
  org_address: string
  org_name: string
  org_state: (typeof stateOptions)[number]
  org_type: (typeof orgCategoryOptions)[number]
  event_name: string
}

const statusStyles: Record<
  BookingStatus,
  {
    card: string
    badge: string
    select: string
    tone: string
  }
> = {
  PENDING: {
    card: 'border-amber-300/70 bg-amber-50/70 hover:bg-amber-50',
    badge: 'border-amber-300 bg-amber-100 text-amber-900',
    select: 'border-amber-300 bg-amber-50 text-amber-950',
    tone: 'Needs review',
  },
  APPROVED: {
    card: 'border-emerald-300/70 bg-emerald-50/60 hover:bg-emerald-50',
    badge: 'border-emerald-300 bg-emerald-100 text-emerald-900',
    select: 'border-emerald-300 bg-emerald-50 text-emerald-950',
    tone: 'Confirmed',
  },
  POSTPONED: {
    card: 'border-sky-300/70 bg-sky-50/60 hover:bg-sky-50',
    badge: 'border-sky-300 bg-sky-100 text-sky-900',
    select: 'border-sky-300 bg-sky-50 text-sky-950',
    tone: 'Date pending',
  },
  CANCELLED: {
    card: 'border-rose-300/70 bg-rose-50/60 hover:bg-rose-50',
    badge: 'border-rose-300 bg-rose-100 text-rose-900',
    select: 'border-rose-300 bg-rose-50 text-rose-950',
    tone: 'Cancelled',
  },
}

function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) {
    return ''
  }

  return new Date(value).toISOString().slice(0, 10)
}

function formatEnumLabel(value: string | null | undefined) {
  return value ? value.replaceAll('_', ' ') : '-'
}

function getCurrentMonthInputValue() {
  return new Date().toISOString().slice(0, 7)
}

function formatReportFileMonth(month: string) {
  return month.replace('-', '')
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string | number | null | undefined
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-stone-200/70 py-2 last:border-b-0">
      <span className="text-stone-500">{label}</span>
      <span className="max-w-[65%] text-right font-medium text-stone-800">
        {value ?? '-'}
      </span>
    </div>
  )
}

function DetailPanel({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-md border border-stone-200 bg-white/75 p-4">
      <h3 className="mb-2 text-xs font-semibold uppercase text-stone-500">
        {title}
      </h3>
      <div className="text-sm">{children}</div>
    </section>
  )
}

function BookingPage() {
  const queryClient = useQueryClient()
  const { data: session } = useSession()
  const isAdmin = isAdminUser(session?.user)
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
  const [approvalStaffComment, setApprovalStaffComment] = useState('')
  const [editingBooking, setEditingBooking] = useState<AdminBooking | null>(
    null,
  )
  const [editValues, setEditValues] = useState<EditBookingValues | null>(null)
  const [reportMonth, setReportMonth] = useState(getCurrentMonthInputValue)

  const bookingQuery = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: getBookings,
  })

  const discountsQuery = useQuery({
    queryKey: ['admin-discounts'],
    queryFn: () => getDiscounts(),
    enabled: isAdmin,
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
      setApprovalDiscountId('')
      setApprovalStaffComment('')
    },
  })

  const changeBookingStatusMutation = useMutation({
    mutationFn: changeBookingStatus,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
    },
  })

  const updateBookingMutation = useMutation({
    mutationFn: updateBookingAction,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-bookings'] })
      setEditingBooking(null)
      setEditValues(null)
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

  const monthlyReportMutation = useMutation({
    mutationFn: getMonthlyBookingReport,
    onSuccess: async (report) => {
      const blob = await buildMonthlyReportPdfBlob(report)
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `monthly-booking-report-${formatReportFileMonth(report.month)}.pdf`
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
        staff_comment: approvalStaffComment.trim() || undefined,
      },
    })
  }

  function openEditModal(booking: AdminBooking) {
    setEditingBooking(booking)
    setEditValues({
      booking_date: toDateInputValue(booking.booking_date),
      booking_status: booking.booking_status ?? 'PENDING',
      pic_name: booking.pic_name,
      pic_email: booking.pic_email,
      pic_hp: booking.pic_hp,
      org_address: booking.org_address,
      org_name: booking.org_name,
      org_state: booking.org_state,
      org_type: booking.org_type,
      event_name: booking.event_name ?? '',
    })
  }

  async function submitEdit() {
    if (!editingBooking || !editValues) {
      return
    }

    await updateBookingMutation.mutateAsync({
      data: {
        booking_id: editingBooking.booking_id,
        booking_price: Number(editingBooking.booking_price),
        discount_code: editingBooking.discount_id ?? '',
        pax_total: editingBooking.pax_total,
        booking_status: editValues.booking_status,
        booking_date: new Date(editValues.booking_date),
        pic_name: editValues.pic_name,
        pic_email: editValues.pic_email,
        pic_hp: editValues.pic_hp,
        org_address: editValues.org_address,
        org_name: editValues.org_name,
        org_state: editValues.org_state,
        org_type: editValues.org_type,
        event_name: editValues.event_name || undefined,
        slot_id: editingBooking.slot_id,
        packages: editingBooking.packages,
        addons:
          editingBooking.booking_addons?.map((addon) => ({
            addon_id: addon.addon_id,
            quantity: addon.addon_quantity,
          })) ?? [],
        foods:
          editingBooking.booking_foods?.map((food) => ({
            food_id: food.food_id,
            quantity: food.food_quantity,
          })) ?? [],
      },
    })

    if (editValues.booking_status !== editingBooking.booking_status) {
      await changeBookingStatusMutation.mutateAsync({
        data: {
          booking_id: editingBooking.booking_id,
          booking_status: editValues.booking_status,
        },
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#445412]/10 pb-5">
        <h1 className="font-fraunces text-3xl font-black text-[#445412] sm:text-4xl">Bookings</h1>
        <p className="text-sm text-stone-500 mt-1">Review, approve, and manage group tour booking requests.</p>
      </div>
      <Card className="border-[#445412]/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#445412]">Monthly Report</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <Label htmlFor="monthly-report-month">Report Month</Label>
              <Input
                id="monthly-report-month"
                type="month"
                value={reportMonth}
                onChange={(e) => setReportMonth(e.target.value)}
                className="md:w-64"
              />
            </div>
            <Button
              type="button"
              disabled={!reportMonth || monthlyReportMutation.isPending}
              onClick={() =>
                monthlyReportMutation.mutate({
                  data: { month: reportMonth },
                })
              }
            >
              {monthlyReportMutation.isPending
                ? 'Generating report...'
                : 'Download monthly report'}
            </Button>
          </div>
          {monthlyReportMutation.isError ? (
            <p className="mt-3 text-sm text-red-600">
              {monthlyReportMutation.error.message}
            </p>
          ) : null}
        </CardContent>
      </Card>
      <Card className="border-[#445412]/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-[#445412]">All Bookings</CardTitle>
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
                const bookingStatus = booking.booking_status ?? 'PENDING'
                const styles = statusStyles[bookingStatus]
                const isPending =
                  (booking.booking_status ?? '').toUpperCase() === 'PENDING'

                return (
                  <div
                    key={booking.booking_id}
                    className={cn(
                      'cursor-pointer rounded-md border p-4 text-sm shadow-sm transition-all hover:shadow-md',
                      styles.card,
                    )}
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
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="size-4 text-stone-500" />
                          ) : (
                            <ChevronRight className="size-4 text-stone-500" />
                          )}
                          <span
                            className={cn(
                              'rounded-full border px-2.5 py-1 text-xs font-semibold',
                              styles.badge,
                            )}
                          >
                            {bookingStatus}
                          </span>
                          <span className="text-xs font-medium text-stone-500">
                            {styles.tone}
                          </span>
                        </div>

                        <div>
                          <h2 className="text-lg font-semibold text-stone-950">
                            {booking.event_name || booking.org_name}
                          </h2>
                          <p className="text-sm text-stone-600">
                            {booking.org_name}
                          </p>
                        </div>

                        <div className="grid gap-2 text-sm text-stone-700 md:grid-cols-2 xl:grid-cols-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="size-4 text-stone-500" />
                            <span>{formatDate(booking.booking_date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock3 className="size-4 text-stone-500" />
                            <span>{booking.slot_name ?? booking.slot_id}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="size-4 text-stone-500" />
                            <span>
                              {booking.packages?.[0]?.package_name ??
                                booking.package_id ??
                                '-'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="size-4 text-stone-500" />
                            <span>{booking.pax_total} pax</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-stone-600">
                          <span className="rounded-full bg-white/70 px-2.5 py-1">
                            PIC: {booking.pic_name}
                          </span>
                          <span className="rounded-full bg-white/70 px-2.5 py-1">
                            {formatCurrency(Number(booking.booking_price))}
                          </span>
                          {booking.discount_id ? (
                            <span className="rounded-full bg-white/70 px-2.5 py-1">
                              Discount: {booking.discount_id}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      <div
                        className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center xl:justify-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={() => openEditModal(booking)}
                        >
                          Edit
                        </Button>
                        <select
                          className={cn(
                            'h-9 w-full rounded-md border px-2 text-xs font-medium sm:w-auto',
                            styles.select,
                          )}
                          value={booking.booking_status ?? 'PENDING'}
                          disabled={changeBookingStatusMutation.isPending}
                          onChange={(e) =>
                            changeBookingStatusMutation.mutate({
                              data: {
                                booking_id: booking.booking_id,
                                booking_status: e.target.value as BookingStatus,
                              },
                            })
                          }
                        >
                          {bookingStatusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="w-full sm:w-auto"
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
                      <div className="mt-4 space-y-4 border-t border-stone-200/80 pt-4">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <DetailPanel title="Contact">
                            <InfoRow label="Name" value={booking.pic_name} />
                            <div className="flex items-center gap-2 border-b border-stone-200/70 py-2">
                              <Mail className="size-4 text-stone-500" />
                              <span className="break-all font-medium text-stone-800">
                                {booking.pic_email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 py-2">
                              <Phone className="size-4 text-stone-500" />
                              <span className="font-medium text-stone-800">
                                {booking.pic_hp}
                              </span>
                            </div>
                          </DetailPanel>

                          <DetailPanel title="Organization">
                            <InfoRow label="Org" value={booking.org_name} />
                            <InfoRow
                              label="Type"
                              value={formatEnumLabel(booking.org_type)}
                            />
                            <InfoRow
                              label="State"
                              value={formatEnumLabel(booking.org_state)}
                            />
                            <div className="flex items-start gap-2 py-2">
                              <MapPin className="mt-0.5 size-4 shrink-0 text-stone-500" />
                              <span className="font-medium text-stone-800">
                                {booking.org_address}
                              </span>
                            </div>
                          </DetailPanel>

                          <DetailPanel title="Booking">
                            <InfoRow
                              label="Booking ID"
                              value={booking.booking_id}
                            />
                            <InfoRow
                              label="Slot"
                              value={booking.slot_name ?? booking.slot_id}
                            />
                            <InfoRow
                              label="Tour Guides"
                              value={
                                booking.slot_type === 'GUIDED'
                                  ? (booking.assigned_guide_count ?? '-')
                                  : 'Not required'
                              }
                            />
                            <InfoRow
                              label="Activity"
                              value={
                                booking.packages?.[0]
                                  ?.selected_activity_name ?? '-'
                              }
                            />
                            <InfoRow
                              label="Quotation"
                              value={booking.quotation_id ?? '-'}
                            />
                            <InfoRow
                              label="Price"
                              value={formatCurrency(
                                Number(booking.booking_price),
                              )}
                            />
                            <InfoRow
                              label="Discount"
                              value={booking.discount_id ?? '-'}
                            />
                          </DetailPanel>

                          <DetailPanel title="Pax">
                            <InfoRow label="Total" value={booking.pax_total} />
                            <InfoRow
                              label="MY Adult"
                              value={booking.pax_my_adult}
                            />
                            <InfoRow
                              label="MY Kid"
                              value={booking.pax_my_kid}
                            />
                            <InfoRow
                              label="MY Senior"
                              value={booking.pax_my_senior}
                            />
                            <InfoRow
                              label="MY OKU"
                              value={booking.pax_my_oku}
                            />
                            <InfoRow
                              label="Non-MY Adult"
                              value={booking.pax_non_my_adult}
                            />
                            <InfoRow
                              label="Non-MY Kid"
                              value={booking.pax_non_my_kid}
                            />
                            <InfoRow
                              label="Non-MY Senior"
                              value={booking.pax_non_my_senior}
                            />
                            <InfoRow
                              label="Non-MY OKU"
                              value={booking.pax_non_my_oku}
                            />
                          </DetailPanel>
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                          <DetailPanel title="Add-ons">
                            {booking.booking_addons?.length ? (
                              booking.booking_addons.map((addon) => (
                                <InfoRow
                                  key={`${booking.booking_id}-addon-${addon.addon_id}`}
                                  label={addon.addon_name}
                                  value={addon.addon_quantity}
                                />
                              ))
                            ) : (
                              <p className="text-muted-foreground">
                                No add-ons selected.
                              </p>
                            )}
                          </DetailPanel>

                          <DetailPanel title="Foods">
                            {booking.booking_foods?.length ? (
                              booking.booking_foods.map((food) => (
                                <InfoRow
                                  key={`${booking.booking_id}-food-${food.food_id}`}
                                  label={food.food_name}
                                  value={food.food_quantity}
                                />
                              ))
                            ) : (
                              <p className="text-muted-foreground">
                                No foods selected.
                              </p>
                            )}
                          </DetailPanel>
                        </div>

                        <div className="grid gap-2 sm:flex sm:flex-wrap">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="w-full sm:w-auto"
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
                            className="w-full sm:w-auto"
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
                          <div className="flex flex-col gap-3 rounded-md border bg-amber-50 p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-amber-900">
                              Review completed? Confirm this booking to move
                              status from PENDING to APPROVED.
                            </p>
                            <Button
                              type="button"
                              size="sm"
                              className="w-full sm:w-auto"
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
            setApprovalStaffComment('')
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
        {isAdmin ? (
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
        ) : null}
        <div className="mt-4 space-y-2">
          <Label htmlFor="approval-staff-comment">Staff Comment</Label>
          <Textarea
            id="approval-staff-comment"
            value={approvalStaffComment}
            disabled={approveBookingMutation.isPending}
            placeholder="Add any instructions, payment links, or notes for the PIC."
            onChange={(e) => setApprovalStaffComment(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Links such as https://example.com or www.example.com will be
            clickable in the email.
          </p>
        </div>
      </DeleteDialog>

      <Modal
        open={Boolean(editingBooking && editValues)}
        title="Edit booking"
        description={`Update details for ${editingBooking?.pic_name ?? 'this booking'}.`}
        onClose={() => {
          setEditingBooking(null)
          setEditValues(null)
        }}
      >
        {editValues ? (
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              void submitEdit()
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="edit-booking-date">Booking Date</Label>
              <Input
                id="edit-booking-date"
                type="date"
                value={editValues.booking_date}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev ? { ...prev, booking_date: e.target.value } : prev,
                  )
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-booking-status">Status</Label>
              <select
                id="edit-booking-status"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={editValues.booking_status}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev
                      ? {
                          ...prev,
                          booking_status: e.target.value as BookingStatus,
                        }
                      : prev,
                  )
                }
              >
                {bookingStatusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-pic-name">PIC Name</Label>
              <Input
                id="edit-pic-name"
                value={editValues.pic_name}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev ? { ...prev, pic_name: e.target.value } : prev,
                  )
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-pic-email">PIC Email</Label>
              <Input
                id="edit-pic-email"
                type="email"
                value={editValues.pic_email}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev ? { ...prev, pic_email: e.target.value } : prev,
                  )
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-pic-phone">PIC Phone</Label>
              <Input
                id="edit-pic-phone"
                value={editValues.pic_hp}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev ? { ...prev, pic_hp: e.target.value } : prev,
                  )
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-event-name">Event Name</Label>
              <Input
                id="edit-event-name"
                value={editValues.event_name}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev ? { ...prev, event_name: e.target.value } : prev,
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-org-name">Organization</Label>
              <Input
                id="edit-org-name"
                value={editValues.org_name}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev ? { ...prev, org_name: e.target.value } : prev,
                  )
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-org-type">Organization Type</Label>
              <select
                id="edit-org-type"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={editValues.org_type}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev
                      ? {
                          ...prev,
                          org_type: e.target.value as (typeof orgCategoryOptions)[number],
                        }
                      : prev,
                  )
                }
              >
                {orgCategoryOptions.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-org-state">State</Label>
              <select
                id="edit-org-state"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={editValues.org_state}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev
                      ? {
                          ...prev,
                          org_state: e.target.value as (typeof stateOptions)[number],
                        }
                      : prev,
                  )
                }
              >
                {stateOptions.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-org-address">Address</Label>
              <Textarea
                id="edit-org-address"
                value={editValues.org_address}
                onChange={(e) =>
                  setEditValues((prev) =>
                    prev ? { ...prev, org_address: e.target.value } : prev,
                  )
                }
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={
                    updateBookingMutation.isPending ||
                    changeBookingStatusMutation.isPending
                  }
                >
                  {updateBookingMutation.isPending ? 'Saving...' : 'Save changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingBooking(null)
                    setEditValues(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
              {updateBookingMutation.isError ? (
                <p className="text-sm text-red-600">
                  {updateBookingMutation.error.message}
                </p>
              ) : null}
              {changeBookingStatusMutation.isError ? (
                <p className="text-sm text-red-600">
                  {changeBookingStatusMutation.error.message}
                </p>
              ) : null}
            </div>
          </form>
        ) : null}
      </Modal>

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
      {changeBookingStatusMutation.isSuccess ? (
        <p className="text-sm text-green-700">
          {changeBookingStatusMutation.data}
        </p>
      ) : null}
    </div>
  )
}
