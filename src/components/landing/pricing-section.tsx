'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Check, Sparkles, ArrowRight, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SpotlightCard } from '@/components/shared/spotlight-card'

const plans = [
  {
    id: 'STARTER',
    name: 'Starter Studio',
    tagline: 'Ideal for independent boutique gyms and fitness studios.',
    monthlyPrice: 3999,
    annualPrice: 3199,
    popular: false,
    features: [
      'Up to 250 Active Members',
      'Up to 5 Trainer Accounts',
      'Basic Health & BMI Tracking',
      'Membership Expiry Notifications',
      'Daily Revenue & Attendance Log',
      'Standard Email & In-App Support',
    ],
  },
  {
    id: 'PRO',
    name: 'Growth & Pro',
    tagline: 'The ultimate power suite for growing commercial gyms.',
    monthlyPrice: 7999,
    annualPrice: 6399,
    popular: true,
    features: [
      'Up to 1,500 Active Members',
      'Unlimited Trainer Accounts',
      'Smart Algorithmic Trainer Allocation Engine',
      'AI Food Vision & Macro Nutrient Logging',
      'Comprehensive Biometric Analytics & Reports',
      'Revenue Forecasting & Retention Alerts',
      'Automated WhatsApp & Push Broadcasts',
      'Priority 24/7 Support with 1-Hour SLA',
    ],
  },
  {
    id: 'ENTERPRISE',
    name: 'Franchise & Multi-Gym',
    tagline: 'Engineered for gym chains and enterprise fitness brands.',
    monthlyPrice: 15999,
    annualPrice: 12799,
    popular: false,
    features: [
      'Unlimited Members & Unlimited Branches',
      'Centralized Multi-Location Master Dashboard',
      'Tenant-Level Strict Data Isolation',
      'Custom Gym Logo & Theme Customization',
      'Direct API Access & Hardware Integration',
      'Dedicated Account Manager & Training Team',
      'Enterprise Uptime SLA',
    ],
  },
]

export function PricingSection() {
  const [annual, setAnnual] = useState(true)

  return (
    <section id="pricing" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 backdrop-blur-md text-xs font-bold text-primary uppercase tracking-widest">
            <Zap className="h-3.5 w-3.5" />
            Transparent Investment
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground font-display">
            Simple, Scalable Pricing for Gyms of Any Size
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Select the tier that best matches your facility's athlete capacity.
          </p>

          {/* Billing Interval Switcher */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-semibold cursor-pointer ${
                !annual ? 'text-foreground' : 'text-muted-foreground'
              }`}
              onClick={() => setAnnual(false)}
            >
              Monthly Billing
            </span>

            <button
              type="button"
              onClick={() => setAnnual(!annual)}
              className="relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-muted p-0.5 transition-colors duration-200 ease-in-out focus:outline-none"
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary shadow ring-0 transition duration-200 ease-in-out ${
                  annual ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>

            <span
              className={`text-sm font-semibold cursor-pointer flex items-center gap-1.5 ${
                annual ? 'text-foreground' : 'text-muted-foreground'
              }`}
              onClick={() => setAnnual(true)}
            >
              Annual Billing
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice
            return (
              <SpotlightCard
                key={plan.id}
                spotlightColor={plan.popular ? 'rgba(232, 232, 64, 0.2)' : 'rgba(184, 184, 216, 0.1)'}
                className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                  plan.popular
                    ? 'border-2 border-primary bg-card/95 shadow-2xl shadow-primary/10 -translate-y-2'
                    : 'border border-border/70 bg-card/70 backdrop-blur-xl'
                }`}
              >
                {/* Popular Pill */}
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-primary-foreground text-xs font-black uppercase tracking-wider shadow-lg flex items-center gap-1.5">
                    <Sparkles className="h-3 w-3" />
                    Most Popular Choice
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-black text-foreground">{plan.name}</h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{plan.tagline}</p>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-foreground">
                      ₹{price.toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">/ month</span>
                  </div>

                  {annual && (
                    <p className="text-[11px] text-primary font-medium">Billed annually (save ₹{((plan.monthlyPrice - plan.annualPrice) * 12).toLocaleString()}/yr)</p>
                  )}

                  {/* Feature Checklist */}
                  <ul className="space-y-3 pt-4 border-t border-border/50 text-xs">
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5 text-foreground">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action CTA */}
                <div className="pt-8">
                  <Link href={`/signup?plan=${plan.id}`}>
                    <Button
                      className={`w-full py-6 font-bold text-sm justify-center ${
                        plan.popular
                          ? 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60'
                      }`}
                    >
                      Get Started
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>
                  </Link>
                </div>
              </SpotlightCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
