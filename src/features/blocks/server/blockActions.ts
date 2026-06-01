import { createServerFn } from '@tanstack/react-start'
import { prisma } from '@/db'
import { createBlockSchema, deleteBlockSchema } from '@/schemas/blockSchemas'
import authMiddleware from '@/lib/auth-middleware'

const toDateKey = (value: Date) => value.toISOString().slice(0, 10)

export const getBlocks = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(async () => {
    const blocks = await prisma.booking_blocks.findMany({
      orderBy: [{ block_date: 'desc' }, { slot_id: 'asc' }],
      include: {
        slots: { select: { slot_name: true } },
      },
    })

    return blocks.map((block) => ({
      id: block.id,
      block_date: toDateKey(block.block_date),
      slot_id: block.slot_id,
      slot_name: block.slots?.slot_name ?? null,
      reason: block.reason ?? null,
    }))
  })

export const createBlock = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(createBlockSchema)
  .handler(async ({ data }) => {
    const blockDate = new Date(`${data.block_date}T00:00:00Z`)
    const slotId = data.slot_id?.trim() ? data.slot_id.trim() : null

    await prisma.booking_blocks.create({
      data: {
        block_date: blockDate,
        slot_id: slotId,
        reason: data.reason?.trim() || null,
      },
    })

    return 'Block created'
  })

export const deleteBlock = createServerFn({ method: 'POST' })
  .middleware([authMiddleware])
  .inputValidator(deleteBlockSchema)
  .handler(async ({ data }) => {
    await prisma.booking_blocks.delete({
      where: { id: data.id },
    })

    return 'Block removed'
  })
