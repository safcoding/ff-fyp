import { getBookings } from "@/features/booking/server/bookingActions"

export async function BookingsList(){
    const bookings = await getBookings();
    if (!bookings) {
        return <p className="text-gray-500 italic">No bookings found. Add some!</p>
  }
    return (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">Bookings Collection</h2>
            {bookings.map((booking) => (
                <div key={booking.booking_id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                    <p className="font-bold text-lg mb-2">{booking.org_name}</p>
                    <p className="text-gray-700">{booking.booking_price}</p>
                </div>
            ))}
        </div>
    )
}