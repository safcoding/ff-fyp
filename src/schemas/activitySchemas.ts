import z from "zod"

export const activitySchema = z.object({
    activity_id: z.int().min(1),
    activity_name: z.string().min(1, "Name Required"),
    activity_desc: z.string(),
    is_active: z.boolean().default(true),
})

export const deleteActivitySchema = activitySchema.pick({activity_id: true})

export const createActivitySchema = activitySchema.omit({activity_id: true})