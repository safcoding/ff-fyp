import nodemailer from "nodemailer"

import { formatCurrency } from "@/lib/utils"
import type { BookingWithRelations } from "../bookingMapper"

type DiscountInfo = {
  discount_id: string
  discount_type: "PERCENTAGE" | "FLAT"
  discount_amount: number
} | null

const TERMS_AND_CONDITIONS = [
  "1) Please arrive 15 minutes before your scheduled slot.",
  "2) Late arrivals may result in shorter session time.",
  "3) Bookings are subject to availability and capacity limits.",
  "4) Cancellations must be made at least 48 hours in advance.",
  "5) Payments are non-refundable once the booking is approved.",
].join("\n")

function formatDate(value: Date | null) {
  if (!value) {
    return "-"
  }

  return new Intl.DateTimeFormat("en-MY", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(value)
}

function buildBookingLines(booking: BookingWithRelations) {
  const lines: string[] = []

  lines.push(`Booking ID: ${booking.booking_id}`)
  lines.push(`Date: ${formatDate(booking.booking_date)}`)
  lines.push(`Slot: ${booking.slots?.slot_name ?? booking.slot_id}`)
  lines.push(`Organization: ${booking.org_name}`)
  lines.push(`Type: ${booking.org_type}`)
  lines.push(`State: ${booking.org_state}`)
  lines.push("")

  lines.push("Visitors:")
  for (const pkg of booking.booking_packages) {
    lines.push(
      `- ${pkg.packages?.package_name ?? pkg.package_id}: MY Adult ${pkg.pax_my_adult ?? 0}, MY Kid ${pkg.pax_my_kid ?? 0}, MY Senior ${pkg.pax_my_senior ?? 0}, MY OKU ${pkg.pax_my_oku ?? 0}, Non-MY Adult ${pkg.pax_non_my_adult ?? 0}, Non-MY Kid ${pkg.pax_non_my_kid ?? 0}, Non-MY Senior ${pkg.pax_non_my_senior ?? 0}, Non-MY OKU ${pkg.pax_non_my_oku ?? 0}`
    )
  }

  lines.push("")
  lines.push("Add-ons:")
  if (booking.booking_addons.length === 0) {
    lines.push("- None")
  } else {
    for (const addon of booking.booking_addons) {
      lines.push(`- ${addon.addons.addon_name} x ${addon.addon_quantity}`)
    }
  }

  lines.push("")
  lines.push("Foods:")
  if (booking.booking_foods.length === 0) {
    lines.push("- None")
  } else {
    for (const food of booking.booking_foods) {
      lines.push(`- ${food.foods.food_name} x ${food.food_quantity}`)
    }
  }

  return lines
}

function buildEmailBody(
  booking: BookingWithRelations,
  discount: DiscountInfo,
  staffComment: string | null,
) {
  const bookingLines = buildBookingLines(booking)
  const total = formatCurrency(Number(booking.booking_price))
  const discountLine = discount
    ? `${discount.discount_id} (${discount.discount_type} ${discount.discount_amount})`
    : "None"

  return [
    "Your booking has been approved.",
    "",
    ...bookingLines,
    "",
    `Total Price: ${total}`,
    `Discount Applied: ${discountLine}`,
    "",
    "Staff Comment:",
    staffComment && staffComment.trim() ? staffComment.trim() : "No staff comment provided.",
    "",
    "Terms and Conditions:",
    TERMS_AND_CONDITIONS,
  ].join("\n")
}

function getTransporter() {
  const host = process.env.SMTP_HOST
  const port = process.env.SMTP_PORT
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM

  if (!host || !port || !user || !pass || !from) {
    throw new Error("Missing SMTP configuration. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and SMTP_FROM.")
  }

  return {
    transporter: nodemailer.createTransport({
      host,
      port: Number(port),
      secure: Number(port) === 465,
      auth: {
        user,
        pass,
      },
    }),
    from,
  }
}

export async function sendBookingApprovedEmail(
  booking: BookingWithRelations,
  discount: DiscountInfo,
  staffComment: string | null,
) {
  if (!booking.pic_email) {
    throw new Error("Booking email address is missing.")
  }

  const { transporter, from } = getTransporter()
  const subject = `Booking Approved - ${booking.booking_id}`
  const text = buildEmailBody(booking, discount, staffComment)

  await transporter.sendMail({
    from,
    to: booking.pic_email,
    subject,
    text,
  })
}
