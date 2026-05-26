import z from "zod"
import { slot_types } from "@/generated/prisma/enums"

export const slotSchema = z
  .object({
    slot_id: z.string().trim().min(1),
    slot_name: z.string().trim().min(1),
    slot_start: z.iso.time(),
    slot_end: z.iso.time(),
    slot_capacity: z.coerce.number().int().min(1),
    slot_type: z.enum(slot_types),
  })
  .refine((data) => data.slot_start < data.slot_end, {
    message: "slot_end must be later than slot_start",
    path: ["slot_end"],
  })

export const deleteSlotSchema = slotSchema.pick({ slot_id: true })