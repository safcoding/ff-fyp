import { prisma } from "@/db"
import { bookingsInclude } from "../mappers/bookingMapper"

export const loadAllBookings = async () => {
  return prisma.bookings.findMany({ include: bookingsInclude })
}

export const loadBookingID = async (data: { booking_id: string }) => {
  return prisma.bookings.findUnique({
    where: { booking_id: data.booking_id },
    include: bookingsInclude,
  })
}

export const loadPricing = (data: {
  packages: Array <{package_id: string}>
  foods: Array <{food_id: string}>
  addons: Array <{addon_id: string}>
}) => {}