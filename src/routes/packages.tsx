import { createFileRoute } from "@tanstack/react-router"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import EmblaCarousel from 'embla-carousel'
import { useRef, useEffect, useState } from "react"
import { Image } from '@unpic/react'
import { ChevronLeft, ChevronRight, MoveHorizontal, X } from 'lucide-react'

export const Route = createFileRoute("/packages")({ component: PackagesPage })

const header = '/tour-packages.webp'

function PackagesPage(){
  const emblaRef = useRef<HTMLDivElement | null>(null)
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

  const guideSrc = '/guide.png'
  const foodSrc = '/foods.jpeg'
  const carouselImages = [
    { src: '/pack-car/12.png', alt: 'Crafty' },
    { src: '/pack-car/13.png', alt: 'Farmtastic' },
    { src: '/pack-car/14.png', alt: 'Moo Moo' },
    { src: '/pack-car/15.png', alt: 'Eden' },
  ]
  const addOnImages = [
    { src: guideSrc, alt: 'Guide add-on details' },
    { src: foodSrc, alt: 'Food add-on details' },
  ]
  const previewImages = [...carouselImages, ...addOnImages]
  const selectedImage =
    selectedImageIndex === null ? null : previewImages[selectedImageIndex]

  useEffect(() => {
    if (!emblaRef.current) {
      return
    }
    const api = EmblaCarousel(emblaRef.current, { loop: true })
    return () => {
      api.destroy()
    }
  }, [])

  useEffect(() => {
    if (selectedImageIndex === null) {
      return
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImageIndex(null)
      }

      if (event.key === 'ArrowLeft') {
        setSelectedImageIndex((current) =>
          current === null
            ? current
            : (current - 1 + previewImages.length) % previewImages.length,
        )
      }

      if (event.key === 'ArrowRight') {
        setSelectedImageIndex((current) =>
          current === null ? current : (current + 1) % previewImages.length,
        )
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [selectedImageIndex, previewImages.length])

  const showPreviousImage = () => {
    setSelectedImageIndex((current) =>
      current === null
        ? current
        : (current - 1 + previewImages.length) % previewImages.length,
    )
  }

  const showNextImage = () => {
    setSelectedImageIndex((current) =>
      current === null ? current : (current + 1) % previewImages.length,
    )
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf0d8] pb-16 font-sans text-gray-800">
      <section className="overflow-hidden bg-[#fbf0d8]">
        <div className="w-full">
          <Image
            src={header}
            alt="Tour Package Banner"
            width={1920}
            height={1080}
            layout="fullWidth"
            loading="eager"
            fetchPriority="high"
            className="h-auto w-full object-contain"
          />
        </div>
      </section>
      <section className="px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-base leading-7 text-[#445412]">
            Choose from among our fantastic tour packages to immerse yourself at Farm Fresh @ UPM. Crafted to combine
            education with outdoor fun where you get to experience the vibrant nature, authentic dairy processing and all kinds of animals.
          </p>
          <h3 className="pt-8 text-2xl font-bold leading-tight text-[#445412]">
            All packages include tickets that provide access to the following activities and facilities.
          </h3>
        </div>
          
            <div className="mx-auto mt-8 grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2">
              <Card className="w-full border-b-4 border-[#445412] bg-white/55 p-4 sm:p-6">
              <CardHeader className="px-0 pt-0 text-center font-fraunces text-2xl font-bold text-[#445412]">
                Main Farm <br/> (Accessible by walking)
                </CardHeader>
                <ul className="list-outside list-disc space-y-3 pl-5 text-sm leading-6 text-black sm:text-base">
                <li>Barrel Ride for Kids (suitable for kids 4-6 y/o)</li>
                <li>Petting animals (ducks, geese, goats)</li>
                <li>Cow Barn Visit</li>
                <li>Mini Zoo</li>
                <li>Greenhouse (Hydroponic & Aquaponic)</li>
                <li>Compost Area</li>
                <li>Chicken Collection</li>
                <li>Cream Hauz / Inside Scoop (Ice Cream Shop)</li>
                <li>Fresh Picks (Farm Fresh Products)</li>
                <li>Joy Shop (Merchandise Shop)</li>
              </ul>
            </Card>

            <Card className="w-full border-b-4 border-[#445412] bg-white/55 p-4 sm:p-6">
              <CardHeader className="px-0 pt-0 text-center font-fraunces text-[#445412]">
                <CardTitle className="font-bold text-2xl">Second Farm <br/> (Accessible by tractor ride)<br/></CardTitle>
                <p className="text-base font-semibold sm:text-lg">*One tractor can accommodate up to 40 adults.</p>
                </CardHeader>

                <ul className="list-outside list-disc space-y-3 border-b-2 border-[#445412] py-4 pl-5 text-black">
                <li>Vegetable Farm</li>
              </ul>
              <p className="my-4 text-center font-bold">Tractor Operation Hours <br/>(Rides depart every 20 minutes)</p>
              <div className="grid grid-cols-1 gap-2 rounded-md border-2 border-[#445412] p-3 text-center sm:grid-cols-2">
                <div className="font-bold">Weekdays <br/>(Monday - Friday)</div>
                <div className="text-xl font-black sm:text-2xl">10AM - 6PM</div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 rounded-md border-2 border-[#445412] p-3 text-center sm:grid-cols-2">
                <div className="font-bold">Weekends<br/>(Saturday & Sunday)</div>
                <div className="text-xl font-black sm:text-2xl">9AM - 7PM</div>
              </div>
          </Card>
          </div>
      </section>
      <section className="px-4 sm:px-6">
        <div className="mx-auto">
          <div className="mx-auto mb-3 flex max-w-5xl items-center justify-between gap-3 text-[#445412]">
            <p className="text-sm font-semibold sm:text-base">Tour packages</p>
            <div className="flex items-center gap-2 rounded-md border border-[#445412]/30 bg-white/45 px-3 py-2 text-xs font-semibold sm:text-sm">
              <MoveHorizontal className="size-4" aria-hidden="true" />
              <span>Drag to browse</span>
            </div>
          </div>
          <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex cursor-grab gap-4 active:cursor-grabbing">
            {carouselImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                className="min-w-0 flex-[0_0_88%] cursor-zoom-in text-left sm:flex-[0_0_70%] lg:flex-[0_0_48%]"
                onClick={() => setSelectedImageIndex(index)}
                aria-label={`Open ${image.alt} package image`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1600}
                  height={900}
                  layout="fullWidth"
                  loading="lazy"
                  className="max-h-[80vh] w-full rounded-md border-4 border-[#445412] object-contain"
                />
              </button>
            ))}
            </div>
          </div>
            <div className="mx-auto grid max-w-4xl justify-items-center gap-6">
              <h1 className="mt-10 inline-block border-b-4 border-[#445412]/20 pb-4 font-fraunces text-3xl font-black uppercase tracking-wide text-[#445412] sm:text-5xl">
                Optional add-ons!
              </h1>
            </div>
          <div className="mx-auto mt-8 grid max-w-5xl gap-6 md:grid-cols-2">
            {addOnImages.map((image, index) => (
              <button
                key={image.src}
                type="button"
                className="cursor-zoom-in text-left"
                onClick={() => setSelectedImageIndex(carouselImages.length + index)}
                aria-label={`Open ${image.alt}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1600}
                  height={900}
                  layout="fullWidth"
                  loading="lazy"
                  className="max-h-[80vh] w-full rounded-md border-4 border-[#445412] object-contain transition-transform duration-200 hover:scale-[1.01]"
                />
              </button>
            ))}
          </div>
        </div>
      </section>
      {selectedImage ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${selectedImage.alt} full-size preview`}
          onClick={() => setSelectedImageIndex(null)}
        >
          <button
            type="button"
            className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-md bg-white text-[#445412] shadow-lg transition-colors hover:bg-[#fbf0d8]"
            onClick={() => setSelectedImageIndex(null)}
            aria-label="Close image preview"
          >
            <X className="size-5" />
          </button>

          <button
            type="button"
            className="absolute left-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-md bg-white text-[#445412] shadow-lg transition-colors hover:bg-[#fbf0d8] sm:left-6"
            onClick={(event) => {
              event.stopPropagation()
              showPreviousImage()
            }}
            aria-label="Show previous package image"
          >
            <ChevronLeft className="size-6" />
          </button>

          <figure
            className="flex max-h-[92vh] max-w-[94vw] flex-col items-center gap-3"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={selectedImage.src}
              alt={selectedImage.alt}
              width={1920}
              height={1080}
              layout="constrained"
              loading="eager"
              className="max-h-[86vh] max-w-[94vw] rounded-md object-contain shadow-2xl"
            />
            <figcaption className="rounded-md bg-black/55 px-3 py-1 text-sm font-semibold text-white">
              {selectedImage.alt}
            </figcaption>
          </figure>

          <button
            type="button"
            className="absolute right-3 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-md bg-white text-[#445412] shadow-lg transition-colors hover:bg-[#fbf0d8] sm:right-6"
            onClick={(event) => {
              event.stopPropagation()
              showNextImage()
            }}
            aria-label="Show next package image"
          >
            <ChevronRight className="size-6" />
          </button>
        </div>
      ) : null}
    </div>
  )
}
