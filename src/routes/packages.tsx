import { createFileRoute } from "@tanstack/react-router"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import EmblaCarousel from 'embla-carousel'
import { useRef, useEffect } from "react"
import { Image } from '@unpic/react'

export const Route = createFileRoute("/packages")({ component: PackagesPage })

const header = '/tour-packages.webp'

function PackagesPage(){
  const emblaRef = useRef<HTMLDivElement | null>(null)

  const guideSrc = '/guide.png'
  const foodSrc = '/foods.jpeg'
  const carouselImages = [
    { src: '/pack-car/12.png', alt: 'Crafty' },
    { src: '/pack-car/13.png', alt: 'Farmtastic' },
    { src: '/pack-car/14.png', alt: 'Moo Moo' },
    { src: '/pack-car/15.png', alt: 'Eden' },
  ]
  useEffect(() => {
    if (!emblaRef.current) {
      return
    }
    const api = EmblaCarousel(emblaRef.current, { loop: true })
    return () => {
      api.destroy()
    }
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf0d8] pb-16 font-sans text-gray-800">
      <section className="relative min-h-[min(720px,78vh)] overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={header}
            alt="Tour Package Banner"
            width={1920}
            height={1080}
            layout="fullWidth"
            loading="eager"
            fetchPriority="high"
            className="h-full w-full object-cover"
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
        <div className="mx-auto overflow-hidden" ref={emblaRef}>
          <div className="flex gap-4">
            {carouselImages.map((image) => (
              <div key={image.src} className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_70%] lg:flex-[0_0_48%]">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={1600}
                  height={900}
                  layout="fullWidth"
                  loading="lazy"
                  className="max-h-[80vh] w-full rounded-md border-4 border-[#445412] object-contain"
                />
              </div>
            ))}
            </div>
            <div className="mx-auto grid max-w-4xl justify-items-center gap-6">
              <h1 className="mt-10 inline-block border-b-4 border-[#445412]/20 pb-4 font-fraunces text-3xl font-black uppercase tracking-wide text-[#445412] sm:text-5xl">
                Optional add-ons!
              </h1>
            </div>
          <div className="mx-auto mt-8 grid max-w-5xl gap-6 md:grid-cols-2">
            <Image
              src={guideSrc}
              alt="Guide add-on details"
              width={1600}
              height={900}
              layout="fullWidth"
              loading="lazy"
              className="max-h-[80vh] w-full rounded-md border-4 border-[#445412] object-contain"
            />
            <Image
              src={foodSrc}
              alt="Food add-on details"
              width={1600}
              height={900}
              layout="fullWidth"
              loading="lazy"
              className="max-h-[80vh] w-full rounded-md border-4 border-[#445412] object-contain"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
