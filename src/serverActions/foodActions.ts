import { createServerFn } from "@tanstack/react-start"
import { prisma } from "@/db"
import { foodSchema } from "@/schemas/food"


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

export const updateFood = createServerFn({ method: "POST" })
  .inputValidator(foodSchema)
  .handler(async ({ data }) => {
    const updated = await prisma.foods.update({
      where: { food_id: data.food_id },
      data: {
        food_name: data.food_name,
        food_price: data.food_price,
      },
    })

    return `Updated food ${updated.food_name}`
  })

export const deleteFood = createServerFn({ method: "POST" })
  .inputValidator(foodSchema)
  .handler(async ({ data }) => {
    const deleted = await prisma.foods.delete({
      where: { food_id: data.food_id },
    })

    return `Deleted food ${deleted.food_name}`
  })
