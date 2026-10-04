import Header from '../components/landing/Header'
import Hero from '../components/landing/Hero'
import { Sensors, Statement, Platform, Industries, Story, Mission, Footer } from '../components/landing/Sections'

export default function Landing() {
  return (
    <div className="landing">
      <Header />
      <main>
        <Hero />
        <Sensors />
        <Statement />
        <Platform />
        <Industries />
        <Story />
        <Mission />
      </main>
      <Footer />
    </div>
  )
}
