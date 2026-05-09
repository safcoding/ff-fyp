import type { BookingFormInput } from "@/schemas/bookingSchemas"
import { buildBookingPriceMaps } from "../bookingMapper"
import { loadRelated } from "../bookingRepo"
import { validateBooking } from "./validation"
import {
  calculateAddonSubtotal,
  calculateBookingTotal,
  calculateFoodSubtotal,
  calculatePackageSubtotal,
} from "./price-calculation"
import { calculatePaxTotal } from "./pax-calculation"

export const prepareBookingWriteData = async (data: BookingFormInput) => {
  const related = await loadRelated(data)

  validateBooking(data, related)

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
    addonPriceMap
  )

  const paxTotal = calculatePaxTotal(data.packages)

  return {
    bookingPrice,
    paxTotal,
    packageRows,
    foodRows,
    addonRows,
  }
}
