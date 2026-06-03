import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import {
  bookingsInclude,
  mapBookingToUi,
} from '@/features/booking/server/bookingMapper'
import {
  loadBookingID,
  loadAllBookings,
  loadBookingsForMonth,
  replaceBookingWithItems,
  updateBookingStatusById,
} from './bookingRepo'
import { prepareBookingWriteData } from './utils/prepData'
import * as schema from '@/schemas/bookingSchemas'
import { approveBookingSchema } from '@/schemas/discountSchemas'
import { sendBookingApprovedEmail } from '../../email/server/bookingApprovalSender'
import { applyDiscount } from '@/features/discount/server/discountActions'
import { getBookingAvailabilityForMonth } from './bookingAvailabilityService'
import authMiddleware from '@/lib/auth-middleware'

export const getBookings = createServerFn({ method: 'GET' }).handler(
  async () => {
    const bookings = await loadAllBookings()
    return bookings.map(mapBookingToUi)
  },
)

export const getBookingById = createServerFn({ method: 'POST' })
  .inputValidator(schema.bookingIdSchema)
  .handler(async ({ data }) => {
    const [booking, settings] = await Promise.all([
      loadBookingID(data),
      prisma.global_settings.findFirst({ orderBy: { id: 'asc' } }),
    ])

    if (!booking) {
      throw new Error('Booking not found')
    }

    return {
      ...mapBookingToUi(booking),
      company_name: settings?.company_name ?? null,
      company_address: settings?.company_address ?? null,
      company_phone: settings?.company_phone ?? null,
      company_email: settings?.company_email ?? null,
      sst_registration: settings?.sst_registration ?? null,
    }
  })

export const getMonthlyBookingReport = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(schema.monthlyReportSchema)
  .handler(async ({ data }) => {
    const [bookings, settings] = await Promise.all([
      loadBookingsForMonth(data.month),
      prisma.global_settings.findFirst({ orderBy: { id: 'asc' } }),
    ])

    return {
      month: data.month,
      generated_at: new Date(),
      bookings: bookings.map(mapBookingToUi),
      company_name: settings?.company_name ?? null,
      company_address: settings?.company_address ?? null,
      company_phone: settings?.company_phone ?? null,
      company_email: settings?.company_email ?? null,
      sst_registration: settings?.sst_registration ?? null,
    }
  })

export const createBooking = createServerFn({ method: 'POST' })
  .inputValidator(schema.createBookingSchema)
  .handler(async ({ data }) => {
    const {
      bookingPrice,
      paxTotal,
      assignedGuideCount,
      packageRows,
      foodRows,
      addonRows,
    } = await prepareBookingWriteData(data)

    const newBooking = await prisma.bookings.create({
      data: {
        booking_price: bookingPrice,
        pax_total: paxTotal,
        assigned_guide_count: assignedGuideCount,
        pic_name: data.pic_name,
        pic_email: data.pic_email,
        pic_hp: data.pic_hp,
        org_address: data.org_address,
        event_name: data.event_name,
        org_name: data.org_name,
        org_state: data.org_state,
        org_type: data.org_type,
        booking_date: data.booking_date,
        slot_id: data.slot_id,

        booking_packages: {
          create: packageRows.map((row) => ({
            package_id: row.package_id,
            selected_activity: row.selected_activity ?? null,
            pax_my_adult: row.pax_my_adult,
            pax_my_kid: row.pax_my_kid,
            pax_my_senior: row.pax_my_senior,
            pax_my_oku: row.pax_my_oku,
            pax_non_my_adult: row.pax_non_my_adult,
            pax_non_my_kid: row.pax_non_my_kid,
            pax_non_my_senior: row.pax_non_my_senior,
            pax_non_my_oku: row.pax_non_my_oku,
            subtotal: row.subtotal,
          })),
        },

        booking_addons: {
          create: addonRows.map((row) => ({
            addon_id: row.addon_id,
            addon_quantity: row.addon_quantity,
            subtotal: row.subtotal,
          })),
        },
        booking_foods: {
          create: foodRows.map((row) => ({
            food_id: row.food_id,
            food_quantity: row.food_quantity,
            subtotal: row.subtotal,
          })),
        },
      },
    })
    return {id: newBooking.booking_id}
  })

export const updateBooking = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(schema.bookingSchema)
  .handler(async ({ data }) => {
    const writeData = await prepareBookingWriteData(data)
    const updated = await replaceBookingWithItems({
      booking_id: data.booking_id,
      data,
      ...writeData,
    })
    return `Updated Booking ${updated.booking_id}`
  })

export const deleteBooking = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(schema.deleteBookingSchema)
  .handler(async ({ data }) => {
    const deleted = await prisma.bookings.delete({
      where: { booking_id: data.booking_id },
    })

    return `Deleted booking ${deleted.booking_id}`
  })

export const changeBookingStatus = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(schema.bookingStatusSchema)
  .handler(async ({ data }) => {
    const updated = await updateBookingStatusById(
      data.booking_id,
      data.booking_status,
    )

    return `Updated booking ${updated.booking_id} status to ${updated.booking_status}`
  })

export const approveBooking = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(approveBookingSchema)
  .handler(async ({ data }) => {
    const booking = await prisma.bookings.findUnique({
      where: { booking_id: data.booking_id },
      select: { booking_status: true, booking_price: true },
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    if ((booking.booking_status ?? '').toUpperCase() !== 'PENDING') {
      throw new Error('Only PENDING bookings can be approved')
    }

    const discount = data.discount_id
      ? await prisma.discounts.findUnique({
          where: { discount_id: data.discount_id },
          select: {
            discount_id: true,
            discount_type: true,
            discount_amount: true,
          },
        })
      : null

    if (data.discount_id && !discount) {
      throw new Error('Discount code not found')
    }

    const bookingPrice = applyDiscount(Number(booking.booking_price), discount)

    const updated = await prisma.bookings.update({
      where: { booking_id: data.booking_id },
      data: {
        booking_status: 'APPROVED',
        booking_price: bookingPrice,
        discount_id: discount?.discount_id ?? null,
      },
    })

    const fullBooking = await prisma.bookings.findUnique({
      where: { booking_id: updated.booking_id },
      include: bookingsInclude,
    })

    if (!fullBooking) {
      throw new Error('Booking not found after approval')
    }

    await sendBookingApprovedEmail(fullBooking, data.staff_comment ?? null)

    return discount
      ? `Approved booking ${updated.booking_id} with discount ${discount.discount_id}`
      : `Approved booking ${updated.booking_id}`
  })

export const sendTestBookingEmail = createServerFn({ method: 'POST' })
  .inputValidator(schema.testBookingEmailSchema)
  .handler(async ({ data }) => {
    const recipient = process.env.TEST_EMAIL_TO
    if (!recipient) {
      throw new Error('Missing TEST_EMAIL_TO env var for test emails.')
    }

    const booking = await prisma.bookings.findUnique({
      where: { booking_id: data.booking_id },
      include: bookingsInclude,
    })

    if (!booking) {
      throw new Error('Booking not found')
    }

    await sendBookingApprovedEmail(
      booking,
      data.staff_comment ?? null,
      recipient,
    )

    return `Sent test email for booking ${booking.booking_id} to ${recipient}`
  })

export const getBookingAvailability = createServerFn({ method: 'POST' })
  .inputValidator(schema.availabilitySchema)
  .handler(async ({ data }) => {
    return getBookingAvailabilityForMonth(data)
  })
