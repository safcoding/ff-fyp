import { createServerFn } from "@tanstack/react-start"
import z from "zod"

import { prisma } from "@/db"

const addonSchema = z.object({
  addon_name: z.string().trim().min(1),
  addon_desc: z.string().trim().min(1),
  addon_price: z.coerce.number().nonnegative(),
  addon_avail: z.boolean(),
})

const secretAddonSchema = addonSchema.extend({
  addon_id: z.coerce.number(),
})

export const getAddons = createServerFn({ method: "GET" }).handler(async () => {
  const addons = await prisma.addons.findMany({ orderBy: { addon_name: "asc" } })

  return addons.map((addon) => ({
    addon_id: addon.addon_id,
    addon_name: addon.addon_name,
    addon_desc: addon.addon_desc,
    addon_price: Number(addon.addon_price),
    addon_avail: addon.addon_avail,
  }))
})

export const createAddon = createServerFn({ method: "POST" })
  .inputValidator(addonSchema)
  .handler(async ({ data }) => {
    const created = await prisma.addons.create({
      data: {
        addon_name: data.addon_name,
        addon_desc: data.addon_desc,
        addon_price: data.addon_price,
        addon_avail: data.addon_avail,
      },
    })

    return `Created addon ${created.addon_name}`
  })



export const updateAddon = createServerFn({ method: "POST" })
  .inputValidator(secretAddonSchema)
  .handler(async ({ data }) => {
    const updated = await prisma.addons.update({
      where: { addon_id: data.addon_id },
      data: {
        addon_name: data.addon_name,
        addon_desc: data.addon_desc,
        addon_price: data.addon_price,
        addon_avail: data.addon_avail,
      },
    })

    return `Updated addon ${updated.addon_name}`
  })

export const deleteAddon = createServerFn({ method: "POST" })
  .inputValidator(secretAddonSchema)
  .handler(async ({ data }) => {
    const deleted = await prisma.addons.delete({
      where: { addon_id: data.addon_id },
    })

    return `Deleted addon ${deleted.addon_name}`
  })
