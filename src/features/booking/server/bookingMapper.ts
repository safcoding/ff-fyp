import { Prisma } from "@/generated/prisma/client"
import { calculatePaxBreakdown } from "@/features/booking/server/utils/price-calculation"

export const bookingsInclude = {
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
        },
      },
    },
  },
  slots: {
    select: {
      slot_name: true,
    },
  },
} satisfies Prisma.bookingsInclude

export type BookingWithRelations = Prisma.bookingsGetPayload<{
  include: typeof bookingsInclude
}>

export const mapBooking = (b: BookingWithRelations) => {
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
    subtotal: p.subtotal === null ? null : Number(p.subtotal),
    package_name: p.packages?.package_name ?? null,
    package_features: p.packages?.package_features ?? [],
  }))

  const paxTotals = calculatePaxBreakdown(packages)
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
