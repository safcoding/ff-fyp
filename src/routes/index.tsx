import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import EmblaCarousel from 'embla-carousel'

import { Button } from '@/components/ui/button'
export const Route = createFileRoute('/')({ component: App })

function App() {
  const emblaRef = useRef<HTMLDivElement | null>(null)
  const [emblaApi, setEmblaApi] = useState<ReturnType<typeof EmblaCarousel> | null>(null)

  const heroImageSrc = '/banner.jpg'
  const mapImageSrc = '/ff-map.png'
  const bgImageSrc = '/ff-bg.jpg'
  const carouselImages = [
    { src: '/carousel/slide-1.png', alt: 'Forest highlight 1' },
    { src: '/carousel/slide-2.png', alt: 'Forest highlight 2' },
    { src: '/carousel/slide-3.png', alt: 'Forest highlight 3' },
    { src: '/carousel/slide-4.png', alt: 'Forest highlight 4' },
    { src: '/carousel/slide-5.png', alt: 'Forest highlight 5' },
    { src: '/carousel/slide-6.png', alt: 'Forest highlight 6' },
  ]

  useEffect(() => {
    if (!emblaRef.current) {
      return
    }
    const api = EmblaCarousel(emblaRef.current, { loop: true })
    setEmblaApi(api)
    return () => {
      api.destroy()
    }
  }, [])

  return (
    <main className="bg-linear-to-b from-stone-50 via-white to-emerald-50/50 text-stone-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImageSrc} alt="Nature park view" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0" />

        <div className="relative mx-auto flex min-h-[70vh] max-w-6xl items-center px-6 py-20 md:px-8">
        </div>
      </section>
        
      <div className="relative">
        <div className="pointer-events-none absolute inset-0">
          <img
            src={bgImageSrc}
            alt="Forest background"
            className="h-full w-full object-cover blur-sm"
          />
          <div className="absolute inset-0 bg-slate-950/30" />
        </div>

        <section className="relative w-full pb-16 px-6 py-16">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {carouselImages.map((image) => (
                <div key={image.src} className="min-w-0 flex-[0_0_100%] min-h-max">
                  <img src={image.src} alt={image.alt} className="h-auto w-full object-contain max-h-[70vh]" />
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between px-6 text-white/80 md:px-8">
            <p className="text-sm">Swipe or drag to explore the gallery.</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-full border border-white/30 px-3 py-1 text-xs hover:bg-white/10"
                onClick={() => emblaApi?.scrollPrev()}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-full border border-white/30 px-3 py-1 text-xs hover:bg-white/10"
                onClick={() => emblaApi?.scrollNext()}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="relative mx-auto max-w-6xl gap-8 px-6 py-16 text-white">
          <div className="mb-4">
            <h2 className="text-3xl font-semibold">Find Your Way Around</h2>
          </div>
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/10 shadow-sm backdrop-blur">
            <img
              src={mapImageSrc}
              alt="Map of the attraction"
              className="h-full w-full object-cover"
            />
          </div>
          <p className="mt-4 text-sm text-white/80">
            Use the map to explore trails, activity zones, and gathering points before your visit.
          </p>
        </section>

        <section className="relative border-t border-white/10">
          <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-12 text-white md:flex-row md:items-center md:px-8">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Ready to plan your visit?</h3>
              <p className="text-sm text-white/80">Pick your package, date, and group details in just a few steps.</p>
            </div>
            <Button asChild size="lg" className="bg-emerald-500 text-white hover:bg-emerald-600">
              <Link to="/booking-form">Go to Booking Form</Link>
            </Button>
          </div>
        </section>
      </div>
    </main>
  )
}
