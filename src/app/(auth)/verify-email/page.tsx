'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, XCircle, Loader2, ArrowRight, RefreshCw, Mail } from 'lucide-react'
import { useToast } from '@/components/ui/toast'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const emailParam = searchParams.get('email') || ''
  const { toast } = useToast()

  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')
  const [isResending, setIsResending] = useState(false)
  const [emailToResend, setEmailToResend] = useState(emailParam)

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setErrorMessage('Missing verification token. Please verify using the complete link sent to your email.')
      return
    }

    async function verify() {
      try {
        const res = await fetch('/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, email: emailParam }),
        })
        const data = await res.json()

        if (res.ok) {
          setStatus('success')
        } else {
          setStatus('error')
          setErrorMessage(data.message || 'Verification token is invalid or has expired.')
        }
      } catch (err) {
        setStatus('error')
        setErrorMessage('Failed to connect to verification server. Please try again.')
      }
    }

    verify()
  }, [token, emailParam])

  const handleResend = async () => {
    if (!emailToResend) {
      toast({
        title: 'Email Required',
        description: 'Please provide the email address used during registration.',
        variant: 'error',
      })
      return
    }

    setIsResending(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToResend }),
      })
      const data = await res.json()

      if (res.ok) {
        toast({
          title: 'Verification Link Sent',
          description: data.message || 'Please check your email inbox for the new verification link.',
          variant: 'success',
        })
      } else {
        toast({
          title: 'Resend Failed',
          description: data.message || 'Could not send verification email.',
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
    <div className="min-h-screen w-full flex items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="flex justify-center mb-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-[#20252b] border border-primary/30 shadow-md flex items-center justify-center">
              <Image
                src="/assets/vyayam-ai-logo.png"
                alt="VYAYAM AI"
                width={44}
                height={44}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <span className="font-display text-2xl font-black text-foreground tracking-tight">
              VYAYAM <span className="text-primary">AI</span>
            </span>
          </Link>
        </div>

        <Card className="glass-card border-border/60 shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-4">
            {status === 'verifying' && (
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
              </div>
            )}

            {status === 'success' && (
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-3 text-emerald-400">
                <CheckCircle2 className="h-9 w-9" />
              </div>
            )}

            {status === 'error' && (
              <div className="mx-auto h-16 w-16 rounded-full bg-destructive/15 border border-destructive/30 flex items-center justify-center mb-3 text-destructive">
                <XCircle className="h-9 w-9" />
              </div>
            )}

            <CardTitle className="text-2xl font-black text-foreground">
              {status === 'verifying' && 'Verifying Your Email...'}
              {status === 'success' && 'Email Verified Successfully!'}
              {status === 'error' && 'Verification Unsuccessful'}
            </CardTitle>

            <CardDescription className="text-sm text-muted-foreground mt-1">
              {status === 'verifying' && 'Confirming your gym owner credentials with the security server...'}
              {status === 'success' && 'Your email address has been verified. You can now log in to configure your gym.'}
              {status === 'error' && errorMessage}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {status === 'success' && (
              <div className="space-y-3">
                <Link href="/login" className="block w-full">
                  <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 text-base shadow-md shadow-primary/25">
                    Proceed to Login
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive">
                  {errorMessage}
                </div>

                {emailParam && (
                  <Button
                    onClick={handleResend}
                    isLoading={isResending}
                    variant="outline"
                    className="w-full border-border/80 hover:bg-card py-5"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Resend Verification Email to {emailParam}
                  </Button>
                )}

                <div className="flex items-center justify-between pt-2 text-xs">
                  <Link href="/login" className="text-primary font-semibold hover:underline">
                    Back to Sign In
                  </Link>
                  <Link href="/signup" className="text-muted-foreground hover:text-foreground">
                    Create New Account
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
