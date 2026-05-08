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
