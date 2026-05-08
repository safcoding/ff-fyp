import z from "zod"
import { bookingPackagesSchema, bookingFoodSchema, bookingAddonSchema} from "@/schemas/booking"
import { packageSchema } from "@/serverActions/packageActions"
import { foodSchema } from "@/serverActions/foodActions"
import { addonSchema } from "@/serverActions/addonActions"

type PackageRow = z.infer<typeof bookingPackagesSchema>
type FoodRow = z.infer<typeof bookingFoodSchema>
type AddonRow = z.infer<typeof bookingAddonSchema>

type PackagePrice = z.infer<typeof packageSchema>
type FoodPrice = z.infer<typeof foodSchema>
type AddonPrice = z.infer<typeof addonSchema>

type PackagePriceMap = Record<string, PackagePrice>
type FoodPriceMap = Record<number, FoodPrice>
type AddonPriceMap = Record<number, AddonPrice>

type PaxTotals = {
  pax_my_adult: number
  pax_my_kid: number
  pax_my_senior: number
  pax_my_oku: number
  pax_non_my_adult: number
  pax_non_my_kid: number
  pax_non_my_senior: number
  pax_non_my_oku: number
}



export const calculatePackageSubtotal = (
  pax: PackageRow,
  price: PackagePrice
): number => {
  return ( 
    price.price_my_adult * pax.pax_my_adult +
    price.price_my_kid * pax.pax_my_kid +
    price.price_my_oku * pax.pax_my_oku +
    price.price_my_senior * pax.pax_my_senior +
    price.price_non_my_adult * pax.pax_non_my_adult +
    price.price_non_my_kid * pax.pax_non_my_kid +
    price.price_non_my_senior * pax.pax_non_my_senior +
    price.price_non_my_oku * pax.pax_non_my_oku
              );
}

export const calculateFoodSubtotal = (
  quantity: FoodRow,
  food: FoodPrice
):number => {
  return (quantity.quantity * food.food_price);
}

export const calculateAddonSubtotal = (
  quantity: AddonRow,
  addon: AddonPrice
):number => {
  return (quantity.quantity * addon.addon_price);
}

export const calculateBookingTotal =(
  packageRows: PackageRow[],
  foodRows: FoodRow[],
  addonRows: AddonRow[],
  packagePrices: PackagePriceMap,
  foodPrices: FoodPriceMap,
  addonPrices: AddonPriceMap
):number => {
  const packagesTotal = packageRows.reduce((sum, row) => {
    const price = packagePrices[row.package_id]
    if (!price) return sum
    return sum + calculatePackageSubtotal(row, price)
  }, 0)

  const foodsTotal = foodRows.reduce((sum, row) => {
    const price = foodPrices[row.food_id]
    if (!price) return sum
    return sum + calculateFoodSubtotal(row, price)
  }, 0)

  const addonsTotal = addonRows.reduce((sum, row) => {
    const price = addonPrices[row.addon_id]
    if (!price) return sum
    return sum + calculateAddonSubtotal(row, price)
  }, 0)

  return packagesTotal + foodsTotal + addonsTotal
}

export const calculatePaxTotal = (packageRows: PackageRow[]): number => {
  const totals = calculatePaxBreakdown(packageRows)
  return (
    totals.pax_my_adult +
    totals.pax_my_kid +
    totals.pax_my_senior +
    totals.pax_my_oku +
    totals.pax_non_my_adult +
    totals.pax_non_my_kid +
    totals.pax_non_my_senior +
    totals.pax_non_my_oku
  )
}

export const calculatePaxBreakdown = (packageRows: PackageRow[]): PaxTotals => {
  return packageRows.reduce((sum, row) => {
    return {
      pax_my_adult: sum.pax_my_adult + row.pax_my_adult,
      pax_my_kid: sum.pax_my_kid + row.pax_my_kid,
      pax_my_senior: sum.pax_my_senior + row.pax_my_senior,
      pax_my_oku: sum.pax_my_oku + row.pax_my_oku,
      pax_non_my_adult: sum.pax_non_my_adult + row.pax_non_my_adult,
      pax_non_my_kid: sum.pax_non_my_kid + row.pax_non_my_kid,
      pax_non_my_senior: sum.pax_non_my_senior + row.pax_non_my_senior,
      pax_non_my_oku: sum.pax_non_my_oku + row.pax_non_my_oku,
    }
  }, {
    pax_my_adult: 0,
    pax_my_kid: 0,
    pax_my_senior: 0,
    pax_my_oku: 0,
    pax_non_my_adult: 0,
    pax_non_my_kid: 0,
    pax_non_my_senior: 0,
    pax_non_my_oku: 0,
  })
}