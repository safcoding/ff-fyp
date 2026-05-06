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


export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-MY", {
    style: "currency",
    currency: "MYR",
    maximumFractionDigits: 2,
  }).format(value)

export function toHHmm(value: Date | string) {
  if (value instanceof Date) return value.toISOString().slice(11, 16)
  return value.trim().slice(0, 5)
}

export const calculatePaxSubtotal = (
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

export const calculatefoodSubtotal = (
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
    return sum + calculatePaxSubtotal(row, price)
  }, 0)

  const foodsTotal = foodRows.reduce((sum, row) => {
    const price = foodPrices[row.food_id]
    if (!price) return sum
    return sum + calculatefoodSubtotal(row, price)
  }, 0)

  const addonsTotal = addonRows.reduce((sum, row) => {
    const price = addonPrices[row.addon_id]
    if (!price) return sum
    return sum + calculateAddonSubtotal(row, price)
  }, 0)

  return packagesTotal + foodsTotal + addonsTotal
}