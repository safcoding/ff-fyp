import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";
import { toHHmm } from "@/lib/utils";
import * as schema from "@/schemas/bookingSchemas";
import { mapBookingToUi } from "@/features/booking/server/bookingMapper";
import { loadBookingID, loadAllBookings, loadRelated } from "./bookingRepo";
import { validateBooking } from "./utils/validation";
import { replaceBookingWithItems } from "./bookingRepo";
import { prepareBookingWriteData } from "./utils/prepData";

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

    const related = await loadRelated(data);

    validateBooking(data, related)

    //can be refactored out but idk lazy rn (9/5 9pm)
    const slot = await prisma.slots.findUnique({
      where: { slot_id: data.slot_id },
      select: { slot_id: true },
    });

    if (!slot) {
      throw new Error("Invalid slot_id: slot not found");
    }    
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
      bookingId: data.booking_id,
      data,
      ...writeData,
    })
    return `Updated Booking ${updated.booking_id}`
  })

export const deleteBooking = createServerFn({ method: "POST" })
    .inputValidator(schema.bookingSchema)
    .handler(async ({ data }) => {
      const deleted = await prisma.bookings.delete({
        where: {booking_id: data.booking_id },
      })

      return `Deleted booking ${deleted.booking_id}`
    })

export const approveBooking = createServerFn({ method: "POST" })
  .inputValidator(schema.bookingSchema)
  .handler(async ({ data }) => {
    const booking = await prisma.bookings.findUnique({
      where: { booking_id: data.booking_id },
      select: { booking_status: true },
    })

    if (!booking) {
      throw new Error("Booking not found")
    }

    if ((booking.booking_status ?? "").toUpperCase() !== "PENDING") {
      throw new Error("Only PENDING bookings can be approved")
    }

    const updated = await prisma.bookings.update({
      where: { booking_id: data.booking_id },
      data: { booking_status: "APPROVED" },
    })

    return `Approved booking ${updated.booking_id}`
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
          slot_capacity: true,
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
      return status !== "REJECTED" && status !== "CANCELLED"
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

          return {
            slot_id: slot.slot_id,
            slot_name: slot.slot_name,
            slot_start: toHHmm(slot.slot_start),
            slot_end: toHHmm(slot.slot_end),
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
