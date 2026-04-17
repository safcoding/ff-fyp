import { createServerFn } from "@tanstack/react-start"
import z from "zod"

import { prisma } from "@/db"

const slotSchema = z
  .object({
    slot_id: z.string().trim().min(1),
    slot_name: z.string().trim().min(1),
    slot_start: z.string().trim().regex(/^\d{2}:\d{2}$/),
    slot_end: z.string().trim().regex(/^\d{2}:\d{2}$/),
    slot_capacity: z.coerce.number().int().min(1),
  })
  .refine((data) => data.slot_start < data.slot_end, {
    message: "slot_end must be later than slot_start",
    path: ["slot_end"],
  })

function toTimeIso(time: string) {
  return new Date(`1970-01-01T${time}:00.000Z`)
}

export const getSlotsAdmin = createServerFn({ method: "GET" }).handler(async () => {
  const slots = await prisma.slots.findMany({ orderBy: { slot_name: "asc" } })

  return slots.map((slot) => ({
    slot_id: slot.slot_id,
    slot_name: slot.slot_name,
    slot_start: slot.slot_start.toISOString().slice(11, 16),
    slot_end: slot.slot_end.toISOString().slice(11, 16),
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
        slot_start: toTimeIso(data.slot_start),
        slot_end: toTimeIso(data.slot_end),
        slot_capacity: data.slot_capacity,
      },
    })

    return `Created slot ${created.slot_name}`
  })
