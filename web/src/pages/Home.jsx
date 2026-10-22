import Hero from '../components/Hero'
import CourseSlider from '../components/CourseSlider'
import LogoMarquee from '../components/LogoMarquee'
import EventHero from '../components/EventHero'
import StackingBanners from '../components/StackingBanners'
import BrandFeatures from '../components/BrandFeatures'
import LandingRegisterButton from '../components/LandingRegisterButton'
import { eventData } from '../constants/events'

const Home = ({ isLoaded }) => {
  return (
    <div className="w-full">
      <Hero isLoaded={isLoaded} />
      <CourseSlider />

      {/* Dynamic Event Showcase */}
      {/* <EventHero events={eventData} /> */}
      
      <LogoMarquee />
      <StackingBanners />
      <BrandFeatures />

      {/* Fixed bottom-right Register Button (Toggleable from Admin) */}
      <LandingRegisterButton />
    </div>
  )
}

export default Home
