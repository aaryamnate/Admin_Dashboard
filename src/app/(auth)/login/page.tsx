'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validators/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Eye, EyeOff, Sparkles, Activity, ArrowRight, ShieldCheck, Mail, RefreshCw, AlertCircle } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null)
  const [unverifiedNotice, setUnverifiedNotice] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const currentEmail = watch('email')

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    setUnverifiedNotice(null)
    setUnverifiedEmail(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!res.ok) {
        if (result.redirectUrl) {
          window.location.href = result.redirectUrl
          return
        }

        // If email is unverified, show dedicated banner and offer resend
        if (result.code === 'EMAIL_NOT_VERIFIED') {
          setUnverifiedEmail(data.email)
          setUnverifiedNotice(result.message || 'Please verify your email address before continuing.')
          toast({
            title: 'Email Verification Required',
            description: result.message || 'Please verify your email address before continuing.',
            variant: 'error',
          })
          return
        }

        // Exact message displayed from backend: e.g. "No account found. Please create an account first." or "Invalid password..."
        toast({
          title: 'Sign In Failed',
          description: result.message || 'Invalid credentials',
          variant: 'error',
        })
        return
      }

      toast({ title: 'Welcome back!', description: 'Redirecting to your dashboard...', variant: 'success' })
      const targetUrl = result.data?.redirectUrl || '/dashboard'
      window.location.href = targetUrl
    } catch {
      toast({ title: 'Error', description: 'Something went wrong. Please try again.', variant: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    const targetEmail = unverifiedEmail || currentEmail
    if (!targetEmail) return

    setIsResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      })
      const result = await res.json()

      if (res.ok) {
        toast({
          title: 'Verification Link Sent',
          description: 'A new verification link has been sent to your email.',
          variant: 'success',
        })
      } else {
        toast({
          title: 'Resend Failed',
          description: result.message || 'Could not send verification email.',
          variant: 'error',
        })
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Network error. Please try again.',
        variant: 'error',
      })
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="flex flex-col md:flex-row w-full h-screen overflow-hidden bg-background">
      {/* Left Section: Visual / Pattern */}
      <div className="relative hidden md:flex md:w-1/2 bg-gradient-to-tr from-primary to-accent overflow-hidden flex-col justify-between p-12">
        {/* Background Decorative Circles */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />

        {/* Branding */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden border border-primary/30 bg-[#20252b] flex items-center justify-center">
              <Image
                src="/assets/vyayam-ai-logo.png"
                alt="VYAYAM AI"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-display text-xl font-black text-white tracking-tight">VYAYAM AI</span>
          </Link>
        </div>

        {/* Graphic Mockup Area */}
        <div className="relative z-10 flex-grow flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold tracking-widest text-white/90 uppercase flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-emerald-400" />
                AI Health Telemetry
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/25">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Marcus Sterling</p>
                  <p className="text-xs text-white/70">Target: 82.5 kg • Active Plan</p>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between text-xs text-white/90 mb-1 font-medium">
                  <span>Health Metric Index</span>
                  <span>94.8%</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 w-[94.8%]" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-white/90">
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <p className="text-[10px] text-white/60 uppercase font-semibold">Active Cal</p>
                  <p className="text-xs font-bold mt-0.5 text-emerald-300">2.1k Kcal</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <p className="text-[10px] text-white/60 uppercase font-semibold">Allocated Trainer</p>
                  <p className="text-xs font-bold mt-0.5 text-teal-300">Arjun K.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <div className="relative z-10 text-white/70 text-xs">
          <p>© {new Date().getFullYear()} VYAYAM AI. Executive Fitness & SaaS Intelligence.</p>
        </div>
      </div>

      {/* Right Section: Form */}
      <div className="w-full md:w-1/2 h-full flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 flex flex-col items-center">
          {/* Logo on mobile */}
          <Link href="/" className="md:hidden flex items-center gap-3 mb-4">
            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-[#20252b] border border-primary/30 shadow-sm flex items-center justify-center">
              <Image
                src="/assets/vyayam-ai-logo.png"
                alt="VYAYAM AI Logo"
                width={36}
                height={36}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <span className="font-display text-xl font-black text-foreground tracking-tight">
              VYAYAM <span className="text-primary">AI</span>
            </span>
          </Link>

          <Card className="w-full glass-card border-border/50 shadow-2xl bg-card/70 backdrop-blur-xl">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-black text-foreground">Sign In to Gym Portal</CardTitle>
              <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                Enter your credentials to access your gym operations dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              {unverifiedNotice && (
                <div className="mb-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-2">
                  <div className="flex items-start gap-2 text-amber-500 text-xs font-semibold">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{unverifiedNotice}</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    isLoading={isResending}
                    className="w-full text-xs h-8 border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
                  >
                    <RefreshCw className="h-3 w-3 mr-1.5" />
                    Resend Verification Email
                  </Button>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@gymadmin.com"
                    autoComplete="email"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-base shadow-md shadow-primary/25 mt-2"
                  isLoading={isLoading}
                >
                  Login
                </Button>

                <div className="pt-2 text-center text-xs text-muted-foreground">
                  Don't have a gym account?{' '}
                  <Link href="/signup" className="text-primary font-bold hover:underline">
                    Create an Account
                  </Link>
                </div>

                <div className="pt-3 border-t border-border/40 text-center text-[11px] text-muted-foreground">
                  Default Demo Access: <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono">admin@gymadmin.com</code> / <code className="bg-muted px-1.5 py-0.5 rounded text-primary font-mono">Admin@123</code>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
