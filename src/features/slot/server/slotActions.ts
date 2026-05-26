import { createServerFn } from "@tanstack/react-start"
import { prisma } from "@/db"
import { toHHmm } from "@/lib/utils"
import { deleteSlotSchema, slotSchema } from "@/schemas/slotSchemas"
import { toIsoDateTimeForTimeColumn } from "@/lib/utils"
  export const getSlots = createServerFn({ method: "GET" }).handler(async () => {
    const slots = await prisma.slots.findMany({
      select: {
        slot_id: true,
        slot_name: true,
        slot_capacity: true,
        slot_type: true
      },
      orderBy: { slot_name: "asc" },
    });
  
    return slots;
  });

export const getSlotsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const slots = await prisma.slots.findMany({ orderBy: { slot_name: "asc" } })

  return slots.map((slot) => ({
    slot_id: slot.slot_id,
    slot_name: slot.slot_name,
    slot_start: toHHmm(slot.slot_start),
    slot_end: toHHmm(slot.slot_end),
    slot_capacity: slot.slot_capacity,
    slot_type: slot.slot_type
  }))
})

export const createSlot = createServerFn({ method: "POST" })
  .inputValidator(slotSchema)
  .handler(async ({ data }) => {
    const created = await prisma.slots.create({
      data: {
        slot_id: data.slot_id,
        slot_name: data.slot_name,
        slot_start: toIsoDateTimeForTimeColumn(data.slot_start),
        slot_end: toIsoDateTimeForTimeColumn(data.slot_end),
        slot_capacity: data.slot_capacity,
        slot_type: data.slot_type
      },
    })

    return `Created slot ${created.slot_name}`
  })

export const updateSlot = createServerFn({ method: "POST" })
  .inputValidator(slotSchema)
  .handler(async ({ data }) => {
    const updated = await prisma.slots.update({
      where: { slot_id: data.slot_id },
      data: {
        slot_name: data.slot_name,
        slot_start: toIsoDateTimeForTimeColumn(data.slot_start),
        slot_end: toIsoDateTimeForTimeColumn(data.slot_end),
        slot_capacity: data.slot_capacity,
        slot_type: data.slot_type
      },
    })
    return `Updated slot ${updated.slot_name}`
  })

export const deleteSlot = createServerFn({ method: "POST" })
  .inputValidator(deleteSlotSchema)
  .handler(async ({ data }) => {
    const deleted = await prisma.slots.delete({
      where: { slot_id: data.slot_id },
    })
    return `Deleted slot ${deleted.slot_name}`
  })

