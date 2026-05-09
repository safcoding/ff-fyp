import z from "zod";
import { booking_status, states, org_categories } from "@/generated/prisma/enums";

export const bookingAddonSchema = z.object({
  addon_id: z.coerce.number(),
  quantity: z.coerce.number().int().min(0),
})

export const bookingFoodSchema = z.object({
  food_id: z.coerce.number(),
  quantity: z.coerce.number().int().min(20),
})

export const bookingPackagesSchema = z.object({
        package_id: z.string(),
        pax_my_adult: z.coerce.number().int().min(0),
        pax_my_kid: z.coerce.number().int().min(0),
        pax_my_senior: z.coerce.number().int().min(0),
        pax_my_oku: z.coerce.number().int().min(0),
        pax_non_my_adult: z.coerce.number().int().min(0),
        pax_non_my_kid: z.coerce.number().int().min(0),
        pax_non_my_senior: z.coerce.number().int().min(0),
        pax_non_my_oku: z.coerce.number().int().min(0),

})

export const bookingSchema = z.object({
        booking_id: z.string(),
        booking_price: z.number(),
        discount_code: z.string(),

        pax_total: z.number().int().min(20),
        booking_status: z.enum(booking_status),
        booking_date: z.coerce.date(),
        
        pic_name: z.string().trim().min(1),
        pic_email: z.string().trim().email(),
        pic_hp: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/),

        org_address: z.string().trim().min(1),
        org_name: z.string().trim().min(1),
        org_state: z.enum(states),
        org_type: z.enum(org_categories),

        slot_id: z.string().min(1),
        packages: z.array(bookingPackagesSchema).default([]),
        addons: z.array(bookingAddonSchema).default([]),
        foods: z.array(bookingFoodSchema).default([]),
})

export const createBookingSchema = bookingSchema.omit({
    booking_id: true,
    booking_status: true,
    discount_code: true,
    booking_price: true,
    pax_total: true,
})

export const bookingIdSchema = z.object({
  booking_id: z.string().trim().min(1),
})

export const availabilitySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
})

export type BookingPackageInput = z.infer<typeof bookingPackagesSchema>
export type BookingFoodInput = z.infer<typeof bookingFoodSchema>
export type BookingAddonInput = z.infer<typeof bookingAddonSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type BookingFormInput = CreateBookingInput | BookingInput
