'use client'

import React from 'react'
import { Mail, Phone, MapPin, MessageSquare, Clock } from 'lucide-react'

export function ContactSection() {
  return (
    <section id="contact" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 backdrop-blur-md text-xs font-bold text-primary uppercase tracking-widest">
            <MessageSquare className="h-3.5 w-3.5" />
            Get in Touch
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground font-display">
            Speak with our Gym Automation Specialists
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Have questions about franchise deployment, hardware integrations, or migrating your existing members? We're here to help.
          </p>
        </div>

        {/* Rebalanced, full-width responsive grid */}
        <div className="mt-16 max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Email Inquiries */}
            <a
              href="mailto:contact@vyayam.ai"
              className="flex flex-col p-6 rounded-2xl bg-card/80 border border-border/70 hover:border-primary/50 transition-all duration-200 backdrop-blur-xl shadow-lg group"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 mb-4">
                <Mail className="h-6 w-6" />
              </div>
              <span className="text-xs text-muted-foreground font-medium block">Email Inquiries</span>
              <span className="text-base font-bold text-foreground mt-1 break-all">contact@vyayam.ai</span>
              <span className="text-xs text-primary mt-auto pt-4 font-semibold group-hover:underline">
                Send an email →
              </span>
            </a>

            {/* 2. Direct Phone & WhatsApp */}
            <a
              href="tel:+919876543210"
              className="flex flex-col p-6 rounded-2xl bg-card/80 border border-border/70 hover:border-primary/50 transition-all duration-200 backdrop-blur-xl shadow-lg group"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0 mb-4">
                <Phone className="h-6 w-6" />
              </div>
              <span className="text-xs text-muted-foreground font-medium block">Direct Phone & WhatsApp</span>
              <span className="text-base font-bold text-foreground mt-1">+91 98765 43210</span>
              <span className="text-xs text-primary mt-auto pt-4 font-semibold group-hover:underline">
                Call our team →
              </span>
            </a>

            {/* 3. Headquarters & Tech Center */}
            <div className="flex flex-col p-6 rounded-2xl bg-card/80 border border-border/70 backdrop-blur-xl shadow-lg">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mb-4">
                <MapPin className="h-6 w-6" />
              </div>
              <span className="text-xs text-muted-foreground font-medium block">Headquarters & Tech Center</span>
              <span className="text-base font-bold text-foreground mt-1">Pune, Maharashtra, India</span>
              <span className="text-xs text-muted-foreground mt-auto pt-4">Central Innovation Hub</span>
            </div>

            {/* 4. Operating Hours */}
            <div className="flex flex-col p-6 rounded-2xl bg-card/80 border border-border/70 backdrop-blur-xl shadow-lg">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <span className="text-xs text-muted-foreground font-medium block">Operating Hours</span>
              <span className="text-base font-bold text-foreground mt-1">Mon–Fri: 9:00 AM – 5:00 PM</span>
              <span className="text-xs text-muted-foreground mt-auto pt-4">Indian Standard Time (IST)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
