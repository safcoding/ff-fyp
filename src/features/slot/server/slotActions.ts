import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { toHHmm, toIsoDateTimeForTimeColumn } from '@/lib/utils'
import { deleteSlotSchema, slotSchema } from '@/schemas/slotSchemas'
import authMiddleware from '@/lib/auth-middleware'

const buildUnguidedSchedules = (data: {
  slot_id: string
  slot_type: 'GUIDED' | 'UNGUIDED'
  weekday_start?: string
  weekday_end?: string
  weekend_start?: string
  weekend_end?: string
}) => {
  if (data.slot_type !== 'UNGUIDED') {
    return []
  }

  return [
    {
      slot_id: data.slot_id,
      day_type: 'WEEKDAY' as const,
      start_time: toIsoDateTimeForTimeColumn(data.weekday_start!),
      end_time: toIsoDateTimeForTimeColumn(data.weekday_end!),
    },
    {
      slot_id: data.slot_id,
      day_type: 'WEEKEND' as const,
      start_time: toIsoDateTimeForTimeColumn(data.weekend_start!),
      end_time: toIsoDateTimeForTimeColumn(data.weekend_end!),
    },
  ]
}

const getStoredSlotTime = (data: {
  slot_type: 'GUIDED' | 'UNGUIDED'
  slot_start: string
  slot_end: string
  weekday_start?: string
  weekday_end?: string
}) => {
  if (data.slot_type === 'UNGUIDED') {
    return {
      slot_start: data.weekday_start!,
      slot_end: data.weekday_end!,
    }
  }

  return {
    slot_start: data.slot_start,
    slot_end: data.slot_end,
  }
}

export const getSlots = createServerFn({ method: 'GET' }).handler(async () => {
  const slots = await prisma.slots.findMany({
    select: {
      slot_id: true,
      slot_name: true,
      slot_capacity: true,
      slot_type: true,
    },
    orderBy: { slot_name: 'asc' },
  })

  return slots
})

export const getSlotsAdmin = createServerFn({ method: 'GET' }).handler(
  async () => {
    const slots = await prisma.slots.findMany({
      orderBy: { slot_name: 'asc' },
      include: {
        slot_schedules: true,
      },
    })

    return slots.map((slot) => {
      const weekdaySchedule = slot.slot_schedules.find(
        (schedule) => schedule.day_type === 'WEEKDAY',
      )
      const weekendSchedule = slot.slot_schedules.find(
        (schedule) => schedule.day_type === 'WEEKEND',
      )

      return {
        slot_id: slot.slot_id,
        slot_name: slot.slot_name,
        slot_start: toHHmm(slot.slot_start),
        slot_end: toHHmm(slot.slot_end),
        slot_capacity: slot.slot_capacity,
        slot_type: slot.slot_type,
        weekday_start: weekdaySchedule
          ? toHHmm(weekdaySchedule.start_time)
          : '',
        weekday_end: weekdaySchedule ? toHHmm(weekdaySchedule.end_time) : '',
        weekend_start: weekendSchedule
          ? toHHmm(weekendSchedule.start_time)
          : '',
        weekend_end: weekendSchedule ? toHHmm(weekendSchedule.end_time) : '',
      }
    })
  },
)

export const createSlot = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(slotSchema)
  .handler(async ({ data }) => {
    const created = await prisma.$transaction(async (tx) => {
      const storedSlotTime = getStoredSlotTime(data)

      const slot = await tx.slots.create({
        data: {
          slot_id: data.slot_id,
          slot_name: data.slot_name,
          slot_start: toIsoDateTimeForTimeColumn(storedSlotTime.slot_start),
          slot_end: toIsoDateTimeForTimeColumn(storedSlotTime.slot_end),
          slot_capacity: data.slot_capacity,
          slot_type: data.slot_type,
        },
      })

      const schedules = buildUnguidedSchedules(data)
      if (schedules.length > 0) {
        await tx.slot_schedules.createMany({ data: schedules })
      }

      return slot
    })

    return `Created slot ${created.slot_name}`
  })

export const updateSlot = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(slotSchema)
  .handler(async ({ data }) => {
    const updated = await prisma.$transaction(async (tx) => {
      const storedSlotTime = getStoredSlotTime(data)

      const slot = await tx.slots.update({
        where: { slot_id: data.slot_id },
        data: {
          slot_name: data.slot_name,
          slot_start: toIsoDateTimeForTimeColumn(storedSlotTime.slot_start),
          slot_end: toIsoDateTimeForTimeColumn(storedSlotTime.slot_end),
          slot_capacity: data.slot_capacity,
          slot_type: data.slot_type,
        },
      })

      await tx.slot_schedules.deleteMany({
        where: { slot_id: data.slot_id },
      })

      const schedules = buildUnguidedSchedules(data)
      if (schedules.length > 0) {
        await tx.slot_schedules.createMany({ data: schedules })
      }

      return slot
    })
    return `Updated slot ${updated.slot_name}`
  })

export const deleteSlot = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteSlotSchema)
  .handler(async ({ data }) => {
    const deleted = await prisma.slots.delete({
      where: { slot_id: data.slot_id },
    })
    return `Deleted slot ${deleted.slot_name}`
  })
