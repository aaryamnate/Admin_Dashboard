'use client'

import React from 'react'
import { UserCheck, Sliders, Rocket, CheckCircle2 } from 'lucide-react'

const steps = [
  {
    number: '01',
    title: 'Register & Setup Your Gym',
    description:
      'Create your gym owner account in under 60 seconds. Set your location, upload branding, and select a membership capacity plan.',
    icon: UserCheck,
    points: ['Instant Account Activation', 'Custom Branding & Logo', 'Branch Location Geocoding'],
  },
  {
    number: '02',
    title: 'Allocate Trainers & Onboard Members',
    description:
      'Configure trainer rosters with specializations like CrossFit, Weight Training, or Yoga. Let our algorithm balance client workloads automatically.',
    icon: Sliders,
    points: ['Smart Capacity Balancing', 'Trainer-Client Goal Matrix', 'Bulk Member Import'],
  },
  {
    number: '03',
    title: 'Drive Revenue & Automated Retention',
    description:
      'Unleash AI telemetry for biometrics, nutrition vision, renewal forecasts, and automated WhatsApp/Push reminders with zero manual spreadsheets.',
    icon: Rocket,
    points: ['Automated Expiry Alerts', 'Real-time Vital Analytics', 'Revenue Velocity Tracking'],
  },
]

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-24 relative bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Streamlined Execution
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground font-display">
            Up and Running in 3 Seamless Steps
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            No complex installations or long onboarding delays. Start managing your gym with AI today.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={idx}
                className="relative rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl p-8 shadow-lg hover:border-primary/50 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Step Number Watermark */}
                <span className="absolute top-6 right-6 text-4xl font-black text-muted/50 select-none">
                  {step.number}
                </span>

                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center text-primary">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground">{step.title}</h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>

                  <ul className="space-y-2 pt-2">
                    {step.points.map((point, pIdx) => (
                      <li key={pIdx} className="flex items-center gap-2 text-xs font-medium text-foreground">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
