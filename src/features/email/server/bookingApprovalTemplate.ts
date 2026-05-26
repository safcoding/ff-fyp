import { formatCurrency } from "@/lib/utils"
import type { BookingWithRelations } from "@/features/booking/server/bookingMapper"
import { escapeHtml, formatDate, formatPaxValue, paxLabels } from "./emailFormat"

const TERMS_AND_CONDITIONS = [
  "1) Please arrive 15 minutes before your scheduled slot.",
  "2) Late arrivals may result in shorter session time.",
  "3) Bookings are subject to availability and capacity limits.",
  "4) Cancellations must be made at least 48 hours in advance.",
  "5) Payments are non-refundable once the booking is approved.",
].join("\n")

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

  return lines
}

function buildPackageRows(booking: BookingWithRelations) {
  const rows: string[] = []

  for (const pkg of booking.booking_packages) {
    const packageName = pkg.packages?.package_name ?? pkg.package_id
    const paxPairs = paxLabels
      .map(([key, label]) => ({ label, value: formatPaxValue(pkg[key]) }))
      .filter((entry) => entry.value > 0)

    if (paxPairs.length === 0) {
      continue
    }

    rows.push(
      `
        <tr>
          <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; font-weight:600;">${escapeHtml(packageName)}</td>
          <td style="padding:10px 8px; border-bottom:1px solid #e5e7eb; color:#4b5563;">
            ${paxPairs.map((pax) => `${pax.label}: ${pax.value}`).join("<br>")}
          </td>
        </tr>
      `
    )
  }

  if (rows.length === 0) {
    return `
      <tr>
        <td colspan="2" style="padding:10px 8px; color:#6b7280; border-bottom:1px solid #e5e7eb;">No pax selected.</td>
      </tr>
    `
  }

  return rows.join("")
}

export function buildBookingApprovalText(
  booking: BookingWithRelations,
  staffComment: string | null,
) {
  const bookingLines = buildBookingLines(booking)
  const total = formatCurrency(Number(booking.booking_price))

  return [
    "Your booking has been approved!",
    "",
    ...bookingLines,
    "",
    `Total Price: ${total}`,
    "",
    "Staff Comment:",
    staffComment && staffComment.trim() ? staffComment.trim() : "No staff comment provided.",
    "",
    "Terms and Conditions:",
    TERMS_AND_CONDITIONS,
  ].join("\n")
}

export function buildBookingApprovalHtml(
  booking: BookingWithRelations,
  staffComment: string | null,
) {
  const packageRows = buildPackageRows(booking)
  const safeComment = staffComment && staffComment.trim() ? escapeHtml(staffComment.trim()) : "No staff comment provided."
  const safeTerms = escapeHtml(TERMS_AND_CONDITIONS).replace(/\n/g, "<br>")

  return `
  <div style="font-family: Arial, sans-serif; background:#f7f7f7; padding:24px;">
    <div style="max-width:680px; margin:0 auto; background:#ffffff; border-radius:10px; border:1px solid #e5e7eb; overflow:hidden;">
      <div style="padding:20px 24px; border-bottom:1px solid #e5e7eb; background:#f8fafc;">
        <h2 style="margin:0; font-size:20px; color:#111827;">Booking Approved</h2>
        <p style="margin:6px 0 0; color:#6b7280; font-size:14px;">Your booking has been approved. Details are below.</p>
      </div>

      <div style="padding:20px 24px;">
        <table style="width:100%; border-collapse:collapse; font-size:14px;">
          <tr>
            <td style="padding:8px 0; color:#6b7280;">Booking ID</td>
            <td style="padding:8px 0; font-weight:600; color:#111827;">${escapeHtml(booking.booking_id)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#6b7280;">Booked Date</td>
            <td style="padding:8px 0; font-weight:600; color:#111827;">${formatDate(booking.booking_date)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#6b7280;">Booking Slot</td>
            <td style="padding:8px 0; font-weight:600; color:#111827;">${escapeHtml(booking.slots?.slot_name ?? booking.slot_id)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#6b7280;">Person In Charge (PIC)</td>
            <td style="padding:8px 0; font-weight:600; color:#111827;">${escapeHtml(booking.pic_name)}</td>
          </tr>
          <tr>
            <td style="padding:8px 0; color:#6b7280;">PIC Number</td>
            <td style="padding:8px 0; font-weight:600; color:#111827;">${escapeHtml(booking.pic_hp)}</td>
          </tr>
        </table>

        <h3 style="margin:24px 0 12px; font-size:16px; color:#111827;">Packages & Pax</h3>
        <table style="width:100%; border-collapse:collapse; font-size:13px; border:1px solid #e5e7eb;">
          <thead>
            <tr style="background:#f8fafc; text-align:left;">
              <th style="padding:10px 8px; border-bottom:1px solid #e5e7eb;">Package</th>
              <th style="padding:10px 8px; border-bottom:1px solid #e5e7eb;">Pax Breakdown</th>
            </tr>
          </thead>
          <tbody>
            ${packageRows}
          </tbody>
        </table>

        <h3 style="margin:24px 0 8px; font-size:16px; color:#111827;">Staff Comments</h3>
        <div style="padding:12px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:6px; color:#374151; font-size:14px;">${safeComment}</div>

        <h3 style="margin:24px 0 8px; font-size:16px; color:#111827;">Terms and Conditions</h3>
        <div style="padding:12px; background:#fff7ed; border:1px solid #fed7aa; border-radius:6px; color:#9a3412; font-size:13px; line-height:1.5;">${safeTerms}</div>
      </div>
    </div>
  </div>
  `.trim()
}
