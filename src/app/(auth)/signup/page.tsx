'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validators/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dumbbell, Eye, EyeOff, Sparkles, Activity, ShieldCheck, ArrowRight, Mail, RefreshCw, CheckCircle2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

function SignupForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPlan = searchParams.get('plan') || 'PRO'
  const { toast } = useToast()

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)

  // Verification state after form submission
  const [verificationPending, setVerificationPending] = useState(false)
  const [registeredEmail, setRegisteredEmail] = useState('')
  const [devVerificationUrl, setDevVerificationUrl] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!res.ok) {
        toast({
          title: 'Signup Failed',
          description: result.message || 'Unable to create account.',
          variant: 'error',
        })
        return
      }

      setRegisteredEmail(data.email)
      if (result.data?.devVerificationUrl) {
        setDevVerificationUrl(result.data.devVerificationUrl)
      }
      setVerificationPending(true)

      toast({
        title: 'Account Created',
        description: 'Please verify your email address before continuing.',
        variant: 'success',
      })
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again.',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    if (!registeredEmail) return
    setIsResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: registeredEmail }),
      })
      const result = await res.json()
      if (res.ok) {
        if (result.data?.devVerificationUrl) {
          setDevVerificationUrl(result.data.devVerificationUrl)
        }
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
    <div className="flex flex-col md:flex-row w-full min-h-screen overflow-hidden bg-background">
      {/* Left Visual Illustration Column */}
      <div className="relative hidden md:flex md:w-1/2 bg-gradient-to-tr from-primary to-accent overflow-hidden flex-col justify-between p-12">
        {/* Background Glowing Circles */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-96 h-96 rounded-full bg-secondary/20 blur-3xl" />

        {/* Top Branding */}
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl overflow-hidden bg-[#20252b] flex items-center justify-center border border-primary/30 shadow-md">
              <Image
                src="/assets/vyayam-ai-logo.png"
                alt="VYAYAM AI Logo"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <span className="font-display text-xl font-black text-white tracking-tight">
              VYAYAM AI
            </span>
          </Link>
        </div>

        {/* Feature Preview Card */}
        <div className="relative z-10 flex-grow flex items-center justify-center p-6">
          <div className="w-full max-w-sm bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-2xl space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold tracking-widest text-white/90 uppercase flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                Gym Owner Onboarding
              </span>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse-glow" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center border border-white/25">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Modern Gym Management</p>
                  <p className="text-xs text-white/70">Intelligent Operations & Analytics</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 text-xs text-white/80">
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Isolated multi-gym database security</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <Sparkles className="h-4 w-4 text-teal-300 shrink-0" />
                  <span>AI-driven trainer load balancing</span>
                </div>
                <div className="flex items-center gap-2 bg-white/5 rounded-lg p-2.5 border border-white/10">
                  <Activity className="h-4 w-4 text-emerald-300 shrink-0" />
                  <span>Automated biometric analytics</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 text-white/70 text-xs">
          <p>© {new Date().getFullYear()} VYAYAM AI. Executive Fitness & SaaS Intelligence.</p>
        </div>
      </div>

      {/* Right Form Column */}
      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center p-6 sm:p-10 bg-background overflow-y-auto">
        <div className="w-full max-w-md space-y-6 flex flex-col items-center my-auto">
          {/* Mobile Logo */}
          <Link href="/" className="md:hidden flex items-center gap-3 mb-2">
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
            {verificationPending ? (
              <>
                <CardHeader className="text-center pb-3">
                  <div className="mx-auto h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-3 text-primary">
                    <Mail className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-2xl font-black text-foreground">Verify Your Email</CardTitle>
                  <CardDescription className="text-sm font-medium text-foreground/80 mt-1">
                    Please verify your email address before continuing.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <p className="text-xs sm:text-sm text-muted-foreground text-center">
                    We sent a secure verification link to <span className="font-semibold text-foreground">{registeredEmail}</span>. Click the link in your email to activate your account and set up your gym.
                  </p>

                  {devVerificationUrl && (
                    <div className="p-3 rounded-xl bg-primary/10 border border-primary/25 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-bold text-primary">
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Development Quick Verification</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        For seamless local testing, you can verify directly by clicking below:
                      </p>
                      <a
                        href={devVerificationUrl}
                        className="inline-block text-xs font-semibold text-primary underline break-all hover:text-primary/80"
                      >
                        Verify this email now →
                      </a>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <Button
                      onClick={handleResend}
                      isLoading={isResending}
                      variant="outline"
                      className="w-full border-border/80 hover:bg-card py-5 font-semibold text-sm"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Resend Verification Email
                    </Button>

                    <Link href="/login" className="block w-full">
                      <Button
                        variant="ghost"
                        className="w-full text-muted-foreground hover:text-foreground text-sm"
                      >
                        Return to Sign In
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </>
            ) : (
              <>
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-2xl font-black text-foreground">Create Gym Account</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-muted-foreground">
                    Start managing your gym with AI intelligence in 60 seconds
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Owner Full Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Vikramaditya Rathore"
                        autoComplete="name"
                        error={errors.name?.message}
                        {...register('name')}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email">Work Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="owner@yourgym.com"
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
                          placeholder="At least 8 chars (1 upper, 1 lower, 1 digit)"
                          autoComplete="new-password"
                          error={errors.password?.message}
                          {...register('password')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Repeat your password"
                          autoComplete="new-password"
                          error={errors.confirmPassword?.message}
                          {...register('confirmPassword')}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-base shadow-md shadow-primary/25 mt-2"
                      isLoading={isLoading}
                    >
                      Create Account & Continue
                      <ArrowRight className="h-4 w-4 ml-1.5" />
                    </Button>

                    <p className="text-center text-xs text-muted-foreground mt-4">
                      Already have a gym account?{' '}
                      <Link href="/login" className="text-primary font-bold hover:underline">
                        Sign In
                      </Link>
                    </p>
                  </form>
                </CardContent>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <SignupForm />
    </Suspense>
  )
}
