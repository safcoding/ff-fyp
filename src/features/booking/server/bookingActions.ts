import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";

import { toHHmm } from "@/lib/utils";
import * as schema from "@/schemas/booking";
import { calculateBookingTotal, calculatePackageSubtotal, calculatePaxTotal } from "@/features/booking/server/utils/price-calculation";
import { mapBooking } from "@/features/booking/server/bookingMapper";
import { loadBookingID, loadAllBookings } from "./bookingRepo";

export const getBookings = createServerFn({ method: "GET" }).handler(async () => {
  const bookings = await loadAllBookings()
  return bookings.map(mapBooking)
})

export const getBookingById = createServerFn({ method: "POST" })
  .inputValidator(schema.bookingIdSchema)
  .handler(async ({ data }) => {
    const booking = await loadBookingID(data)

    if (!booking) {
      throw new Error("Booking not found")
    }

    return mapBooking(booking)
  })


  //The refactor zone

export const createBooking = createServerFn({ method: 'POST' })
  .inputValidator(schema.createBookingSchema)
  .handler(async ({ data }) => {
    if (data.packages.length === 0) {
      throw new Error("At least one package is required")
    }

    const packageIds = Array.from(new Set(data.packages.map((pkg) => pkg.package_id)))
    const foodIds = Array.from(new Set(data.foods.map((food) => food.food_id)))
    const addonIds = Array.from(new Set(data.addons.map((addon) => addon.addon_id)))

    const [packages, foods, addons] = await Promise.all([
      prisma.packages.findMany({
        where: { package_id: { in: packageIds } },
        select: {
          package_id: true,
          package_name: true,
          package_note: true,
          package_features: true,
          package_availability: true,
          price_my_adult: true,
          price_my_kid: true,
          price_my_senior: true,
          price_my_oku: true,
          price_non_my_adult: true,
          price_non_my_kid: true,
          price_non_my_senior: true,
          price_non_my_oku: true,
        },
      }),
      foodIds.length
        ? prisma.foods.findMany({
            where: { food_id: { in: foodIds } },
            select: { food_id: true, food_name: true, food_price: true },
          })
        : Promise.resolve([]),
      addonIds.length
        ? prisma.addons.findMany({
            where: { addon_id: { in: addonIds } },
            select: {
              addon_id: true,
              addon_name: true,
              addon_desc: true,
              addon_price: true,
              addon_avail: true,
            },
          })
        : Promise.resolve([]),
    ])

    if (packages.length !== packageIds.length) {
      throw new Error("Invalid package selection")
    }

    const unavailablePackage = packages.find((pkg) => !pkg.package_availability)
    if (unavailablePackage) {
      throw new Error(`Selected package is not available: ${unavailablePackage.package_name}`)
    }

    const slot = await prisma.slots.findUnique({
      where: { slot_id: data.slot_id },
      select: { slot_id: true },
    });

    if (!slot) {
      throw new Error("Invalid slot_id: slot not found");
    }

    const packagePriceMap = Object.fromEntries(
      packages.map((pkg) => [
        pkg.package_id,
        {
          package_name: pkg.package_name,
          package_note: pkg.package_note ?? undefined,
          package_features: pkg.package_features,
          package_availability: pkg.package_availability,
          price_my_adult: Number(pkg.price_my_adult),
          price_my_kid: Number(pkg.price_my_kid),
          price_my_senior: Number(pkg.price_my_senior),
          price_my_oku: Number(pkg.price_my_oku),
          price_non_my_adult: Number(pkg.price_non_my_adult),
          price_non_my_kid: Number(pkg.price_non_my_kid),
          price_non_my_senior: Number(pkg.price_non_my_senior),
          price_non_my_oku: Number(pkg.price_non_my_oku),
        },
      ])
    )

    const foodPriceMap = Object.fromEntries(
      foods.map((food) => [
        food.food_id,
        { food_name: food.food_name, food_price: Number(food.food_price) },
      ])
    )

    const addonPriceMap = Object.fromEntries(
      addons.map((addon) => [
        addon.addon_id,
        {
          addon_name: addon.addon_name,
          addon_desc: addon.addon_desc,
          addon_price: Number(addon.addon_price),
          addon_avail: addon.addon_avail,
        },
      ])
    )

    const bookingPrice = calculateBookingTotal(
      data.packages,
      data.foods,
      data.addons,
      packagePriceMap,
      foodPriceMap,
      addonPriceMap
    )

    const paxTotal = calculatePaxTotal(data.packages)

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
      }
    });

    await prisma.booking_packages.createMany({
      data: data.packages.map((row) => ({
        booking_id: newBooking.booking_id,
        package_id: row.package_id,
        pax_my_adult: row.pax_my_adult,
        pax_my_kid: row.pax_my_kid,
        pax_my_senior: row.pax_my_senior,
        pax_my_oku: row.pax_my_oku,
        pax_non_my_adult: row.pax_non_my_adult,
        pax_non_my_kid: String(row.pax_non_my_kid),
        pax_non_my_senior: row.pax_non_my_senior,
        pax_non_my_oku: row.pax_non_my_oku,
        subtotal: calculatePackageSubtotal(row, packagePriceMap[row.package_id]),
      })),
    })

    if (data.addons.length > 0) {
      await prisma.booking_addons.createMany({
        data: data.addons.map((item) => ({
          booking_id: newBooking.booking_id,
          addon_id: item.addon_id,
          addon_quantity: item.quantity,
        })),
      })
    }

    if (data.foods.length > 0) {
      await prisma.booking_foods.createMany({
        data: data.foods.map((item) => ({
          booking_id: newBooking.booking_id,
          food_id: item.food_id,
          food_quantity: item.quantity,
        })),
      })
    }
    return `Created booking for ${newBooking.pic_name} with email ${newBooking.pic_email}. Total price: ${newBooking.booking_price.toString()}`;
  })

  export const updateBooking = createServerFn({method: "POST"})
  .inputValidator(schema.bookingSchema)
  .handler(async ({data}) => {
    if (data.packages.length === 0) {
      throw new Error("At least one package is required")
    }

    const packageIds = Array.from(new Set(data.packages.map((pkg) => pkg.package_id)))
    const foodIds = Array.from(new Set(data.foods.map((food) => food.food_id)))
    const addonIds = Array.from(new Set(data.addons.map((addon) => addon.addon_id)))

    const [packages, foods, addons] = await Promise.all([
      prisma.packages.findMany({
        where: { package_id: { in: packageIds } },
        select: {
          package_id: true,
          package_name: true,
          package_note: true,
          package_features: true,
          package_availability: true,
          price_my_adult: true,
          price_my_kid: true,
          price_my_senior: true,
          price_my_oku: true,
          price_non_my_adult: true,
          price_non_my_kid: true,
          price_non_my_senior: true,
          price_non_my_oku: true,
        },
      }),
      foodIds.length
        ? prisma.foods.findMany({
            where: { food_id: { in: foodIds } },
            select: { food_id: true, food_name: true, food_price: true },
          })
        : Promise.resolve([]),
      addonIds.length
        ? prisma.addons.findMany({
            where: { addon_id: { in: addonIds } },
            select: {
              addon_id: true,
              addon_name: true,
              addon_desc: true,
              addon_price: true,
              addon_avail: true,
            },
          })
        : Promise.resolve([]),
    ])

    if (packages.length !== packageIds.length) {
      throw new Error("Invalid package selection")
    }

    const unavailablePackage = packages.find((pkg) => !pkg.package_availability)
    if (unavailablePackage) {
      throw new Error(`Selected package is not available: ${unavailablePackage.package_name}`)
    }

    const slot = await prisma.slots.findUnique({
      where: { slot_id: data.slot_id },
      select: { slot_id: true },
    });

    if (!slot) {
      throw new Error("Invalid slot_id: slot not found");
    }

    const packagePriceMap = Object.fromEntries(
      packages.map((pkg) => [
        pkg.package_id,
        {
          package_name: pkg.package_name,
          package_note: pkg.package_note ?? undefined,
          package_features: pkg.package_features,
          package_availability: pkg.package_availability,
          price_my_adult: Number(pkg.price_my_adult),
          price_my_kid: Number(pkg.price_my_kid),
          price_my_senior: Number(pkg.price_my_senior),
          price_my_oku: Number(pkg.price_my_oku),
          price_non_my_adult: Number(pkg.price_non_my_adult),
          price_non_my_kid: Number(pkg.price_non_my_kid),
          price_non_my_senior: Number(pkg.price_non_my_senior),
          price_non_my_oku: Number(pkg.price_non_my_oku),
        },
      ])
    )

    const foodPriceMap = Object.fromEntries(
      foods.map((food) => [
        food.food_id,
        { food_name: food.food_name, food_price: Number(food.food_price) },
      ])
    )

    const addonPriceMap = Object.fromEntries(
      addons.map((addon) => [
        addon.addon_id,
        {
          addon_name: addon.addon_name,
          addon_desc: addon.addon_desc,
          addon_price: Number(addon.addon_price),
          addon_avail: addon.addon_avail,
        },
      ])
    )

    const bookingPrice = calculateBookingTotal(
      data.packages,
      data.foods,
      data.addons,
      packagePriceMap,
      foodPriceMap,
      addonPriceMap
    )

    const paxTotal = calculatePaxTotal(data.packages)


    const updated = await prisma.bookings.update({
      where: {booking_id: data.booking_id},
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
      }
    })

    await prisma.booking_packages.deleteMany({
      where: { booking_id: data.booking_id },
    })

    await prisma.booking_addons.deleteMany({
      where: { booking_id: data.booking_id },
    })

    await prisma.booking_foods.deleteMany({
      where: { booking_id: data.booking_id },
    })

    await prisma.booking_packages.createMany({
      data: data.packages.map((row) => ({
        booking_id: data.booking_id,
        package_id: row.package_id,
        pax_my_adult: row.pax_my_adult,
        pax_my_kid: row.pax_my_kid,
        pax_my_senior: row.pax_my_senior,
        pax_my_oku: row.pax_my_oku,
        pax_non_my_adult: row.pax_non_my_adult,
        pax_non_my_kid: String(row.pax_non_my_kid),
        pax_non_my_senior: row.pax_non_my_senior,
        pax_non_my_oku: row.pax_non_my_oku,
        subtotal: calculatePackageSubtotal(row, packagePriceMap[row.package_id]),
      })),
    })

    if (data.addons.length > 0) {
      await prisma.booking_addons.createMany({
        data: data.addons.map((item) => ({
          booking_id: data.booking_id,
          addon_id: item.addon_id,
          addon_quantity: item.quantity,
        })),
      })
    }

    if (data.foods.length > 0) {
      await prisma.booking_foods.createMany({
        data: data.foods.map((item) => ({
          booking_id: data.booking_id,
          food_id: item.food_id,
          food_quantity: item.quantity,
        })),
      })
    }
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
