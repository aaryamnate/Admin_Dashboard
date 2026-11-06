'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Shield, Lock } from 'lucide-react'

export function LandingFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/90 backdrop-blur-xl relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-md shadow-primary/20 flex items-center justify-center bg-[#20252b] border border-primary/30">
                <Image
                  src="/assets/vyayam-ai-logo.png"
                  alt="VYAYAM AI"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-black tracking-tight text-foreground font-display">
                VYAYAM <span className="text-primary">AI</span>
              </span>
            </Link>

            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              The next-generation gym management SaaS platform. Bringing algorithmic trainer balancing, vital health telemetry, and autonomous nutrition tracking to gym owners worldwide.
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-primary" />
                Multi-Tenant Isolated
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-primary" />
                256-bit Encryption
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground">
              Platform
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="#features" className="hover:text-foreground hover:text-primary transition-colors">
                  AI Biometrics
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-foreground hover:text-primary transition-colors">
                  Smart Allocation Engine
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-foreground hover:text-primary transition-colors">
                  Food & Macro Vision
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-foreground hover:text-primary transition-colors">
                  Pricing Plans
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground">
              Portals & Access
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground hover:text-primary transition-colors">
                  Gym Owner Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-foreground hover:text-primary transition-colors">
                  Register Gym Account
                </Link>
              </li>
              <li>
                <Link href="/onboarding" className="hover:text-foreground hover:text-primary transition-colors">
                  Gym Onboarding Wizard
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground hover:text-primary transition-colors">
                  Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact / Help */}
          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground">
              Connect
            </p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <a href="mailto:contact@vyayam.ai" className="hover:text-foreground hover:text-primary transition-colors">
                  contact@vyayam.ai
                </a>
              </li>
              <li>
                <a href="tel:+919876543210" className="hover:text-foreground hover:text-primary transition-colors">
                  +91 98765 43210
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-foreground hover:text-primary transition-colors">
                  Support & Helpdesk
                </a>
              </li>
              <li>
                <span className="text-xs text-muted-foreground/70">
                  Pune, Maharashtra, India.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="mt-12 pt-8 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} VYAYAM AI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-foreground cursor-pointer">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer">Terms of Service</span>
            <span className="hover:text-foreground cursor-pointer">Security Overview</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
