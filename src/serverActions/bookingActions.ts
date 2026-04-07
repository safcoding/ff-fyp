import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";


export const getBookings = createServerFn({method: 'GET'}).handler(async () => {
    const bookings = await prisma.bookings.findMany()
    return bookings.map(b => ({
        booking_id: b.booking_id,
        booking_price: b.booking_price.toString(),
        pax_total: b.pax_total,
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

export const createBookings = createServerFn({method: 'POST'}).handler(async () => {
    const booking = await prisma.bookings.create({
        data: {
        }
    })
})