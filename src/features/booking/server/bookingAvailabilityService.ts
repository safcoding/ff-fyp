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
  const today = new Date()
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))

  const [slots, monthBookings, monthBlocks, settings] = await Promise.all([
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
    prisma.booking_blocks.findMany({
      where: {
        block_date: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
      select: {
        block_date: true,
        slot_id: true,
        reason: true,
      },
    }),
    prisma.global_settings.findFirst({
      orderBy: { id: 'asc' },
      select: { min_lead_days: true },
    }),
  ])

  const minLeadDays = Math.max(settings?.min_lead_days ?? 14, 0)
  const minBookingDate = new Date(todayUtc)
  minBookingDate.setUTCDate(minBookingDate.getUTCDate() + minLeadDays)
  const minBookingDateKey = minBookingDate.toISOString().slice(0, 10)

  const activeBookings = monthBookings.filter((booking) => {
    const status = (booking.booking_status ?? '').toUpperCase()
    return status !== 'CANCELLED'
  })

  const bookedByDateAndSlot = new Map<string, Map<string, number>>()
  const blockedDates = new Set<string>()
  const blockedSlotsByDate = new Map<string, Map<string, string | null>>()

  for (const block of monthBlocks) {
    const dateKey = block.block_date.toISOString().slice(0, 10)
    if (!block.slot_id) {
      blockedDates.add(dateKey)
      continue
    }

    const slotMap = blockedSlotsByDate.get(dateKey) ?? new Map<string, string | null>()
    slotMap.set(block.slot_id, block.reason ?? null)
    blockedSlotsByDate.set(dateKey, slotMap)
  }

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
    const blockedSlots = blockedSlotsByDate.get(dateKey) ?? new Map<string, string | null>()
    const isLeadTimeBlocked = cursor < minBookingDate

    const availableSlots = slots.filter((slot) => {
      if (blockedDates.has(dateKey) || isLeadTimeBlocked) {
        return false
      }
      if (blockedSlots.has(slot.slot_id)) {
        return false
      }
      const slotTime = getSlotTimeForDate(slot, dateKey)
      const booked = slotMap.get(slot.slot_id) ?? 0

      return slotTime && booked < slot.slot_capacity
    })

    if (blockedDates.has(dateKey) || isLeadTimeBlocked) {
      dateStatuses[dateKey] = 'full'
    } else if (availableSlots.length === 0) {
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
        const selectedDate = new Date(`${data.date!}T00:00:00Z`)
        const isLeadTimeBlocked = selectedDate < minBookingDate
        const blockedReason = isLeadTimeBlocked
          ? `Bookings require at least ${minLeadDays} days notice.`
          : blockedDates.has(data.date!)
            ? 'Blocked by admin'
            : blockedSlotsByDate.get(data.date!)?.get(slot.slot_id) ?? null
        const isBlocked = Boolean(blockedReason)

        return [
          {
            slot_id: slot.slot_id,
            slot_name: slot.slot_name,
            slot_type: slot.slot_type,
            slot_start: toHHmm(slotTime.start),
            slot_end: toHHmm(slotTime.end),
            slot_capacity: slot.slot_capacity,
            booked_visitors: booked,
            remaining_capacity: isBlocked ? 0 : remaining,
            is_full: isBlocked || remaining <= 0,
            is_blocked: isBlocked,
            blocked_reason: isBlocked ? blockedReason : null,
          },
        ]
      })
    : []

  return {
    month: data.month,
    selected_date: data.date ?? null,
    min_lead_days: minLeadDays,
    min_booking_date: minBookingDateKey,
    fully_booked_dates: fullyBookedDates,
    date_statuses: dateStatuses,
    slots_for_date: slotsForDate,
  }
}
