import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/mainHero'
import { InfoSection } from '@/components/moreInfo'
import { BookingsList } from '@/components/BookingsList'
export const Route = createFileRoute('/')({ component: App })

function App() {

  return (
    <>
      <HeroSection/>
      <InfoSection/>
      <BookingsList/>
    </>
    
  )
}
