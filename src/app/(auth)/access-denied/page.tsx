'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dumbbell, ShieldAlert, Mail, LogOut, ArrowLeft } from 'lucide-react'

export default function AccessDeniedPage() {
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
            <div className="h-14 w-14 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mx-auto mb-2 animate-pulse-glow">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <CardTitle className="text-2xl font-black text-foreground">
              Access Restricted
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm text-muted-foreground">
              Your gym account is currently suspended or access has been restricted by an administrator.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 text-xs text-muted-foreground space-y-2">
              <p className="font-semibold text-foreground">Reason for Restriction:</p>
              <p>
                Account status is marked as suspended. If you believe this is in error, please contact your account manager or submit an appeal.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="mailto:support@vyayam.ai"
                className="p-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 transition-colors flex items-center gap-3"
              >
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Submit Suspension Appeal</p>
                  <p className="text-[11px] text-muted-foreground">support@vyayam.ai</p>
                </div>
              </a>
            </div>

            <div className="pt-4 border-t border-border/40 flex items-center justify-between gap-3">
              <Link href="/" className="flex-1">
                <Button variant="outline" className="w-full text-xs font-semibold">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                  Home Page
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
