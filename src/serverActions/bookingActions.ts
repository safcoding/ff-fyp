import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";
import z from "zod";

const Booking = z.object({
        booking_price: z.number(),
        pax_my_adult: z.number(),   
        pax_my_kid: z.number(),
        pax_my_senior: z.number(),
        pax_my_oku: z.number(),
        pax_non_my_adult: z.number(),
        pax_non_my_kid: z.number(),
        pax_non_my_senior: z.number(),
        pax_non_my_oku: z.number(),
        pic_name: z.string(),
        pic_email: z.email(),
        pic_hp: z.e164(),
        org_address: z.string(),
        org_name: z.string(),
        org_state: z.string(),
        org_type: z.string(),
        quotation_id: z.string(),
        slot_id: z.string(),
        package_id: z.string(),
})


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

export const submitForm = createServerFn({ method: 'POST' })
  .inputValidator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Expected FormData')
    }

    return {
      name: data.get('name')?.toString() || '',
      email: data.get('email')?.toString() || '',
    }
  })
  .handler(async ({ data }) => {
    // Process form data
    return { success: true }
  })