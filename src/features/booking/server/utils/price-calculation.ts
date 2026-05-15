import z from "zod"
import { bookingPackagesSchema, bookingFoodSchema, bookingAddonSchema} from "@/schemas/bookingSchemas"
import { packageSchema } from "@/schemas/packageSchemas"
import { foodSchema } from "@/schemas/foodSchemas"
import { addonSchema } from "@/schemas/addonSchemas"

type PackageRow = z.infer<typeof bookingPackagesSchema>
type FoodRow = z.infer<typeof bookingFoodSchema>
type AddonRow = z.infer<typeof bookingAddonSchema>

type PackagePrice = Pick<
  z.infer<typeof packageSchema>,
  | "price_my_adult"
  | "price_my_kid"
  | "price_my_senior"
  | "price_my_oku"
  | "price_non_my_adult"
  | "price_non_my_kid"
  | "price_non_my_senior"
  | "price_non_my_oku"
>
type FoodPrice = Pick<z.infer<typeof foodSchema>, "food_price">
type AddonPrice = Pick<z.infer<typeof addonSchema>, "addon_price">

type PackagePriceMap = Record<string, PackagePrice>
type FoodPriceMap = Record<number, FoodPrice>
type AddonPriceMap = Record<number, AddonPrice>

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
