import { createServerFn } from "@tanstack/react-start"
import { prisma } from "@/db"
import {
  createDiscountSchema,
  deleteDiscountSchema,
  updateDiscountSchema,
} from "@/schemas/discountSchemas"

export const getDiscounts = createServerFn({ method: "GET" }).handler(async () => {
  const discounts = await prisma.discounts.findMany({
    orderBy: { discount_id: "asc" },
  })

  return discounts.map((discount) => ({
    discount_id: discount.discount_id,
    discount_type: discount.discount_type,
    discount_amount: Number(discount.discount_amount),
  }))
})

export const createDiscount = createServerFn({ method: "POST" })
  .inputValidator(createDiscountSchema)
  .handler(async ({ data }) => {
    const created = await prisma.discounts.create({
      data: {
        discount_id: data.discount_id,
        discount_type: data.discount_type,
        discount_amount: data.discount_amount,
      },
    })

    return `Created discount ${created.discount_id}`
  })

export const updateDiscount = createServerFn({ method: "POST" })
  .inputValidator(updateDiscountSchema)
  .handler(async ({ data }) => {
    const updated = await prisma.discounts.update({
      where: { discount_id: data.discount_id },
      data: {
        discount_type: data.discount_type,
        discount_amount: data.discount_amount,
      },
    })

    return `Updated discount ${updated.discount_id}`
  })

export const deleteDiscount = createServerFn({ method: "POST" })
  .inputValidator(deleteDiscountSchema)
  .handler(async ({ data }) => {
    try {
      const deleted = await prisma.discounts.delete({
        where: { discount_id: data.discount_id },
      })

      return `Deleted discount ${deleted.discount_id}`
    } catch {
      throw new Error("This discount cannot be deleted because it is referenced by existing bookings.")
    }
  })
