import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";
import z from "zod";

const BookingSchema = z.object({
        pax_my_adult: z.coerce.number().int().min(0),
        pax_my_kid: z.coerce.number().int().min(0),
        pax_my_senior: z.coerce.number().int().min(0),
        pax_my_oku: z.coerce.number().int().min(0),
        pax_non_my_adult: z.coerce.number().int().min(0),
        pax_non_my_kid: z.coerce.number().int().min(0),
        pax_non_my_senior: z.coerce.number().int().min(0),
        pax_non_my_oku: z.coerce.number().int().min(0),
        pic_name: z.string().trim().min(1),
        pic_email: z.string().trim().email(),
        pic_hp: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/),
        org_address: z.string().trim().min(1),
        org_name: z.string().trim().min(1),
        org_state: z.string().trim().min(1),
        org_type: z.string().trim().min(1).max(20),
        booking_date: z.coerce.date(),
        slot_id: z.string().min(1),
        package_id: z.string().min(1),
})

const AvailabilitySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

const secretBookingSchema = BookingSchema.extend({
  booking_id: z.uuid(),
  booking_status: z.string()
})

export type BookingInput = z.infer<typeof BookingSchema>

function toHHmm(value: Date | string) {
  if (value instanceof Date) return value.toISOString().slice(11, 16)
  return value.trim().slice(0, 5)
}

function getBookingVisitorCount(booking: {
  pax_my_adult: number
  pax_my_kid: number
  pax_my_senior: number
  pax_my_oku: number
  pax_non_my_adult: number
  pax_non_my_kid: number
  pax_non_my_senior: number
  pax_non_my_oku: number
}) {
  return (
    booking.pax_my_adult +
    booking.pax_my_kid +
    booking.pax_my_senior +
    booking.pax_my_oku +
    booking.pax_non_my_adult +
    booking.pax_non_my_kid +
    booking.pax_non_my_senior +
    booking.pax_non_my_oku
  )
}

const calculateBookingPrice = (
  data: BookingInput,
  packagePricing: {
    price_my_adult: unknown;
    price_my_kid: unknown;
    price_my_senior: unknown;
    price_my_oku: unknown;
    price_non_my_adult: unknown;
    price_non_my_kid: unknown;
    price_non_my_senior: unknown;
    price_non_my_oku: unknown;
  },
) => {
  const total =
    data.pax_my_adult * Number(packagePricing.price_my_adult) +
    data.pax_my_kid * Number(packagePricing.price_my_kid) +
    data.pax_my_senior * Number(packagePricing.price_my_senior) +
    data.pax_my_oku * Number(packagePricing.price_my_oku) +
    data.pax_non_my_adult * Number(packagePricing.price_non_my_adult) +
    data.pax_non_my_kid * Number(packagePricing.price_non_my_kid) +
    data.pax_non_my_senior * Number(packagePricing.price_non_my_senior) +
    data.pax_non_my_oku * Number(packagePricing.price_non_my_oku);

  return total;
};

export const getBookings = createServerFn({method: 'GET'}).handler(async () => {
    const bookings = await prisma.bookings.findMany()
    return bookings.map(b => ({
      
    booking_id: b.booking_id,
        booking_price: b.booking_price.toString(),
        pax_my_adult: b.pax_my_adult,      
        pax_my_kid: b.pax_my_kid,       
        pax_my_senior: b.pax_my_senior,   
        pax_my_oku: b.pax_my_oku,
        pax_non_my_adult: b.pax_non_my_adult,
        pax_non_my_kid: b.pax_non_my_kid,
        pax_non_my_senior: b.pax_non_my_senior,
        pax_non_my_oku: b.pax_non_my_oku,
        pic_name: b.pic_name,
        pic_email: b.pic_email,
        pic_hp: b.pic_hp,
        org_address: b.org_address, 
        org_name: b.org_name,
        org_state: b.org_state,
        org_type: b.org_type,
        booking_date: b.booking_date,
        quotation_id: b.quotation_id,
        slot_id : b.slot_id,
        package_id : b.package_id, 
        booking_status: b.booking_status
    }))
})

export const getSlots = createServerFn({ method: "GET" }).handler(async () => {
  const slots = await prisma.slots.findMany({
    select: {
      slot_id: true,
      slot_name: true,
      slot_capacity: true,
    },
    orderBy: { slot_name: "asc" },
  });

  return slots;
});

