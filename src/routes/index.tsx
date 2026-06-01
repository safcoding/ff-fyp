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
    <main>
      <section className="relative overflow-hidden min-h-[80vh]">
        <div className="absolute inset-0">
          <img src={heroImageSrc} alt="Nature park view" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-[#fbf0d8] p-4">            
          <h1 className="text-6xl md:text-6xl mb-4 justify-center max-w-4xl font-fraunces font-black drop-shadow-lg">
            Bringing You Closer to Nature, Dairy & Farm Life
            </h1>
            <Link
              to="/booking-form" 
              className="bg-amber-500 hover:bg-amber-600 text-[#fbf0d8] px-6 h-12 flex items-center justify-center transition-colors min-w-25 text-xs sm:text-sm md:text-base uppercase tracking-wider font-sans font-bold"
            >
              Book a Group Tour
            </Link>
          </div>
      </section>

        <section className="relative w-full pb-6 px-6 bg-[#fbf0d8] min-h-screen">
          <div className="mb-4 justify-center max-w-full text-center p-10">
            <h2 className="text-4xl font-fraunces font-black text-[#445412]">Enhance your day at Farm Fresh @ UPM</h2>
            <h3 className="text-xl font-sans font-black text-black">View the adventures available below:</h3>
          </div>

          <div className="overflow-hidden -mx-6 w-screen" ref={emblaRef}>
            <div className="flex">
              {carouselImages.map((image) => (
                <div key={image.src} className="min-w-0 flex-[0_0_100%] min-h-max">
                  <img src={image.src} alt={image.alt} className="h-auto w-full object-cover max-h-screen" />
                </div>
              ))}
            </div>
          </div>
          <div className="mx-auto mt-4 flex max-w-6xl items-center justify-between px-6 text-black md:px-8">
            <p className="text-xl font-sans font-black text-black">Swipe or drag to explore the gallery.</p>
            <div className="flex gap-2">
              <button
                type="button"
                className="rounded-full border border-[#445412] px-3 py-1 text-xs hover:bg-[#445412] hover:text-[#fbf0d8]"
                onClick={() => emblaApi?.scrollPrev()}
              >
                Prev
              </button>
              <button
                type="button"
                className="rounded-full border border-[#445412] px-3 py-1 text-xs hover:bg-[#445412] hover:text-[#fbf0d8]"
                onClick={() => emblaApi?.scrollNext()}
              >
                Next
              </button>
            </div>
          </div>
        </section>

        <section className="relative mx-auto gap-8 bg-[#445412] w-screen">
          <div className="justify-center max-w-full text-center p-10">
            <h2 className="text-4xl font-fraunces font-black text-[#fbf0d8]">Find Your Way Around</h2>
          </div>
          <div className="rounded-2xl max-w-6xl mx-auto px-6 pb-10">
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
