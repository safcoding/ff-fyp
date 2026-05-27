import z from 'zod'
import { slot_types } from '@/generated/prisma/enums'

const slotBaseSchema = z.object({
  slot_id: z.string().trim().min(1),
  slot_name: z.string().trim().min(1),
  slot_start: z.iso.time(),
  slot_end: z.iso.time(),
  slot_capacity: z.coerce.number().int().min(1),
  slot_type: z.enum(slot_types),
  weekday_start: z.iso.time().optional(),
  weekday_end: z.iso.time().optional(),
  weekend_start: z.iso.time().optional(),
  weekend_end: z.iso.time().optional(),
})

export const slotSchema = slotBaseSchema
  .refine(
    (data) => data.slot_type === 'UNGUIDED' || data.slot_start < data.slot_end,
    {
      message: 'slot_end must be later than slot_start',
      path: ['slot_end'],
    },
  )
  .superRefine((data, ctx) => {
    if (data.slot_type !== 'UNGUIDED') {
      return
    }

    const scheduleFields = [
      ['weekday_start', data.weekday_start],
      ['weekday_end', data.weekday_end],
      ['weekend_start', data.weekend_start],
      ['weekend_end', data.weekend_end],
    ] as const

    for (const [field, value] of scheduleFields) {
      if (!value) {
        ctx.addIssue({
          code: 'custom',
          message: 'Unguided slots require weekday and weekend visiting times',
          path: [field],
        })
      }
    }

    if (
      data.weekday_start &&
      data.weekday_end &&
      data.weekday_start >= data.weekday_end
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'weekday_end must be later than weekday_start',
        path: ['weekday_end'],
      })
    }

    if (
      data.weekend_start &&
      data.weekend_end &&
      data.weekend_start >= data.weekend_end
    ) {
      ctx.addIssue({
        code: 'custom',
        message: 'weekend_end must be later than weekend_start',
        path: ['weekend_end'],
      })
    }
  })

export const deleteSlotSchema = slotBaseSchema.pick({ slot_id: true })
