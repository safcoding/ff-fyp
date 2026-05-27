import { prisma } from '@/db'
import { bookingsInclude } from './bookingMapper'
import type { BookingInput } from '@/schemas/bookingSchemas'
import type { prepareBookingWriteData } from './utils/prepData'

type BookingWriteData = Awaited<ReturnType<typeof prepareBookingWriteData>>

type ReplaceBookingWithItemsInput = BookingWriteData & {
  booking_id: string
  data: BookingInput
}

export const loadAllBookings = async () => {
  return prisma.bookings.findMany({ include: bookingsInclude })
}

export const loadBookingID = async (data: { booking_id: string }) => {
  return prisma.bookings.findUnique({
    where: { booking_id: data.booking_id },
    include: bookingsInclude,
  })
}

const fetchOptional = async <T>(
  ids: any[],
  query: () => Promise<T[]>,
): Promise<T[]> => {
  return ids.length > 0 ? query() : []
}

export const loadRelated = async (data: {
  packages: Array<{ package_id: string }>
  foods: Array<{ food_id: number }>
  addons: Array<{ addon_id: number }>
}) => {
  const packageIds = Array.from(
    new Set(data.packages.map((pkg) => pkg.package_id)),
  )
  const foodIds = Array.from(
    new Set(data.foods.map((food) => Number(food.food_id))),
  )
  const addonIds = Array.from(
    new Set(data.addons.map((addon) => Number(addon.addon_id))),
  )

  const [packages, foods, addons] = await Promise.all([
    prisma.packages.findMany({ where: { package_id: { in: packageIds } } }),
    fetchOptional(foodIds, () =>
      prisma.foods.findMany({ where: { food_id: { in: foodIds } } }),
    ),
    fetchOptional(addonIds, () =>
      prisma.addons.findMany({ where: { addon_id: { in: addonIds } } }),
    ),
  ])

  return { packages, foods, addons }
}

export const replaceBookingWithItems = async ({
  data,
  bookingPrice,
  paxTotal,
  assignedGuideCount,
  packageRows,
  foodRows,
  addonRows,
}: ReplaceBookingWithItemsInput) => {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.bookings.update({
      where: { booking_id: data.booking_id },
      data: {
        booking_price: bookingPrice,
        pax_total: paxTotal,
        assigned_guide_count: assignedGuideCount,
        pic_name: data.pic_name,
        pic_email: data.pic_email,
        pic_hp: data.pic_hp,
        org_address: data.org_address,
        event_name: data.event_name,
        org_name: data.org_name,
        org_state: data.org_state,
        org_type: data.org_type,
        booking_date: data.booking_date,
        slot_id: data.slot_id,
      },
    })

    await tx.booking_packages.deleteMany({
      where: { booking_id: data.booking_id },
    })

    await tx.booking_addons.deleteMany({
      where: { booking_id: data.booking_id },
    })

    await tx.booking_foods.deleteMany({
      where: { booking_id: data.booking_id },
    })

    await tx.booking_packages.createMany({
      data: packageRows.map((row) => ({
        booking_id: data.booking_id,
        ...row,
      })),
    })

    if (addonRows.length > 0) {
      await tx.booking_addons.createMany({
        data: addonRows.map((row) => ({
          booking_id: data.booking_id,
          ...row,
        })),
      })
    }

    if (foodRows.length > 0) {
      await tx.booking_foods.createMany({
        data: foodRows.map((row) => ({
          booking_id: data.booking_id,
          ...row,
        })),
      })
    }

    return booking
  })
}
