import z from "zod"
import { discount_types } from "@/generated/prisma/enums"

export const discountSchema = z.object({
  discount_id: z.string().trim().min(1).transform((value) => value.toUpperCase()),
  discount_type: z.enum(discount_types),
  discount_amount: z.coerce.number().positive(),
})

export const createDiscountSchema = discountSchema.refine(
  (data) => data.discount_type !== "PERCENTAGE" || data.discount_amount <= 100,
  {
    path: ["discount_amount"],
    message: "Percentage discounts cannot exceed 100.",
  }
)

export const updateDiscountSchema = createDiscountSchema

export const deleteDiscountSchema = discountSchema.pick({ discount_id: true })

export const approveBookingSchema = z.object({
  booking_id: z.string().min(1),
  discount_id: z
    .string()
    .trim()
    .transform((value) => value.toUpperCase())
    .optional(),
  staff_comment: z.string().trim().min(1).max(1000).optional(),
})
