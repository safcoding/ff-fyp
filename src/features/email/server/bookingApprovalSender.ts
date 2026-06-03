import type { BookingWithRelations } from "@/features/booking/server/bookingMapper"
import { buildBookingApprovalHtml, buildBookingApprovalText } from "./bookingApprovalTemplate"
import { getEmailTransport } from "./emailTransport"

function getPaymentUrl(bookingId: string) {
  const baseUrl =
    process.env.PUBLIC_APP_URL ??
    process.env.VITE_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"

  return `${baseUrl.replace(/\/$/, "")}/payment?booking_id=${encodeURIComponent(bookingId)}`
}

export async function sendBookingApprovedEmail(
  booking: BookingWithRelations,
  staffComment: string | null,
  recipientOverride?: string,
) {
  const recipient = recipientOverride ?? booking.pic_email

  if (!recipient) {
    throw new Error("Booking email address is missing.")
  }

  const { transporter, from } = getEmailTransport()
  const subject = `Booking Approved - ${booking.booking_id}`
  const paymentUrl = getPaymentUrl(booking.booking_id)
  const text = buildBookingApprovalText(booking, staffComment, paymentUrl)
  const html = buildBookingApprovalHtml(booking, staffComment, paymentUrl)

  await transporter.sendMail({
    from,
    to: recipient,
    subject,
    text,
    html,
  })
}
