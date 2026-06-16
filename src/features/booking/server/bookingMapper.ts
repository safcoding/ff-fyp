import { Prisma } from '@/generated/prisma/client'
import { calculatePaxBreakdown } from './utils/pax-calculation'
import type { ExtraBookingData } from './bookingTypes'

export const bookingsInclude = {
  booking_addons: {
    select: {
      addon_id: true,
      addon_quantity: true,
      addons: { select: { addon_name: true, addon_price: true } },
    },
  },
  booking_foods: {
    select: {
      food_id: true,
      food_quantity: true,
      foods: { select: { food_name: true, food_price: true } },
      subtotal: true,
    },
  },
  booking_packages: {
    select: {
      package_id: true,
      selected_activity: true,
      pax_my_adult: true,
      pax_my_kid: true,
      pax_my_senior: true,
      pax_my_oku: true,
      pax_non_my_adult: true,
      pax_non_my_kid: true,
      pax_non_my_senior: true,
      pax_non_my_oku: true,
      subtotal: true,
      package_activities: {
        select: {
          activity_id: true,
          activity_name: true,
        },
      },
      packages: {
        select: {
          package_name: true,
          package_features: true,
          price_my_adult: true,
          price_my_kid: true,
          price_my_senior: true,
          price_my_oku: true,
          price_non_my_adult: true,
          price_non_my_kid: true,
          price_non_my_senior: true,
          price_non_my_oku: true,
        },
      },
    },
  },
  slots: {
    select: {
      slot_name: true,
      slot_type: true,
    },
  },
  discounts: {
    select: {
      discount_id: true,
      discount_type: true,
      discount_amount: true,
    },
  },
} satisfies Prisma.bookingsInclude

export type BookingWithRelations = Prisma.bookingsGetPayload<{
  include: typeof bookingsInclude
}>

export const mapBookingToUi = (b: BookingWithRelations) => {
  const packages = b.booking_packages.map((p) => ({
    package_id: p.package_id,
    selected_activity: p.selected_activity ?? null,
    selected_activity_name: p.package_activities?.activity_name ?? null,
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
    price_my_adult: Number(p.packages?.price_my_adult ?? 0),
    price_my_kid: Number(p.packages?.price_my_kid ?? 0),
    price_my_senior: Number(p.packages?.price_my_senior ?? 0),
    price_my_oku: Number(p.packages?.price_my_oku ?? 0),
    price_non_my_adult: Number(p.packages?.price_non_my_adult ?? 0),
    price_non_my_kid: Number(p.packages?.price_non_my_kid ?? 0),
    price_non_my_senior: Number(p.packages?.price_non_my_senior ?? 0),
    price_non_my_oku: Number(p.packages?.price_non_my_oku ?? 0),
  }))

  const paxTotals = calculatePaxBreakdown(packages)
  const packageId = packages[0]?.package_id ?? null

  return {
    booking_id: b.booking_id,
    booking_price: b.booking_price.toString(),
    created_at: b.created_at,
    assigned_guide_count: b.assigned_guide_count,
    booking_date: b.booking_date,
    booking_status: b.booking_status,
    discount_id: b.discount_id,
    discount_type: b.discounts?.discount_type ?? null,
    discount_amount: b.discounts ? Number(b.discounts.discount_amount) : null,
    slot_id: b.slot_id,
    slot_name: b.slots?.slot_name ?? null,
    slot_type: b.slots?.slot_type ?? null,
    package_id: packageId,
    pax_total: b.pax_total,
    pic_name: b.pic_name,
    pic_email: b.pic_email,
    pic_hp: b.pic_hp,
    org_address: b.org_address,
    org_name: b.org_name,
    org_state: b.org_state,
    org_type: b.org_type,
    event_name: b.event_name,
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
      price: Number(a.addons.addon_price),
    })),
    booking_foods: b.booking_foods.map((f) => ({
      food_id: f.food_id,
      food_name: f.foods.food_name,
      food_quantity: f.food_quantity,
      price: Number(f.foods.food_price),
      subtotal: f.subtotal === null ? null : Number(f.subtotal),
    })),
  }
}

export const buildBookingPriceMaps = (related: ExtraBookingData) => {
  const packagePriceMap = Object.fromEntries(
    related.packages.map((pkg) => [
      pkg.package_id,
      {
        package_name: pkg.package_name,
        package_note: pkg.package_note ?? undefined,
        package_features: pkg.package_features,
        package_availability: pkg.package_availability,
        minimum_pax: pkg.minimum_pax,
        price_my_adult: Number(pkg.price_my_adult),
        price_my_kid: Number(pkg.price_my_kid),
        price_my_senior: Number(pkg.price_my_senior),
        price_my_oku: Number(pkg.price_my_oku),
        price_non_my_adult: Number(pkg.price_non_my_adult),
        price_non_my_kid: Number(pkg.price_non_my_kid),
        price_non_my_senior: Number(pkg.price_non_my_senior),
        price_non_my_oku: Number(pkg.price_non_my_oku),
      },
    ]),
  )

  const foodPriceMap = Object.fromEntries(
    related.foods.map((food) => [
      food.food_id,
      {
        food_id: food.food_id,
        food_name: food.food_name,
        food_price: Number(food.food_price),
      },
    ]),
  )

  const addonPriceMap = Object.fromEntries(
    related.addons.map((addon) => [
      addon.addon_id,
      {
        addon_id: addon.addon_id,
        addon_name: addon.addon_name,
        addon_desc: addon.addon_desc,
        addon_price: Number(addon.addon_price),
        addon_avail: addon.addon_avail,
      },
    ]),
  )

  return {
    packagePriceMap,
    foodPriceMap,
    addonPriceMap,
  }
}
