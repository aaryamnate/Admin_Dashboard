'use client'

import React from 'react'
import {
  HeartPulse,
  GitBranch,
  Apple,
  Zap,
} from 'lucide-react'
import { SpotlightCard } from '@/components/shared/spotlight-card'

const features = [
  {
    icon: HeartPulse,
    title: 'AI Biometric & Health Analytics',
    description:
      'Continuous body fat tracking, BMI analysis, blood report parsing, and dynamic wellness scoring. Keep members engaged with data-backed progress visualization.',
    badge: 'Real-time AI',
    color: 'text-primary',
  },
  {
    icon: GitBranch,
    title: 'Smart Trainer Allocation Engine',
    description:
      'Eliminate trainer overload with intelligent assignment algorithms that match client fitness goals with trainer specializations and live capacity.',
    badge: 'Load Balanced',
    color: 'text-accent',
  },
  {
    icon: Apple,
    title: 'Autonomous Nutrition & Food Vision',
    description:
      'AI-powered meal recognition, automatic macronutrient breakdown (protein, carbs, fats), and caloric goal compliance tracking for every member.',
    badge: 'Computer Vision',
    color: 'text-emerald-400',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 backdrop-blur-md text-xs font-bold text-primary uppercase tracking-widest">
            <Zap className="h-3.5 w-3.5" />
            Cutting-Edge Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground font-display">
            Built for High-Growth Fitness Franchises & Modern Gyms
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Everything you need to eliminate operational bottlenecks, empower your trainers, and give your gym members an unmatched experience.
          </p>
        </div>

        {/* Features Grid - Clean 3-column layout */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <SpotlightCard
                key={idx}
                spotlightColor="rgba(232, 232, 64, 0.12)"
                className="group border border-border/70 bg-card/60 backdrop-blur-xl p-8 rounded-2xl hover:border-primary/50 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-muted/60 text-foreground border border-border/50">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </SpotlightCard>
            )
          })}
        </div>
      </div>
    </section>
  )
}
