'use client'

import React from 'react'
import { Star, Quote } from 'lucide-react'
import { Avatar } from '@/components/ui/avatar'

const testimonials = [
  {
    quote:
      'VYAYAM AI revolutionized how we manage our personal trainers and gym members. The smart allocation engine eliminated manual scheduling friction and keeps our entire team aligned.',
    author: 'Vikramaditya Rathore',
    title: 'Founder & Head Coach',
    gym: 'Apex Strength & Conditioning, Mumbai',
    rating: 5,
  },
  {
    quote:
      'The member health telemetry and automated food vision give us a huge competitive edge. Our members love seeing their biometrics improve, and our coaches deliver far more personalized guidance.',
    author: 'Sunaina Mehta',
    title: 'Operations Director',
    gym: 'Pulse Elite Fitness, Bengaluru',
    rating: 5,
  },
  {
    quote:
      'Managing multiple gym branches has never been smoother. Having isolated branch databases with an executive overview under one master VYAYAM AI login made scaling straightforward.',
    author: 'Kabeer Deshmukh',
    title: 'Managing Partner',
    gym: 'Ironclad Fitness Group, Pune',
    rating: 5,
  },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 relative bg-muted/20 border-y border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs font-bold uppercase tracking-widest text-primary">
            Proven Results
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground font-display">
            Loved by Hundreds of Gym Owners & Coaches
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            See how gym directors and fitness entrepreneurs scale their operations with VYAYAM AI.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-border/70 bg-card/80 backdrop-blur-xl p-8 shadow-lg flex flex-col justify-between space-y-6 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-1 text-primary">
                  {[...Array(t.rating)].map((_, rIdx) => (
                    <Star key={rIdx} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>

                <Quote className="h-8 w-8 text-primary/30" />

                <p className="text-sm text-foreground leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center gap-3">
                <Avatar fallback={t.author.charAt(0)} size="md" className="bg-primary/20 text-primary font-bold" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{t.author}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.title}</p>
                  <p className="text-[11px] text-primary font-medium truncate">{t.gym}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
