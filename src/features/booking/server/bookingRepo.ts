import { prisma } from '@/db'
import { bookingsInclude } from './bookingMapper'
import type { BookingInput, BookingStatusGroup } from '@/schemas/bookingSchemas'
import type { prepareBookingWriteData } from './utils/prepData'
import type { booking_status as BookingStatus } from '@/generated/prisma/enums'

type BookingWriteData = Awaited<ReturnType<typeof prepareBookingWriteData>>

type ReplaceBookingWithItemsInput = BookingWriteData & {
  booking_id: string
  data: BookingInput
}

export const loadAllBookings = async () => {
  return prisma.bookings.findMany({
    include: bookingsInclude,
    orderBy: [{ created_at: 'desc' }],
  })
}

const bookingStatusWhere = (
  statusGroup: BookingStatusGroup,
) => {
  if (statusGroup === 'pending') {
    return { booking_status: 'PENDING' as BookingStatus }
  }

  if (statusGroup === 'completed') {
    return { booking_status: 'APPROVED' as BookingStatus }
  }

  if (statusGroup === 'other') {
    return {
      booking_status: {
        in: ['POSTPONED', 'CANCELLED'] as Array<BookingStatus>,
      },
    }
  }

  return {}
}

export const loadBookingsPage = async ({
  statusGroup,
  page,
  pageSize,
}: {
  statusGroup: BookingStatusGroup
  page: number
  pageSize: number
}) => {
  const where = bookingStatusWhere(statusGroup)
  const skip = (page - 1) * pageSize

  const [bookings, total, pending, completed, other, all] = await Promise.all([
    prisma.bookings.findMany({
      where,
      include: bookingsInclude,
      orderBy: [{ created_at: 'desc' }],
      skip,
      take: pageSize,
    }),
    prisma.bookings.count({ where }),
    prisma.bookings.count({ where: { booking_status: 'PENDING' } }),
    prisma.bookings.count({ where: { booking_status: 'APPROVED' } }),
    prisma.bookings.count({
      where: { booking_status: { in: ['POSTPONED', 'CANCELLED'] } },
    }),
    prisma.bookings.count(),
  ])

  return {
    bookings,
    total,
    counts: {
      pending,
      completed,
      other,
      all,
    },
  }
}

export const loadBookingsForMonth = async (month: string) => {
  const start = new Date(`${month}-01T00:00:00.000Z`)
  const end = new Date(start)
  end.setUTCMonth(end.getUTCMonth() + 1)

  return prisma.bookings.findMany({
    where: {
      booking_date: {
        gte: start,
        lt: end,
      },
    },
    include: bookingsInclude,
    orderBy: [{ booking_date: 'asc' }, { created_at: 'asc' }],
  })
}

export const loadBookingID = async (data: { booking_id: string }) => {
  return prisma.bookings.findUnique({
    where: { booking_id: data.booking_id },
    include: bookingsInclude,
  })
}

export const updateBookingStatusById = async (
  booking_id: string,
  booking_status: BookingStatus,
) => {
  return prisma.bookings.update({
    where: { booking_id },
    data: { booking_status },
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
