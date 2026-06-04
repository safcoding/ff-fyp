import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import EmblaCarousel from 'embla-carousel'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const emblaRef = useRef<HTMLDivElement | null>(null)
  const [emblaApi, setEmblaApi] = useState<ReturnType<typeof EmblaCarousel> | null>(null)

  const heroImageSrc = '/banner.jpeg'
  const mapImageSrc = '/ff-map.png'
  const carouselImages = [
    { src: '/carousel/2.png', alt: 'Burst of flora, fauna' },
    { src: '/carousel/3.png', alt: 'Our ladies...' },
    { src: '/carousel/4.png', alt: 'Tractor Tour' },
    { src: '/carousel/5.png', alt: 'Fresh picks' },
    { src: '/carousel/6.png', alt: 'Enjoy the Barrel ride around the mini zoo' },
    { src: '/carousel/7.png', alt: 'Indulge in a spectrum of tasttes' },
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
    <main className="overflow-x-hidden bg-[#fbf0d8]">
      <section className="relative min-h-[min(760px,88vh)] overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImageSrc} alt="Farm Fresh @ UPM Banner" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 text-center text-[#fbf0d8] sm:px-6">
          <h1 className="mb-5 max-w-4xl font-fraunces text-4xl font-black leading-tight drop-shadow-lg sm:text-5xl lg:text-6xl">
            Bringing You Closer to Nature, Dairy & Farm Life
          </h1>
          <Link
            to="/booking-form"
            className="flex h-12 w-full max-w-xs items-center justify-center rounded-md bg-amber-500 px-6 text-sm font-bold uppercase tracking-wide text-[#fbf0d8] transition-colors hover:bg-amber-600 sm:w-auto md:text-base"
          >
            Book a Group Tour
          </Link>
        </div>
      </section>

        <section className="relative w-full bg-[#fbf0d8] px-4 py-10 sm:px-6 lg:py-14">
          <div className="mx-auto mb-6 max-w-3xl text-center">
            <h2 className="font-fraunces text-3xl font-black leading-tight text-[#445412] sm:text-4xl">Enhance your day at Farm Fresh @ UPM</h2>
            <p className="mt-2 text-base font-semibold text-stone-800 sm:text-lg">View the adventures available below.</p>
          </div>

          <div className="mx-auto max-w-6xl overflow-hidden rounded-md border-4 border-[#445412]/20 bg-white/40" ref={emblaRef}>
            <div className="flex">
              {carouselImages.map((image) => (
                <div key={image.src} className="min-w-0 flex-[0_0_100%]">
                  <img src={image.src} alt={image.alt} className="aspect-[4/3] w-full object-cover sm:aspect-[16/9]" />
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-4 flex max-w-6xl flex-col gap-3 font-sans sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-stone-800 sm:text-base">Swipe or drag to explore the gallery.</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="h-10 rounded-md border border-[#445412] px-4 text-sm font-semibold hover:bg-[#445412] hover:text-[#fbf0d8]"
                onClick={() => emblaApi?.scrollPrev()}
              >
                Prev
              </button>
              <button
                type="button"
                className="h-10 rounded-md border border-[#445412] px-4 text-sm font-semibold hover:bg-[#445412] hover:text-[#fbf0d8]"
                onClick={() => emblaApi?.scrollNext()}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="relative bg-[#445412] px-4 py-10 sm:px-6 lg:py-14">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-fraunces text-3xl font-black text-[#fbf0d8] sm:text-4xl">Find Your Way Around</h2>
          </div>
          <div className="mx-auto mt-6 max-w-6xl overflow-hidden rounded-md bg-[#fbf0d8]/10 p-2 sm:p-4">
            <img
              src={mapImageSrc}
              alt="Map of the attraction"
              className="h-full w-full object-contain"
            />
          </div>
        </section>
    </main>
  )
}
