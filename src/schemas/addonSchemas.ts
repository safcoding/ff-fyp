import z from "zod"

export const addonSchema = z.object({
  addon_id: z.coerce.number(),
  addon_name: z.string().trim().min(1),
  addon_desc: z.string().trim().min(0),
  addon_price: z.coerce.number().nonnegative(),
  addon_avail: z.boolean(),
})

export const createAddonSchema = addonSchema.omit({addon_id: true})

export const deleteAddonSchema = addonSchema.pick({addon_id: true})