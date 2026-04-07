import { createFileRoute } from "@tanstack/react-router"
import { useQuery } from "@tanstack/react-query"
import { getBookings } from "@/serverActions/bookingActions"

export const Route = createFileRoute ('/booking/booking-form') ({component: Booking})

function Booking(){
    const {isPending, isError, data, error} = useQuery({
        queryKey: ['bookings'],
        queryFn: getBookings
    })

    if (isPending){ return <span>Loading...</span>}
    if (isError){ return <span>Error: {error.message}</span>}

    return (
    <ul>
      {data.map((bookings) => (
        <li>{bookings.package_id} , {bookings.booking_id}</li>
      ))}
    </ul>
    )
}