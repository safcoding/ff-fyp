import { createFileRoute } from "@tanstack/react-router"

export const Route = createFileRoute ('/') ({component: BookingComponent})

function BookingComponent(){
    return <div>Booking</div>
}