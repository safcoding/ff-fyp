import { prisma } from '@/db'
import type { BookingFormInput } from '@/schemas/bookingSchemas'
import { buildBookingPriceMaps } from '../bookingMapper'
import { loadRelated } from '../bookingRepo'
import { validateBooking } from './validation'
import {
  calculateAddonSubtotal,
  calculateBookingTotal,
  calculateFoodSubtotal,
  calculatePackageSubtotal,
} from './price-calculation'
import { calculatePaxTotal } from './pax-calculation'
import { calculateAssignedGuideCount } from './guide-assignment'
import { getSlotTimeForDate } from '../bookingAvailabilityService'

export const prepareBookingWriteData = async (data: BookingFormInput) => {
  const related = await loadRelated(data)

  validateBooking(data, related)

  const slot = await prisma.slots.findUnique({
    where: { slot_id: data.slot_id },
    select: {
      slot_id: true,
      slot_name: true,
      slot_start: true,
      slot_end: true,
      slot_capacity: true,
      slot_type: true,
      slot_schedules: {
        select: {
          day_type: true,
          start_time: true,
          end_time: true,
        },
      },
    },
  })

  if (!slot) {
    throw new Error('Invalid slot_id: slot not found')
  }

  if (!getSlotTimeForDate(slot, data.booking_date)) {
    throw new Error('Selected unguided slot is not available on this date.')
  }

  const { packagePriceMap, foodPriceMap, addonPriceMap } =
    buildBookingPriceMaps(related)

  const packageRows = data.packages.map((row) => ({
    package_id: row.package_id,
    pax_my_adult: row.pax_my_adult,
    pax_my_kid: row.pax_my_kid,
    pax_my_senior: row.pax_my_senior,
    pax_my_oku: row.pax_my_oku,
    pax_non_my_adult: row.pax_non_my_adult,
    pax_non_my_kid: row.pax_non_my_kid,
    pax_non_my_senior: row.pax_non_my_senior,
    pax_non_my_oku: row.pax_non_my_oku,
    subtotal: calculatePackageSubtotal(row, packagePriceMap[row.package_id]),
  }))

  const foodRows = data.foods.map((row) => ({
    food_id: row.food_id,
    food_quantity: row.quantity,
    subtotal: calculateFoodSubtotal(row, foodPriceMap[row.food_id]),
  }))

  const addonRows = data.addons.map((row) => ({
    addon_id: row.addon_id,
    addon_quantity: row.quantity,
    subtotal: calculateAddonSubtotal(row, addonPriceMap[row.addon_id]),
  }))

  const bookingPrice = calculateBookingTotal(
    data.packages,
    data.foods,
    data.addons,
    packagePriceMap,
    foodPriceMap,
    addonPriceMap,
  )

  const paxTotal = calculatePaxTotal(data.packages)
  const assignedGuideCount =
    slot.slot_type === 'GUIDED' ? calculateAssignedGuideCount(paxTotal) : null

  return {
    bookingPrice,
    paxTotal,
    assignedGuideCount,
    packageRows,
    foodRows,
    addonRows,
  }
}
