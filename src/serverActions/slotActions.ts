import { createServerFn } from "@tanstack/react-start"
import z from "zod"

import { prisma } from "@/db"

const slotSchema = z
  .object({
    slot_id: z.string().trim().min(1),
    slot_name: z.string().trim().min(1),
    slot_start: z.iso.time(),
    slot_end: z.iso.time(),
    slot_capacity: z.coerce.number().int().min(1),
  })
  .refine((data) => data.slot_start < data.slot_end, {
    message: "slot_end must be later than slot_start",
    path: ["slot_end"],
  })

function toHHmm(value: Date | string) {
  if (value instanceof Date) return value.toISOString().slice(11, 16)
  const raw = value.trim()
  return raw.slice(0, 5) // handles "09:00" or "09:00:00"
}

export const getSlotsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const slots = await prisma.slots.findMany({ orderBy: { slot_name: "asc" } })

  return slots.map((slot) => ({
    slot_id: slot.slot_id,
    slot_name: slot.slot_name,
    slot_start: toHHmm(slot.slot_start),
    slot_end: toHHmm(slot.slot_end),
    slot_capacity: slot.slot_capacity,
  }))
})

export const createSlot = createServerFn({ method: "POST" })
  .inputValidator(slotSchema)
  .handler(async ({ data }) => {
    const created = await prisma.slots.create({
      data: {
        slot_id: data.slot_id,
        slot_name: data.slot_name,
        slot_start: toHHmm(data.slot_start),
        slot_end: toHHmm(data.slot_end),
        slot_capacity: data.slot_capacity,
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
        slot_start: toHHmm(data.slot_start),
        slot_end: toHHmm(data.slot_end),
        slot_capacity: data.slot_capacity,
      },
    })
    return `Updated slot ${updated.slot_name}`
  })

export const deleteSlot = createServerFn({ method: "POST" })
  .inputValidator(z.object({ slot_id: z.string().trim().min(1) }))
  .handler(async ({ data }) => {
    const deleted = await prisma.slots.delete({
      where: { slot_id: data.slot_id },
    })
    return `Deleted slot ${deleted.slot_name}`
  })