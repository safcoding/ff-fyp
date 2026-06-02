import { createFileRoute } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'

interface SuccessSearch {
  bookingId: string 
}

export const Route = createFileRoute('/booking-form/success')({
    validateSearch: (search: Record<string, unknown>): SuccessSearch => {
        return {
        bookingId: search.bookingId as string,
        }
    },    
  component: RouteComponent,
})

function RouteComponent() {
    const { bookingId } = Route.useSearch()
return (
    <div className="min-h-screen bg-[#445412] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
        
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="font-fraunces text-3xl font-black text-stone-800">Pre-Booking Confirmed!</h2>
        <p className="text-stone-500 text-sm mt-2">
          Your slot has been pre-booked! Our staff will review your booking and get to you as soon as possible!
        </p>

        <div className="my-6 p-4 bg-stone-50 rounded-xl border border-stone-150 text-left text-sm">
          <div className="flex justify-between border-b pb-2 mb-2 font-mono text-xs text-stone-400">
            <span>REFERENCE ID</span>
            <span className="font-bold text-stone-700">
                {bookingId}
                </span>
          </div>
          <p className="text-stone-600 font-medium">
            📧 A digital quotation can be provided by contacting us.
          </p>
        </div>

        {/* Primary Action Button to escape back home */}
        <Link 
          to="/" 
          className="inline-flex items-center justify-center w-full h-11 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-sm transition-colors"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  )
}