export const getBookingAvailability = createServerFn({ method: "POST" })
  .inputValidator(AvailabilitySchema)
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
          pax_my_adult: true,
          pax_my_kid: true,
          pax_my_senior: true,
          pax_my_oku: true,
          pax_non_my_adult: true,
          pax_non_my_kid: true,
          pax_non_my_senior: true,
          pax_non_my_oku: true,
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
      const visitors = getBookingVisitorCount(booking)

      const slotMap = bookedByDateAndSlot.get(dateKey) ?? new Map<string, number>()
      slotMap.set(booking.slot_id, (slotMap.get(booking.slot_id) ?? 0) + visitors)
      bookedByDateAndSlot.set(dateKey, slotMap)
    }

    const fullyBookedDates = Array.from(bookedByDateAndSlot.entries())
      .filter(([, slotMap]) =>
        slots.every((slot) => {
          const booked = slotMap.get(slot.slot_id) ?? 0
          return booked >= slot.slot_capacity
        }),
      )
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
      slots_for_date: slotsForDate,
    }
  })

export const createBooking = createServerFn({ method: 'POST' })
  .inputValidator(BookingSchema)
  .handler(async ({ data }) => {
    const selectedPackage = await prisma.packages.findUnique({
      where: { package_id: data.package_id },
      select: {
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
    });

    if (!selectedPackage) {
      throw new Error("Invalid package_id: package not found");
    }

    if (!selectedPackage.package_availability) {
      throw new Error("Selected package is not available");
    }

    const slot = await prisma.slots.findUnique({
      where: { slot_id: data.slot_id },
      select: { slot_id: true },
    });

    if (!slot) {
      throw new Error("Invalid slot_id: slot not found");
    }

    const bookingPrice = calculateBookingPrice(data, selectedPackage);

    const newBooking = await prisma.bookings.create({
      data: {
        booking_price: bookingPrice,
        pax_my_adult: data.pax_my_adult,
        pax_my_kid: data.pax_my_kid,
        pax_my_senior: data.pax_my_senior,
        pax_my_oku: data.pax_my_oku,
        pax_non_my_adult: data.pax_non_my_adult,
        pax_non_my_kid: data.pax_non_my_kid,
        pax_non_my_senior: data.pax_non_my_senior,
        pax_non_my_oku: data.pax_non_my_oku,
        pic_name: data.pic_name,
        pic_email: data.pic_email,
        pic_hp: data.pic_hp,
        org_address: data.org_address,
        org_name: data.org_name,
        org_state: data.org_state,
        org_type: data.org_type,
        booking_date: data.booking_date,
        slot_id: data.slot_id,
        package_id: data.package_id,
      }
    });
    return `Created booking for ${newBooking.pic_name} with email ${newBooking.pic_email}. Total price: ${newBooking.booking_price.toString()}`;
  })

  export const updateBooking = createServerFn({method: "POST"})
  .inputValidator(secretBookingSchema)
  .handler(async ({data}) => {

    const selectedPackage = await prisma.packages.findUnique({
      where: { package_id: data.package_id },
      select: {
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
    });

    if (!selectedPackage) {
      throw new Error("Invalid package_id: package not found");
    }

    if (!selectedPackage.package_availability) {
      throw new Error("Selected package is not available");
    }

    const slot = await prisma.slots.findUnique({
      where: { slot_id: data.slot_id },
      select: { slot_id: true },
    });

    if (!slot) {
      throw new Error("Invalid slot_id: slot not found");
    }

    const bookingPrice = calculateBookingPrice(data, selectedPackage);


    const updated = await prisma.bookings.update({
      where: {booking_id: data.booking_id},
      data: {
        booking_price: bookingPrice,
        pax_my_adult: data.pax_my_adult,
        pax_my_kid: data.pax_my_kid,
        pax_my_senior: data.pax_my_senior,
        pax_my_oku: data.pax_my_oku,
        pax_non_my_adult: data.pax_non_my_adult,
        pax_non_my_kid: data.pax_non_my_kid,
        pax_non_my_senior: data.pax_non_my_senior,
        pax_non_my_oku: data.pax_non_my_oku,
        pic_name: data.pic_name,
        pic_email: data.pic_email,
        pic_hp: data.pic_hp,
        org_address: data.org_address,
        org_name: data.org_name,
        org_state: data.org_state,
        org_type: data.org_type,
        booking_date: data.booking_date,
        slot_id: data.slot_id,
        package_id: data.package_id,
      }
    })
    return `Updated Booking ${updated.booking_id}`
  })


  const BookingIDSchema = z.object({
  booking_id: z.uuid(),
})

  export const deleteBooking = createServerFn({ method: "POST" })
    .inputValidator(BookingIDSchema)
    .handler(async ({ data }) => {
      const deleted = await prisma.bookings.delete({
        where: {booking_id: data.booking_id },
      })

      return `Deleted booking ${deleted.booking_id}`
    })

export const approveBooking = createServerFn({ method: "POST" })
  .inputValidator(BookingIDSchema)
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
  