'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dumbbell, Clock, Mail, Phone, LogOut, ArrowLeft, ShieldCheck } from 'lucide-react'

export default function PendingApprovalPage() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } catch {}
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-[#20252b] border border-primary/30 shadow-sm flex items-center justify-center">
              <Image
                src="/assets/vyayam-ai-logo.png"
                alt="VYAYAM AI Logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <span className="text-xl font-black tracking-tight text-foreground font-display">
              VYAYAM <span className="text-primary">AI</span>
            </span>
          </Link>
        </div>

        <Card className="glass-card border-border/60 shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            <div className="h-14 w-14 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 mx-auto mb-2 animate-pulse-glow">
              <Clock className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-black text-foreground">
              Account Pending Review
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Your gym registration has been received and is undergoing verification by our team.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-muted/40 border border-border/50 text-xs text-muted-foreground space-y-2.5">
              <div className="flex items-center gap-2 font-bold text-foreground">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>Verification in Progress</span>
              </div>
              <p>
                To maintain data integrity and security, enterprise gym registrations are typically reviewed within <strong>2 to 4 business hours</strong>.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">
                Need Instant Activation?
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <a
                  href="mailto:approvals@vyayam.ai"
                  className="p-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 transition-colors flex flex-col items-center gap-1.5 text-center"
                >
                  <Mail className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">Email Support</span>
                  <span className="text-[10px] text-muted-foreground">approvals@vyayam.ai</span>
                </a>
                <a
                  href="tel:+919876543210"
                  className="p-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 transition-colors flex flex-col items-center gap-1.5 text-center"
                >
                  <Phone className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-foreground">Direct Line</span>
                  <span className="text-[10px] text-muted-foreground">+91 98765 43210</span>
                </a>
              </div>
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-3">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full text-xs font-semibold">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Back to Home
                </Button>
              </Link>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="flex-1 text-xs font-semibold"
              >
                <LogOut className="h-3.5 w-3.5 mr-1" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
