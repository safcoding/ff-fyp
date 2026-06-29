import { createServerFn } from "@tanstack/react-start"
import { prisma } from "@/db"
import { timeServerTask } from "@/lib/server-timing"
import {
  createDiscountSchema,
  deleteDiscountSchema,
  updateDiscountSchema,
} from "@/schemas/discountSchemas"
import { adminOnlyMiddleware } from "@/lib/auth-middleware"

export const getDiscounts = createServerFn({ method: "GET" })
  .middleware([adminOnlyMiddleware])
  .handler(async () => {
    const discounts = await timeServerTask('db.getDiscounts', () =>
      prisma.discounts.findMany({
        orderBy: { discount_id: "asc" },
      }),
    )

    return discounts.map((discount) => ({
      discount_id: discount.discount_id,
      discount_type: discount.discount_type,
      discount_amount: Number(discount.discount_amount),
    }))
  })

export const createDiscount = createServerFn({ method: "POST" })
  .middleware([adminOnlyMiddleware])
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
  .middleware([adminOnlyMiddleware])
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
  .middleware([adminOnlyMiddleware])
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


export function applyDiscount(total: number, discount: { discount_type: "PERCENTAGE" | "FLAT"; discount_amount: unknown } | null) {
  if (!discount) {
    return total
  }

  const amount = Number(discount.discount_amount)
  const discounted =
    discount.discount_type === "PERCENTAGE"
      ? total - total * (amount / 100)
      : total - amount

  return Math.max(0, Number(discounted.toFixed(2)))
}
