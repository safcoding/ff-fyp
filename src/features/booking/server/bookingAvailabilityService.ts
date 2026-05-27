import { prisma } from '@/db'
import { toHHmm } from '@/lib/utils'
import type { day_type, slot_types } from '@/generated/prisma/enums'

type SlotSchedule = {
  day_type: day_type
  start_time: Date
  end_time: Date
}

type AvailabilitySlot = {
  slot_id: string
  slot_name: string
  slot_start: Date
  slot_end: Date
  slot_capacity: number
  slot_type: slot_types | null
  slot_schedules: SlotSchedule[]
}

export const getDayTypeForDate = (date: string | Date): day_type => {
  const dateKey =
    typeof date === 'string' ? date : date.toISOString().slice(0, 10)
  const [year, month, day] = dateKey.split('-').map(Number)
  const dayOfWeek = new Date(Date.UTC(year, month - 1, day)).getUTCDay()

  return dayOfWeek === 0 || dayOfWeek === 6 ? 'WEEKEND' : 'WEEKDAY'
}

export const getSlotTimeForDate = (
  slot: AvailabilitySlot,
  date: string | Date,
) => {
  if (slot.slot_type !== 'UNGUIDED') {
    return {
      start: slot.slot_start,
      end: slot.slot_end,
    }
  }

  const dayType = getDayTypeForDate(date)
  const schedule = slot.slot_schedules.find((item) => item.day_type === dayType)

  if (!schedule) {
    return null
  }

  return {
    start: schedule.start_time,
    end: schedule.end_time,
  }
}

export const getBookingAvailabilityForMonth = async (data: {
  month: string
  date?: string
}) => {
  const [year, month] = data.month.split('-').map(Number)
  const monthStart = new Date(Date.UTC(year, month - 1, 1))
  const nextMonthStart = new Date(Date.UTC(year, month, 1))

  const [slots, monthBookings] = await Promise.all([
    prisma.slots.findMany({
      orderBy: { slot_name: 'asc' },
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
    }),
    prisma.bookings.findMany({
      where: {
        booking_date: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        booking_date: true,
        booking_status: true,
        slot_id: true,
        pax_total: true,
      },
    }),
  ])

  const activeBookings = monthBookings.filter((booking) => {
    const status = (booking.booking_status ?? '').toUpperCase()
    return status !== 'CANCELLED'
  })

  const bookedByDateAndSlot = new Map<string, Map<string, number>>()

  for (const booking of activeBookings) {
    if (!booking.booking_date) {
      continue
    }

    const dateKey = booking.booking_date.toISOString().slice(0, 10)
    const visitors = booking.pax_total ?? 0
    const slotMap =
      bookedByDateAndSlot.get(dateKey) ?? new Map<string, number>()

    slotMap.set(booking.slot_id, (slotMap.get(booking.slot_id) ?? 0) + visitors)
    bookedByDateAndSlot.set(dateKey, slotMap)
  }

  const dateStatuses: Record<string, 'full' | 'limited' | 'available'> = {}

  for (
    let cursor = new Date(monthStart);
    cursor < nextMonthStart;
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  ) {
    const dateKey = cursor.toISOString().slice(0, 10)
    const slotMap =
      bookedByDateAndSlot.get(dateKey) ?? new Map<string, number>()

    const availableSlots = slots.filter((slot) => {
      const slotTime = getSlotTimeForDate(slot, dateKey)
      const booked = slotMap.get(slot.slot_id) ?? 0

      return slotTime && booked < slot.slot_capacity
    })

    if (availableSlots.length === 0) {
      dateStatuses[dateKey] = 'full'
    } else if (availableSlots.length <= Math.ceil(slots.length / 3)) {
      dateStatuses[dateKey] = 'limited'
    } else {
      dateStatuses[dateKey] = 'available'
    }
  }

  const fullyBookedDates = Object.entries(dateStatuses)
    .filter(([, status]) => status === 'full')
    .map(([date]) => date)

  const slotsForDate = data.date
    ? slots.flatMap((slot) => {
        const slotTime = getSlotTimeForDate(slot, data.date!)

        if (!slotTime) {
          return []
        }

        const booked =
          bookedByDateAndSlot.get(data.date!)?.get(slot.slot_id) ?? 0
        const remaining = Math.max(slot.slot_capacity - booked, 0)

        return [
          {
            slot_id: slot.slot_id,
            slot_name: slot.slot_name,
            slot_type: slot.slot_type,
            slot_start: toHHmm(slotTime.start),
            slot_end: toHHmm(slotTime.end),
            slot_capacity: slot.slot_capacity,
            booked_visitors: booked,
            remaining_capacity: remaining,
            is_full: remaining <= 0,
          },
        ]
      })
    : []

  return {
    month: data.month,
    selected_date: data.date ?? null,
    fully_booked_dates: fullyBookedDates,
    date_statuses: dateStatuses,
    slots_for_date: slotsForDate,
  }
}
