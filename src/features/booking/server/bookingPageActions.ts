import { createServerFn } from '@tanstack/react-start'
import * as schema from '@/schemas/bookingSchemas'

export const getBookingsPage = createServerFn({ method: 'POST' })
  .inputValidator(schema.getBookingsSchema)
  .handler(async ({ data }) => {
    const [{ loadBookingsPage }, { mapBookingToUi }] = await Promise.all([
      import('./bookingRepo'),
      import('./bookingMapper'),
    ])
    const page = await loadBookingsPage(data)

    return {
      items: page.bookings.map(mapBookingToUi),
      total: page.total,
      counts: page.counts,
      page: data.page,
      pageSize: data.pageSize,
    }
  })
