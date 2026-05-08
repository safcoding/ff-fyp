import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";
import { Prisma } from "@/generated/prisma/client";
import * as schema from "@/schemas/booking";
import { calculateBookingTotal, calculatePaxSubtotal } from "@/lib/utils/booking/booking-utils";
import z from "zod";

const bookingIdSchema = z.object({
  booking_id: z.string().trim().min(1),
})

const availabilitySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

const bookingsInclude = {
  booking_addons: {
    select: {
      addon_id: true,
      addon_quantity: true,
      addons: { select: { addon_name: true } },
    },
  },
  booking_foods: {
    select: {
      food_id: true,
      food_quantity: true,
      foods: { select: { food_name: true } },
    },
  },
  booking_packages: {
    select: {
      package_id: true,
      pax_my_adult: true,
      pax_my_kid: true,
      pax_my_senior: true,
      pax_my_oku: true,
      pax_non_my_adult: true,
      pax_non_my_kid: true,
      pax_non_my_senior: true,
      pax_non_my_oku: true,
      subtotal: true,
      packages: {
        select: {
          package_name: true,
          package_features: true,
        }
      }
    },
  },

  slots: {
    select: {
      slot_name: true,
    },
  },
} satisfies Prisma.bookingsInclude

type BookingWithRelations = Prisma.bookingsGetPayload<{
  include: typeof bookingsInclude
}>

const mapBooking = (b: BookingWithRelations) => {
  const packages = b.booking_packages.map((p) => ({
    package_id: p.package_id,
    pax_my_adult: p.pax_my_adult ?? 0,
    pax_my_kid: p.pax_my_kid ?? 0,
    pax_my_senior: p.pax_my_senior ?? 0,
    pax_my_oku: p.pax_my_oku ?? 0,
    pax_non_my_adult: p.pax_non_my_adult ?? 0,
    pax_non_my_kid: Number(p.pax_non_my_kid ?? 0),
    pax_non_my_senior: p.pax_non_my_senior ?? 0,
    pax_non_my_oku: p.pax_non_my_oku ?? 0,
    subtotal: p.subtotal,
    package_name: p.packages?.package_name ?? null,
    package_features: p.packages?.package_features ?? [],
  }))

  const paxTotals = packages.reduce(
    (totals, row) => {
      return {
        pax_my_adult: totals.pax_my_adult + row.pax_my_adult,
        pax_my_kid: totals.pax_my_kid + row.pax_my_kid,
        pax_my_senior: totals.pax_my_senior + row.pax_my_senior,
        pax_my_oku: totals.pax_my_oku + row.pax_my_oku,
        pax_non_my_adult: totals.pax_non_my_adult + row.pax_non_my_adult,
        pax_non_my_kid: totals.pax_non_my_kid + row.pax_non_my_kid,
        pax_non_my_senior: totals.pax_non_my_senior + row.pax_non_my_senior,
        pax_non_my_oku: totals.pax_non_my_oku + row.pax_non_my_oku,
      }
    },
    {
      pax_my_adult: 0,
      pax_my_kid: 0,
      pax_my_senior: 0,
      pax_my_oku: 0,
      pax_non_my_adult: 0,
      pax_non_my_kid: 0,
      pax_non_my_senior: 0,
      pax_non_my_oku: 0,
    }
  )

  const packageId = packages[0]?.package_id ?? null

  return {
    booking_id: b.booking_id,
    booking_price: b.booking_price.toString(),
    booking_date: b.booking_date,
    booking_status: b.booking_status,
    quotation_id: b.quotation_id,
    slot_id: b.slot_id,
    slot_name: b.slots?.slot_name ?? null,
    package_id: packageId,
    pax_total: b.pax_total,
    pic_name: b.pic_name,
    pic_email: b.pic_email,
    pic_hp: b.pic_hp,
    org_address: b.org_address,
    org_name: b.org_name,
    org_state: b.org_state,
    org_type: b.org_type,
    pax_my_adult: paxTotals.pax_my_adult,
    pax_my_kid: paxTotals.pax_my_kid,
    pax_my_senior: paxTotals.pax_my_senior,
    pax_my_oku: paxTotals.pax_my_oku,
    pax_non_my_adult: paxTotals.pax_non_my_adult,
    pax_non_my_kid: paxTotals.pax_non_my_kid,
    pax_non_my_senior: paxTotals.pax_non_my_senior,
    pax_non_my_oku: paxTotals.pax_non_my_oku,
    packages,
    booking_addons: b.booking_addons.map((a) => ({
      addon_id: a.addon_id,
      addon_name: a.addons.addon_name,
      addon_quantity: a.addon_quantity,
    })),
    booking_foods: b.booking_foods
      ? [
          {
            food_id: b.booking_foods.food_id,
            food_name: b.booking_foods.foods.food_name,
            food_quantity: b.booking_foods.food_quantity,
          },
        ]
      : [],
  }
}

