import { createFileRoute, Link } from '@tanstack/react-router'

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
    <div className="flex min-h-screen items-center justify-center bg-[#445412] px-4 py-10 sm:py-12">
      <div className="w-full max-w-md rounded-md border border-stone-200 bg-white p-5 text-center shadow-sm sm:p-8">
        
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="font-fraunces text-2xl font-black text-stone-800 sm:text-3xl">Pre-Booking Confirmed!</h2>
        <p className="text-stone-500 text-sm mt-2">
          Your slot has been pre-booked! Our staff will review your booking and get to you as soon as possible!
        </p>

        <div className="my-6 rounded-md border border-stone-200 bg-stone-50 p-4 text-left text-sm">
          <div className="flex flex-col gap-1 border-b pb-2 mb-2 font-mono text-xs text-stone-400 sm:flex-row sm:justify-between">
            <span>REFERENCE ID</span>
            <span className="break-all font-bold text-stone-700">
                {bookingId}
                </span>
          </div>
          <p className="text-stone-600 font-medium">
            A digital quotation can be provided by contacting us.
          </p>
        </div>

        {/* Primary Action Button to escape back home */}
        <Link 
          to="/" 
          className="inline-flex h-11 w-full items-center justify-center rounded-md bg-emerald-800 text-sm font-bold text-white transition-colors hover:bg-emerald-900"
        >
          Return to Homepage
        </Link>
      </div>
    </div>
  )
}
