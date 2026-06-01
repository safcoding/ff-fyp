import { createFileRoute } from "@tanstack/react-router"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import EmblaCarousel from 'embla-carousel'
import { useRef, useState, useEffect } from "react"
export const Route = createFileRoute("/packages")({ component: PackagesPage })

const header = '/tour-packages.png'

function PackagesPage(){
  const emblaRef = useRef<HTMLDivElement | null>(null)
  const [emblaApi, setEmblaApi] = useState<ReturnType<typeof EmblaCarousel> | null>(null)

  const guideSrc = '/guide.png'
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
    setEmblaApi(api)
    return () => {
      api.destroy()
    }
  }, [])

  return (
    <div className="w-screen min-h-screen bg-[#fbf0d8] text-gray-800 font-sans pb-24 ">
      <section className="relative overflow-hidden min-h-[60vh]">
        <div className="absolute inset-0">
          <img src={header} alt="Nature park view" className="h-full w-full object-cover" />
        </div>
      </section>
      <section>
          <p className="font-sans text-xl md:text-xl text-[#445412] p-5 text-center">
            Choose from among our fantastic tour packages to immerse yourself at Farm Fresh @ UPM. Crafted to combine
            education with outdoor fun where you get to experience the vibrant nature, authentic dairy processing and all kinds of animals.
          </p>  
          <h3 className="font-sans font-bold text-2xl md:text-2xl text-[#445412] pt-10 text-center">
            All packages include tickets that provide access to the following activities and facilities.</h3>
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto justify-items-center p-6">            
              <Card className="w-full max-w-sm bg-white/40 p-6 border-b-4 border-[#445412]">
              <CardHeader className="font-fraunces font-bold text-center text-2xl text-[#445412]">
                Main Farm <br/> (Accessible by walking)
                </CardHeader>
                <ul className="list-disc list-outside pl-5 space-y-3 font-sans text-black">
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

            <Card className="w-full max-w-sm bg-white/40 p-6 border-b-4 border-[#445412]">
              <CardHeader className="font-fraunces  text-center  text-[#445412]">
                <CardTitle className="font-bold text-2xl">Second Farm <br/> (Accessible by tractor ride)<br/></CardTitle>
                <p className="text-xl">*One tractor can accommodate up to 40 adults.</p>
                </CardHeader>

                <ul className="list-disc list-outside pl-5 space-y-3 font-sans text-black border-b-2 border-[#445412] py-4">
                <li>Vegetable Farm</li>
              </ul>
              <p className="text-center font-bold">Tractor Operation Hours <br/>(Rides depart every 20 minutes)</p>
              <div className="grid grid-cols-2 gap-4 text-center border-[#445412] border-2 p-2 rounded-2xl ">
                <div className="font-bold">Weekdays <br/>(Monday - Friday)</div>
                <div className="text-2xl mt-2">10AM - 6PM</div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center border-[#445412] border-2 p-2 rounded-2xl ">
                <div className="font-bold whitespace-nowrap">Weekends<br/>(Saturday & Sunday)</div>
                <div className="text-2xl mt-2">9AM - 7PM</div>
              </div>
          </Card>
          </div>
      </section>
      <section>
        <div className="overflow-hidden -mx-6 w-screen content-center" ref={emblaRef}>
          <div className="flex p-6">
            {carouselImages.map((image) => (
              <div key={image.src} className="min-w-0 flex-[0_0_100%] min-h-max">
                <img src={image.src} alt={image.alt} className="h-auto w-full object-contain max-h-[80vh]" />
              </div>
            ))}
          </div>
          <img src={guideSrc} className="h-auto w-full object-contain max-h-[80vh]"/>
        </div>
      </section>
    </div>
  )
}
