import type { BookingWithRelations } from "@/features/booking/server/bookingMapper"
import { buildBookingApprovalHtml, buildBookingApprovalText } from "./bookingApprovalTemplate"
import { getEmailTransport } from "./emailTransport"

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
  const text = buildBookingApprovalText(booking, staffComment)
  const html = buildBookingApprovalHtml(booking, staffComment)

  await transporter.sendMail({
    from,
    to: recipient,
    subject,
    text,
    html,
  })
}
