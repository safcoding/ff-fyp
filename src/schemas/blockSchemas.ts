import z from 'zod'

export const blockSchema = z.object({
  id: z.coerce.number().int().min(1),
  block_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  slot_id: z.string().optional().nullable(),
  reason: z.string().trim().max(255).optional().nullable(),
})

export const createBlockSchema = blockSchema.omit({ id: true })

export const deleteBlockSchema = blockSchema.pick({ id: true })
