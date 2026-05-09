import { prisma } from "@/db"
import { bookingsInclude } from "./bookingMapper"

export const loadAllBookings = async () => {
  return prisma.bookings.findMany({ include: bookingsInclude })
}

export const loadBookingID = async (data: { booking_id: string }) => {
  return prisma.bookings.findUnique({
    where: { booking_id: data.booking_id },
    include: bookingsInclude,
  })
}

const fetchOptional = async <T>(ids: any[], query: () => Promise<T[]>): Promise<T[]> =>{
  return ids.length > 0? query():[];
}

export const loadPricing = async (data: {
  packages: Array <{package_id: string}>
  foods: Array <{food_id: string}>
  addons: Array <{addon_id: string}>
}) => {
  const packageIds = Array.from(new Set(data.packages.map((pkg) => pkg.package_id)))
  const foodIds = Array.from(new Set(data.foods.map((food) => Number(food.food_id))))
  const addonIds = Array.from(new Set(data.addons.map((addon) => Number(addon.addon_id))))

    const [packages, foods, addons] = await Promise.all([
      prisma.packages.findMany({where: {package_id: {in: packageIds}}}),
      fetchOptional(foodIds, () => prisma.foods.findMany({where: {food_id: {in:foodIds}}})),
      fetchOptional(addonIds, () =>prisma.addons.findMany({where: {addon_id: {in:addonIds}}})),
    ])

  return {packages, foods, addons}
}