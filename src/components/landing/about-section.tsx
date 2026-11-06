'use client'

import React from 'react'
import { ShieldCheck, Cpu, Award, Sliders, RefreshCw } from 'lucide-react'

export function AboutSection() {
  return (
    <section id="about" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 backdrop-blur-md text-xs font-bold text-primary uppercase tracking-widest">
            <Award className="h-3.5 w-3.5" />
            Our Vision & Architecture
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-foreground font-display leading-tight">
            Engineered by Fitness Technologists for High-Performance Gyms
          </h2>

          <p className="text-base text-muted-foreground leading-relaxed">
            VYAYAM AI was engineered from the ground up to address fragmented tools gym owners deal with every day.
            By uniting operational management, trainer load distribution, and automated biometric tracking,
            VYAYAM AI turns gym management into a streamlined, high-performance platform.
          </p>
        </div>

        {/* 4 Balanced Architectural Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl space-y-3 hover:border-primary/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Enterprise Security</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Gym-level tenant data isolation with encrypted records and role-based operational permissions.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl space-y-3 hover:border-primary/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Cpu className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">AI-Driven Telemetry</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Continuous biometric health analytics, food vision classification, and member engagement insight.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl space-y-3 hover:border-primary/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Sliders className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Trainer Balancing</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Algorithmic capacity management matching athlete goals with trainer specialization and schedule.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-border/70 bg-card/60 backdrop-blur-xl space-y-3 hover:border-primary/40 transition-all">
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <RefreshCw className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Automated Workflows</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Automated expiry notices, renewal scheduling, and push announcements replacing manual tracking.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
