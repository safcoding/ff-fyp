import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getPackages } from '@/serverActions/packageActions'
export const Route = createFileRoute('/')({ component: App })

function App() {
  const packagesQuery = useQuery({
    queryKey: ['home-packages'],
    queryFn: () => getPackages(),
  })

  const availablePackages = (packagesQuery.data ?? []).filter((pkg) => pkg.package_availability)
  const packagesPreview = availablePackages.slice(0, 3)

  const heroImageSrc = '/banner.jpg'
  const mapImageSrc = '/ff-map.png'

  return (
    <main className="bg-linear-to-b from-stone-50 via-white to-emerald-50/50 text-stone-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImageSrc} alt="Nature park view" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/45" />

        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center px-6 py-20 md:px-8">
          <div className="max-w-2xl space-y-6 text-white">
            <p className="inline-flex rounded-full border border-white/40 bg-white/10 px-4 py-1 text-xs tracking-[0.2em] uppercase">
              Forest Experience
            </p>
            <h1 className="text-4xl leading-tight font-semibold sm:text-5xl md:text-6xl">
              Explore trails, stories, and guided adventures in one unforgettable day.
            </h1>
            <p className="max-w-xl text-base text-white/90 sm:text-lg">
              Discover our curated routes, wildlife highlights, and group-friendly activities designed for schools,
              organizations, and families.
            </p>
            <Button asChild size="lg" className="bg-emerald-500 text-white hover:bg-emerald-600">
              <Link to="/booking-form">Book Your Visit</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className=" bg-blue-500 align-center mx-auto max-w-6xl gap-8 px-6 py-16">
        <div className=" overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <img
            src={mapImageSrc}
            alt="Map of the attraction"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      <section className="mx-auto max-w-6xl space-y-6 px-6 pb-16 md:px-8">
        <div className="space-y-2">
          <h2 className="text-3xl font-semibold">Available Packages</h2>
          <p className="text-sm text-stone-600">A quick look at what group packages you can book right now.</p>
        </div>

        {packagesQuery.isPending ? <p className="text-sm text-stone-600">Loading packages...</p> : null}
        {packagesQuery.isError ? (
          <p className="text-sm text-red-600">Unable to load packages. Please try again later.</p>
        ) : null}

        {packagesPreview.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {packagesPreview.map((pkg) => (
              <Card key={pkg.package_id} className="border-stone-200 bg-white">
                <CardHeader>
                  <CardTitle>{pkg.package_name}</CardTitle>
                  <CardDescription>{pkg.package_note || 'Guided and customizable experience.'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-stone-700">
                    Starts from RM {pkg.price_my_adult.toFixed(2)} per MY adult.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-sm text-stone-600">No packages are currently available.</p>
        )}
      </section>

      <section className="border-t border-stone-200 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 md:flex-row md:items-center md:px-8">
          <div className="space-y-2">
            <h3 className="text-2xl font-semibold">Ready to plan your visit?</h3>
            <p className="text-sm text-stone-600">Pick your package, date, and group details in just a few steps.</p>
          </div>
          <Button asChild size="lg" className="bg-stone-900 text-white hover:bg-stone-800">
            <Link to="/booking-form">Go to Booking Form</Link>
          </Button>
        </div>
      </section>
    </main>
  )
}
