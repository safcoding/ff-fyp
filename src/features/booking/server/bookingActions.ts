import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";
import { toHHmm } from "@/lib/utils";
import { bookingsInclude, mapBookingToUi } from "@/features/booking/server/bookingMapper";
import { loadBookingID, loadAllBookings, replaceBookingWithItems } from "./bookingRepo";
import { prepareBookingWriteData } from "./utils/prepData";
import * as schema from "@/schemas/bookingSchemas";
import { approveBookingSchema } from "@/schemas/discountSchemas";
import { sendBookingApprovedEmail } from "../../email/server/bookingApprovalSender";
import { applyDiscount } from "@/features/discount/server/discountActions";

export const getBookings = createServerFn({ method: "GET" }).handler(async () => {
  const bookings = await loadAllBookings()
  return bookings.map(mapBookingToUi)
})

export const getBookingById = createServerFn({ method: "POST" })
  .inputValidator(schema.bookingIdSchema)
  .handler(async ({ data }) => {
    const booking = await loadBookingID(data)

    if (!booking) {
      throw new Error("Booking not found")
    }

    return mapBookingToUi(booking)
})

export const createBooking = createServerFn({ method: 'POST' })
  .inputValidator(schema.createBookingSchema)
  .handler(async ({ data }) => {
    const {
      bookingPrice,
      paxTotal,
      packageRows,
      foodRows,
      addonRows,
    } = await prepareBookingWriteData(data)


    const newBooking = await prisma.bookings.create({
      data: {
        booking_price: bookingPrice,
        pax_total: paxTotal,
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
    return `Created booking for ${newBooking.pic_name} with email ${newBooking.pic_email}. Total price: ${newBooking.booking_price.toString()}`;
})

export const updateBooking = createServerFn({method: "POST"})
  .inputValidator(schema.bookingSchema)
  .handler(async ({data}) => {

    const writeData = await prepareBookingWriteData(data)
    const updated = await replaceBookingWithItems({
      booking_id: data.booking_id,
      data,
      ...writeData,
    })
    return `Updated Booking ${updated.booking_id}`
})

export const deleteBooking = createServerFn({ method: "POST" })
    .inputValidator(schema.deleteBookingSchema)
    .handler(async ({ data }) => {
      const deleted = await prisma.bookings.delete({
        where: {booking_id: data.booking_id },
      })

      return `Deleted booking ${deleted.booking_id}`
})

export const approveBooking = createServerFn({ method: "POST" })
  .inputValidator(approveBookingSchema)
  .handler(async ({ data }) => {
    const booking = await prisma.bookings.findUnique({
      where: { booking_id: data.booking_id },
      select: { booking_status: true, booking_price: true },
    })

    if (!booking) {
      throw new Error("Booking not found")
    }

    if ((booking.booking_status ?? "").toUpperCase() !== "PENDING") {
      throw new Error("Only PENDING bookings can be approved")
    }

    const discount = data.discount_id
      ? await prisma.discounts.findUnique({
          where: { discount_id: data.discount_id },
          select: { discount_id: true, discount_type: true, discount_amount: true },
        })
      : null

    if (data.discount_id && !discount) {
      throw new Error("Discount code not found")
    }

    const bookingPrice = applyDiscount(Number(booking.booking_price), discount)

    const updated = await prisma.bookings.update({
      where: { booking_id: data.booking_id },
      data: {
        booking_status: "APPROVED",
        booking_price: bookingPrice,
        discount_id: discount?.discount_id ?? null,
      },
    })

    const fullBooking = await prisma.bookings.findUnique({
      where: { booking_id: updated.booking_id },
      include: bookingsInclude,
    })

    if (!fullBooking) {
      throw new Error("Booking not found after approval")
    }

    await sendBookingApprovedEmail(fullBooking, data.staff_comment ?? null)

    return discount
      ? `Approved booking ${updated.booking_id} with discount ${discount.discount_id}`
      : `Approved booking ${updated.booking_id}`
})

export const sendTestBookingEmail = createServerFn({ method: "POST" })
  .inputValidator(schema.testBookingEmailSchema)
  .handler(async ({ data }) => {
    const recipient = process.env.TEST_EMAIL_TO
    if (!recipient) {
      throw new Error("Missing TEST_EMAIL_TO env var for test emails.")
    }

    const booking = await prisma.bookings.findUnique({
      where: { booking_id: data.booking_id },
      include: bookingsInclude,
    })

    if (!booking) {
      throw new Error("Booking not found")
    }

    await sendBookingApprovedEmail(booking, data.staff_comment ?? null, recipient)

    return `Sent test email for booking ${booking.booking_id} to ${recipient}`
  })
  
export const getBookingAvailability = createServerFn({ method: "POST" })
  .inputValidator(schema.availabilitySchema)
  .handler(async ({ data }) => {
    const [year, month] = data.month.split("-").map(Number)
    const monthStart = new Date(Date.UTC(year, month - 1, 1))
    const nextMonthStart = new Date(Date.UTC(year, month, 1))

    const [slots, monthBookings] = await Promise.all([
      prisma.slots.findMany({
        orderBy: { slot_name: "asc" },
        select: {
          slot_id: true,
          slot_name: true,
          slot_start: true,
          slot_end: true,
          weekday_start: true,
          weekday_end: true,
          weekend_start: true,
          weekend_end: true,
          slot_capacity: true,
          slot_type: true,
        },
      }),
      prisma.bookings.findMany({
        where: {
          booking_date: {
            gte: monthStart,
            lt: nextMonthStart,
          },
        },
        select: {
          booking_date: true,
          booking_status: true,
          slot_id: true,
          pax_total: true,
        },
      }),
    ])

    const activeBookings = monthBookings.filter((booking) => {
      const status = (booking.booking_status ?? "").toUpperCase()
      return status !== "CANCELLED"
    })

    const bookedByDateAndSlot = new Map<string, Map<string, number>>()

    for (const booking of activeBookings) {
      if (!booking.booking_date) {
        continue
      }

      const dateKey = booking.booking_date.toISOString().slice(0, 10)
      const visitors = booking.pax_total ?? 0

      const slotMap = bookedByDateAndSlot.get(dateKey) ?? new Map<string, number>()
      slotMap.set(booking.slot_id, (slotMap.get(booking.slot_id) ?? 0) + visitors)
      bookedByDateAndSlot.set(dateKey, slotMap)
    }

    const dateStatuses: Record<string, "full" | "limited" | "available"> = {}

    for (let cursor = new Date(monthStart); cursor < nextMonthStart; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const dateKey = cursor.toISOString().slice(0, 10)
      const slotMap = bookedByDateAndSlot.get(dateKey) ?? new Map<string, number>()

      const availableSlotCount = slots.filter((slot) => {
        const booked = slotMap.get(slot.slot_id) ?? 0
        return booked < slot.slot_capacity
      }).length

      if (availableSlotCount === 0) {
        dateStatuses[dateKey] = "full"
      } else if (availableSlotCount <= Math.ceil(slots.length / 3)) {
        dateStatuses[dateKey] = "limited"
      } else {
        dateStatuses[dateKey] = "available"
      }
    }

    const fullyBookedDates = Object.entries(dateStatuses)
      .filter(([, status]) => status === "full")
      .map(([date]) => date)

    const slotsForDate = data.date
      ? slots.map((slot) => {
          const booked = bookedByDateAndSlot.get(data.date!)?.get(slot.slot_id) ?? 0
          const remaining = Math.max(slot.slot_capacity - booked, 0)
          const selectedDate = new Date(`${data.date}T00:00:00`)
          const isWeekend = selectedDate.getDay() === 0 || selectedDate.getDay() === 6

          const startTime = slot.slot_type === "UNGUIDED"
            ? isWeekend
              ? slot.weekend_start
              : slot.weekday_start
            : slot.slot_start

          const endTime = slot.slot_type === "UNGUIDED"
            ? isWeekend
              ? slot.weekend_end
              : slot.weekday_end
            : slot.slot_end

          return {
            slot_id: slot.slot_id,
            slot_name: slot.slot_name,
            slot_start: startTime ? toHHmm(startTime) : "",
            slot_end: endTime ? toHHmm(endTime) : "",
            slot_capacity: slot.slot_capacity,
            booked_visitors: booked,
            remaining_capacity: remaining,
            is_full: remaining <= 0,
          }
        })
      : []

    return {
      month: data.month,
      selected_date: data.date ?? null,
      fully_booked_dates: fullyBookedDates,
      date_statuses: dateStatuses,
      slots_for_date: slotsForDate,
    }
})
