import { createServerFn } from '@tanstack/react-start'
import { timeServerTask } from '@/lib/server-timing'
import * as schema from '@/schemas/bookingSchemas'

export const getBookingsPage = createServerFn({ method: 'POST' })
  .inputValidator(schema.getBookingsSchema)
  .handler(async ({ data }) => {
    const page = await timeServerTask('booking.getBookingsPage', async () => {
      const [{ loadBookingsPage }, { mapBookingToUi }] = await Promise.all([
        import('./bookingRepo'),
        import('./bookingMapper'),
      ])
      const bookingsPage = await loadBookingsPage(data)

      return {
        items: bookingsPage.bookings.map(mapBookingToUi),
        total: bookingsPage.total,
        counts: bookingsPage.counts,
        page: data.page,
        pageSize: data.pageSize,
      }
    })

    return page
  })
