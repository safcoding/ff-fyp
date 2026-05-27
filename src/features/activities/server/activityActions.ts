import { createServerFn } from "@tanstack/react-start"
import { prisma } from "@/db"
import { activitySchema, createActivitySchema, deleteActivitySchema } from "@/schemas/activitySchemas"

export const getActivities = createServerFn({ method: "GET" }).handler(async () => {
  const activities = await prisma.activities.findMany({ orderBy: { activity_id: "asc" } })

  return activities.map((activity) => ({
    activity_id: activity.activity_id,
    activity_name: activity.activity_name,
    activity_desc: activity.activity_desc,
    is_active: activity.is_active,
  }))
})

export const createActivity = createServerFn({ method: "POST" })
  .inputValidator(createActivitySchema)
  .handler(async ({ data }) => {
    const created = await prisma.activities.create({
      data: {
        activity_name: data.activity_name,
        activity_desc: data.activity_desc,
        is_active: data.is_active,
      },
    })

    return `Created addon ${created.activity_name}`
  })



export const updateActivity = createServerFn({ method: "POST" })
  .inputValidator(activitySchema)
  .handler(async ({ data }) => {
    const updated = await prisma.activities.update({
      where: { activity_id: data.activity_id },
      data: {
        activity_name: data.activity_name,
        activity_desc: data.activity_desc,
        is_active: data.is_active,
      },
    })

    return `Updated addon ${updated.activity_name}`
  })

export const deleteAddon = createServerFn({ method: "POST" })
  .inputValidator(deleteActivitySchema)
  .handler(async ({ data }) => {
    const deleted = await prisma.activities.delete({
      where: { activity_id: data.activity_id },
    })

    return `Deleted addon ${deleted.activity_name}`
  })
