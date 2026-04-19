import { createFileRoute } from "@tanstack/react-router";

import { deleteBooking, getBookings, updateBooking } from "@/serverActions/bookingActions";
import { useMutation } from "@tanstack/react-query";

import { Card,CardHeader,CardTitle,CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QueryClient, useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/admin/bookings")({ component: BookingPage })
const queryClient = new QueryClient()

function BookingPage() { 
const bookingQuery = useQuery({
    queryKey: ['admin-bookings'],
    queryFn: getBookings
})

  const updateBookingMutation = useMutation({
    mutationFn: updateBooking,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
    },
  })

  const deleteBookingMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: async () => {
    await queryClient.invalidateQueries({ queryKey: ["admin-bookings"] })
    },
  })

        return(      
        <Card>
        <CardHeader>
          <CardTitle>Bookings list</CardTitle>
        </CardHeader>
        <CardContent>
          {bookingQuery.isPending ? <p>Loading bookings...</p> : null}
          {bookingQuery.isError ? <p className="text-sm text-red-600">{bookingQuery.error.message}</p> : null}
          {bookingQuery.data ? (
            <div className="space-y-3">
              {bookingQuery.data.map((booking) => (
                <div key={booking.booking_id} className="rounded-md border p-3 text-sm flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <p className="font-medium">PIC: {booking.pic_name}</p>
                      <p>Booking Date: {booking.booking_date? booking.booking_date.toDateString():"-"}</p>
                      <p>Package: {booking.package_id}</p>
                      <p>Status: {booking.booking_status}</p>
                    </div>
                    <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        deleteBookingMutation.mutate({
                          data: { booking_id: booking.booking_id },
                        })
                      }
                    >
                      Delete
                    </Button>
                    </div>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
      )
}