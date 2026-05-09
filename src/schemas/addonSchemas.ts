import z from "zod"

export const addonSchema = z.object({
  addon_name: z.string().trim().min(1),
  addon_id: z.coerce.number(),
  addon_desc: z.string().trim().min(0),
  addon_price: z.coerce.number().nonnegative(),
  addon_avail: z.boolean(),
})