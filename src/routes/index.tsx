import { createFileRoute } from '@tanstack/react-router'
import { HeroSection } from '@/components/mainHero'
import { InfoSection } from '@/components/moreInfo'

export const Route = createFileRoute('/')({ component: App })

function App() {

  return (
    <>
      <HeroSection/>
      <InfoSection/>
    </>
    
  )
}
