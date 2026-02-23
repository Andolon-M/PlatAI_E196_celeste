import { Navigation } from "@/modules/landing/components/navigation"
import { HeroSection } from "@/modules/landing/components/sections/hero-section"
import { MeetingsSection } from "@/modules/landing/components/sections/meetings-section"
import { AboutSection } from "@/modules/landing/components/sections/about-section"
import { ValuesSection } from "@/modules/landing/components/sections/values-section"
import { ContactSection } from "@/modules/landing/components/sections/contact-section"
import { Footer } from "@/modules/landing/components/footer"

export function LandingPage() {
  return (
    <main className="min-h-screen">
      <Navigation />
      <HeroSection />
      <MeetingsSection />
      <AboutSection />
      <ValuesSection />
      <ContactSection />
      <Footer />
    </main>
  )
}

