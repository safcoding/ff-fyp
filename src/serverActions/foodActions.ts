import { createServerFn } from "@tanstack/react-start"
import z from "zod"

import { prisma } from "@/db"

const foodSchema = z.object({
  food_name: z.string().trim().min(1),
  food_price: z.coerce.number().nonnegative(),
})

export const getFoods = createServerFn({ method: "GET" }).handler(async () => {
  const foods = await prisma.foods.findMany({ orderBy: { food_name: "asc" } })

  return foods.map((food) => ({
    food_id: food.food_id,
    food_name: food.food_name,
    food_price: Number(food.food_price),
  }))
})

export const createFood = createServerFn({ method: "POST" })
  .inputValidator(foodSchema)
  .handler(async ({ data }) => {
    const created = await prisma.foods.create({
      data: {
        food_name: data.food_name,
        food_price: data.food_price,
      },
    })

    return `Created food ${created.food_name}`
  })
