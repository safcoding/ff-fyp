import { createServerFn } from "@tanstack/react-start";
import { prisma } from "@/db";
import z from "zod";

const paxCountSchema = z.coerce.number().int().min(0);

const BookingSchema = z.object({
        pax_my_adult: paxCountSchema,
        pax_my_kid: paxCountSchema,
        pax_my_senior: paxCountSchema,
        pax_my_oku: paxCountSchema,
        pax_non_my_adult: paxCountSchema,
        pax_non_my_kid: paxCountSchema,
        pax_non_my_senior: paxCountSchema,
        pax_non_my_oku: paxCountSchema,
        pic_name: z.string().trim().min(1),
        pic_email: z.string().trim().email(),
        pic_hp: z.string().trim().regex(/^\+?[1-9]\d{7,14}$/),
        org_address: z.string().trim().min(1),
        org_name: z.string().trim().min(1),
        org_state: z.string().trim().min(1),
        org_type: z.string().trim().length(1),
        booking_date: z.coerce.date(),
        slot_id: z.string().min(1),
        package_id: z.string().min(1),
}).refine((data) => (
    data.pax_my_adult +
    data.pax_my_kid +
    data.pax_my_senior +
    data.pax_my_oku +
    data.pax_non_my_adult +
    data.pax_non_my_kid +
    data.pax_non_my_senior +
    data.pax_non_my_oku
  ) > 0, {
    message: "At least one visitor is required",
    path: ["pax_my_adult"],
  })

export type BookingInput = z.infer<typeof BookingSchema>

const calculateBookingPrice = (
  data: BookingInput,
  packagePricing: {
    price_my_adult: unknown;
    price_my_kid: unknown;
    price_my_senior: unknown;
    price_my_oku: unknown;
    price_non_my_adult: unknown;
    price_non_my_kid: unknown;
    price_non_my_senior: unknown;
    price_non_my_oku: unknown;
  },
) => {
  const total =
    data.pax_my_adult * Number(packagePricing.price_my_adult) +
    data.pax_my_kid * Number(packagePricing.price_my_kid) +
    data.pax_my_senior * Number(packagePricing.price_my_senior) +
    data.pax_my_oku * Number(packagePricing.price_my_oku) +
    data.pax_non_my_adult * Number(packagePricing.price_non_my_adult) +
    data.pax_non_my_kid * Number(packagePricing.price_non_my_kid) +
    data.pax_non_my_senior * Number(packagePricing.price_non_my_senior) +
    data.pax_non_my_oku * Number(packagePricing.price_non_my_oku);

  return total;
};

export const getBookings = createServerFn({method: 'GET'}).handler(async () => {
    const bookings = await prisma.bookings.findMany()
    return bookings.map(b => ({
    booking_id: b.booking_id,
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
        booking_date: b.booking_date,
        quotation_id: b.quotation_id,
        slot_id : b.slot_id,
        package_id : b.package_id, 
    }))
})

export const getAvailablePackages = createServerFn({ method: "GET" }).handler(async () => {
  const packages = await prisma.packages.findMany({
    where: { package_availability: true },
    select: {
      package_id: true,
      package_name: true,
      package_note: true,
      price_my_adult: true,
      price_my_kid: true,
      price_my_senior: true,
      price_my_oku: true,
      price_non_my_adult: true,
      price_non_my_kid: true,
      price_non_my_senior: true,
      price_non_my_oku: true,
    },
    orderBy: { package_name: "asc" },
  });

  return packages.map((pkg) => ({
    package_id: pkg.package_id,
    package_name: pkg.package_name,
    package_note: pkg.package_note,
    price_my_adult: Number(pkg.price_my_adult),
    price_my_kid: Number(pkg.price_my_kid),
    price_my_senior: Number(pkg.price_my_senior),
    price_my_oku: Number(pkg.price_my_oku),
    price_non_my_adult: Number(pkg.price_non_my_adult),
    price_non_my_kid: Number(pkg.price_non_my_kid),
    price_non_my_senior: Number(pkg.price_non_my_senior),
    price_non_my_oku: Number(pkg.price_non_my_oku),
  }));
});

export const getSlots = createServerFn({ method: "GET" }).handler(async () => {
  const slots = await prisma.slots.findMany({
    select: {
      slot_id: true,
      slot_name: true,
      slot_capacity: true,
    },
    orderBy: { slot_name: "asc" },
  });

  return slots;
});

export const createBooking = createServerFn({ method: 'POST' })
  .inputValidator(BookingSchema)
  .handler(async ({ data }) => {
    const selectedPackage = await prisma.packages.findUnique({
      where: { package_id: data.package_id },
      select: {
        package_availability: true,
        price_my_adult: true,
        price_my_kid: true,
        price_my_senior: true,
        price_my_oku: true,
        price_non_my_adult: true,
        price_non_my_kid: true,
        price_non_my_senior: true,
        price_non_my_oku: true,
      },
    });

    if (!selectedPackage) {
      throw new Error("Invalid package_id: package not found");
    }

    if (!selectedPackage.package_availability) {
      throw new Error("Selected package is not available");
    }

    const slot = await prisma.slots.findUnique({
      where: { slot_id: data.slot_id },
      select: { slot_id: true },
    });

    if (!slot) {
      throw new Error("Invalid slot_id: slot not found");
    }

    const bookingPrice = calculateBookingPrice(data, selectedPackage);

    const newBooking = await prisma.bookings.create({
      data: {
        booking_price: bookingPrice,
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
        booking_date: data.booking_date,
        slot_id: data.slot_id,
        package_id: data.package_id,
      }
    });
    return `Created booking for ${newBooking.pic_name} with email ${newBooking.pic_email}. Total price: ${newBooking.booking_price.toString()}`;
  })