const loadAllBookings = async () => {
  return prisma.bookings.findMany({ include: bookingsInclude })
}

const loadBookingID = async (data: { booking_id: string }) => {
  return prisma.bookings.findUnique({
    where: { booking_id: data.booking_id },
    include: bookingsInclude,
  })
}

export const getBookings = createServerFn({ method: "GET" }).handler(async () => {
  const bookings = await loadAllBookings()
  return bookings.map(mapBooking)
})




/*
type Booking = z.infer<typeof schema.bookingSchema>

const loadAllBookings = async () => {
  return await prisma.bookings.findMany({
      include: {
        booking_addons: {
          select: {
            addon_quantity: true,
            addons: {
              select: {
                addon_name: true,
              }
            }
          }
        },
        booking_foods: {
          select: {
            food_quantity: true,
            foods: {
              select: {
                food_name: true,
              }
            }
          },
        },
        booking_packages: {
          select: {
            pax_my_adult: true,     
            pax_my_kid: true,   
            pax_my_senior: true,     
            pax_my_oku: true,        
            pax_non_my_adult: true,  
            pax_non_my_kid: true,    
            pax_non_my_senior: true, 
            pax_non_my_oku: true,    
            subtotal: true
          },
        },
        packages: {
          select: {
            package_name: true,
            package_features: true
          }
        },
        slots: {
          select: {
            slot_name: true
          }
        }
      }
    })
}

const loadBookingID = async (data: Booking) => {
  return await prisma.bookings.findUnique({
      where: { booking_id: data.booking_id },
      include: {
        booking_addons: {
          select: {
            addon_quantity: true,
            addons: {
              select: {
                addon_name: true,
              }
            }
          }
        },
        booking_foods: {
          select: {
            food_quantity: true,
            foods: {
              select: {
                food_name: true,
              }
            }
          },
        },
        booking_packages: {
          select: {
            pax_my_adult: true,     
            pax_my_kid: true,   
            pax_my_senior: true,     
            pax_my_oku: true,        
            pax_non_my_adult: true,  
            pax_non_my_kid: true,    
            pax_non_my_senior: true, 
            pax_non_my_oku: true,    
            subtotal: true
          },
        },
        packages: {
          select: {
            package_name: true,
            package_features: true
          }
        },
        slots: {
          select: {
            slot_name: true
          }
        }
      }
    })
}

const mapBooking = (b: Booking) => {
  return {
    id: b.booking_id,
    pax_total: b.pax_total,
    price_total: b.booking_price,
    status: b.booking_status,
    date: b.booking_date,
    
    pic_name: b.pic_name,
    pic_email: b.pic_email,
    pic_hp: b.pic_hp,

    org_name: b.org_name,
    org_type: b.org_type,
    
    
  }
}

//old getBookings 
export const getBookings = createServerFn({method: 'GET'}).handler(async () => {
    const bookings = await prisma.bookings.findMany({
      include: {
        booking_addons: {
          include: {
            addons: {
              select: {
                addon_name: true,
              },
            },
          },
        },
        booking_foods: {
          include: {
            foods: {
              select: {
                food_name: true,
              },
            },
          },
        },
      },
    })

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
        booking_status: b.booking_status,
        booking_addons: b.booking_addons.map((item) => ({
          addon_id: item.addon_id,
          addon_name: item.addons.addon_name,
          addon_quantity: item.addon_quantity,
        })),
        booking_foods: b.booking_foods
          ? [{
              food_id: b.booking_foods.food_id,
              food_name: b.booking_foods.foods.food_name,
              food_quantity: b.booking_foods.food_quantity,
            }]
          : [],
    }))
})
*/
export const getBookingById = createServerFn({ method: "POST" })
  .inputValidator(bookingIdSchema)
  .handler(async ({ data }) => {
    const booking = await prisma.bookings.findUnique({
      where: { booking_id: data.booking_id },
      include: bookingsInclude,
    })

    if (!booking) {
      throw new Error("Booking not found")
    }

    return mapBooking(booking)
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
  .inputValidator(availabilitySchema)
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

    const paxTotal = data.packages.reduce((sum, row) => {
      return (
        sum +
        row.pax_my_adult +
        row.pax_my_kid +
        row.pax_my_senior +
        row.pax_my_oku +
        row.pax_non_my_adult +
        row.pax_non_my_kid +
        row.pax_non_my_senior +
        row.pax_non_my_oku
      )
    }, 0)

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
        subtotal: calculatePaxSubtotal(row, packagePriceMap[row.package_id]),
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

    const paxTotal = data.packages.reduce((sum, row) => {
      return (
        sum +
        row.pax_my_adult +
        row.pax_my_kid +
        row.pax_my_senior +
        row.pax_my_oku +
        row.pax_non_my_adult +
        row.pax_non_my_kid +
        row.pax_non_my_senior +
        row.pax_non_my_oku
      )
    }, 0)


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
        subtotal: calculatePaxSubtotal(row, packagePriceMap[row.package_id]),
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
  