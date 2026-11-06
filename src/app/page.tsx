'use client'

import React from 'react'
import { FuturisticBackground } from '@/components/shared/futuristic-background'
import { LandingNavbar } from '@/components/landing/landing-navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { HowItWorksSection } from '@/components/landing/how-it-works-section'
import { AboutSection } from '@/components/landing/about-section'
import { PricingSection } from '@/components/landing/pricing-section'
import { TestimonialsSection } from '@/components/landing/testimonials-section'
import { ContactSection } from '@/components/landing/contact-section'
import { LandingFooter } from '@/components/landing/landing-footer'

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary/30 selection:text-foreground">
      {/* Dynamic Animated Ambient Background Canvas */}
      <FuturisticBackground />

      {/* Main Content Layout */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <LandingNavbar />

        <main className="flex-grow">
          <HeroSection />
          <FeaturesSection />
          <HowItWorksSection />
          <AboutSection />
          <PricingSection />
          <TestimonialsSection />
          <ContactSection />
        </main>

        <LandingFooter />
      </div>
    </div>
  )
}
