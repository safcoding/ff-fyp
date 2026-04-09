import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";
import z from "zod";

const BookingSchema = z.object({
        booking_price: z.number().min(1).positive(),
        pax_my_adult: z.number().min(1).positive(),
        pax_my_kid: z.number().min(1).positive(),
        pax_my_senior: z.number().min(1).positive(),
        pax_my_oku: z.number().min(1).positive(),
        pax_non_my_adult: z.number().min(1).positive(),
        pax_non_my_kid: z.number().min(1).positive(),
        pax_non_my_senior: z.number().min(1).positive(),
        pax_non_my_oku: z.number().min(1).positive(),
        pic_name: z.string().min(1),
        pic_email: z.email().min(1),
        pic_hp: z.e164().min(1),
        org_address: z.string().min(1),
        org_name: z.string().min(1),
        org_state: z.string().min(1),
        org_type: z.string().min(1),
        quotation_id: z.string().min(1),
        slot_id: z.string().min(1),
        package_id: z.string().min(1),
})

export type BookingInput = z.infer<typeof BookingSchema>

export const getBookings = createServerFn({method: 'GET'}).handler(async () => {
    const bookings = await prisma.bookings.findMany()
    return bookings.map(b => ({
        booking_price: b.booking_price.toString(),
        pax_my_adult: b.pax_my_adult,      
        pax_my_kid: b.pax_my_kid,       
        pax_my_senior: b.pax_my_senior,   
        pax_my_oku: b.pax_my_oku,
        pax_non_my_adult: b.pax_non_my_adult,
        pax_non_my_kid: b.pax_non_my_kid,
        pax_non_my_senior: b.pax_non_my_senior,
        pax_non_my_oku: b.pax_non_my_oku,
        pic_name: b.pic_name,
        pic_email: b.pic_email,
        pic_hp: b.pic_hp,
        org_address: b.org_address, 
        org_name: b.org_name,
        org_state: b.org_state,
        org_type: b.org_type,
        quotation_id: b.quotation_id,
        slot_id : b.slot_id,
        package_id : b.package_id, 
    }))
})

export const createBooking = createServerFn({ method: 'POST' })
  .inputValidator(BookingSchema)
  .handler(async ({ data }) => {
    const newBooking = await prisma.bookings.create({
      data: {
        booking_price: data.booking_price,
        pax_my_adult: data.pax_my_adult,
        pax_my_kid: data.pax_my_kid,
        pax_my_senior: data.pax_my_senior,
        pax_my_oku: data.pax_my_oku,
        pax_non_my_adult: data.pax_non_my_adult,
        pax_non_my_kid: data.pax_non_my_kid,
        pax_non_my_senior: data.pax_non_my_senior,
        pax_non_my_oku: data.pax_non_my_oku,
        pic_name: data.pic_name,
        pic_email: data.pic_email,
        pic_hp: data.pic_hp,
        org_address: data.org_address,
        org_name: data.org_name,
        org_state: data.org_state,
        org_type: data.org_type,
        quotation_id: data.quotation_id,
        slot_id: data.slot_id,
        package_id: data.package_id,
      }
    });
    return `Created booking for ${newBooking.pic_name} with email ${newBooking.pic_email}`;
  })