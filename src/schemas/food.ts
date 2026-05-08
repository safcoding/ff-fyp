import z from "zod"

export const foodSchema = z.object({
    food_id: z.number(),
  food_name: z.string().trim().min(1),
  food_price: z.coerce.number().nonnegative(),
})