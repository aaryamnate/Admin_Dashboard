'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingSchema, type OnboardingInput } from '@/lib/validators/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dumbbell,
  Building2,
  MapPin,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Phone,
  Mail,
  User,
  Image as ImageIcon,
  Upload,
} from 'lucide-react'
import { useToast } from '@/components/ui/toast'

const steps = [
  { id: 1, name: 'Gym Identity', desc: 'Name & Owner Details' },
  { id: 2, name: 'Location & Contact', desc: 'Address & Phone' },
  { id: 3, name: 'Plan & Customization', desc: 'Tier & Logo' },
  { id: 4, name: 'Confirmation', desc: 'Review & Launch' },
]

function OnboardingForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = (searchParams.get('plan') as 'STARTER' | 'PRO' | 'ENTERPRISE') || 'PRO'
  const { toast } = useToast()

  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingInitial, setIsFetchingInitial] = useState(true)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OnboardingInput>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      gymName: '',
      ownerName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      plan: planParam,
      logoUrl: '',
      estimatedMembers: '250-500',
    },
  })

  const formValues = watch()

  // Load existing draft info if resuming
  useEffect(() => {
    async function loadDraft() {
      try {
        const res = await fetch('/api/onboarding')
        if (res.ok) {
          const json = await res.json()
          if (json.data?.user) {
            setValue('ownerName', json.data.user.name || '')
            setValue('email', json.data.user.email || '')
            if (json.data.user.phone) setValue('phone', json.data.user.phone)
          }
          if (json.data?.gym) {
            setValue('gymName', json.data.gym.name || '')
            if (json.data.gym.phone) setValue('phone', json.data.gym.phone)
            if (json.data.gym.email) setValue('email', json.data.gym.email)
            if (json.data.gym.address) setValue('address', json.data.gym.address)
            if (json.data.gym.city) setValue('city', json.data.gym.city)
            if (json.data.gym.state) setValue('state', json.data.gym.state)
            if (json.data.gym.pincode) setValue('pincode', json.data.gym.pincode)
            if (json.data.gym.plan) setValue('plan', json.data.gym.plan)
            if (json.data.gym.logoUrl) {
              setValue('logoUrl', json.data.gym.logoUrl)
              setLogoPreview(json.data.gym.logoUrl)
            }
          }
        }
      } catch (err) {
        console.error('Failed to load onboarding draft', err)
      } finally {
        setIsFetchingInitial(false)
      }
    }
    loadDraft()
  }, [setValue])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a PNG, JPG, or WebP image.',
        variant: 'error',
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File Too Large',
        description: 'Logo file size must be less than 5MB.',
        variant: 'error',
      })
      return
    }

    const localUrl = URL.createObjectURL(file)
    setLogoPreview(localUrl)

    setIsUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const json = await res.json()
      if (res.ok && json.data?.url) {
        setValue('logoUrl', json.data.url)
        setLogoPreview(json.data.url)
        toast({
          title: 'Logo Uploaded',
          description: 'Your custom gym logo was uploaded successfully.',
          variant: 'success',
        })
      } else {
        throw new Error(json.message || 'Upload failed')
      }
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload logo',
        variant: 'error',
      })
      setLogoPreview(null)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof OnboardingInput)[] = []
    if (currentStep === 1) {
      fieldsToValidate = ['gymName', 'ownerName', 'email']
    } else if (currentStep === 2) {
      fieldsToValidate = ['phone', 'address', 'city']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length))
    }
  }

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const onSubmit = async (data: OnboardingInput) => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })
      const result = await res.json()

      if (!res.ok) {
        toast({
          title: 'Onboarding Incomplete',
          description: result.message || 'Please check your inputs.',
          variant: 'error',
        })
        return
      }

      toast({
        title: 'Gym Setup Complete! 🎉',
        description: 'Launching your VYAYAM AI dashboard...',
        variant: 'success',
      })

      const target = result.data?.redirectUrl || '/dashboard'
      window.location.href = target
    } catch {
      toast({
        title: 'Error',
        description: 'Something went wrong while setting up your gym.',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetchingInitial) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-semibold text-muted-foreground">Loading gym onboarding details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-background py-10 px-4 sm:px-6 lg:px-8 flex flex-col justify-between">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-8">
        <Link href="/" className="flex items-center gap-3">
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
          <span className="text-lg font-black tracking-tight text-foreground font-display">
            VYAYAM <span className="text-primary">AI</span>
          </span>
        </Link>
      </header>

      {/* Main Wizard Container */}
      <main className="max-w-3xl mx-auto w-full my-auto">
        {/* Progress Bar & Steps indicator */}
        <div className="mb-8">
          <div className="grid grid-cols-4 gap-2 mb-3">
            {steps.map((step) => {
              const isActive = currentStep === step.id
              const isDone = currentStep > step.id
              return (
                <div key={step.id} className="flex flex-col space-y-1">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      isActive
                        ? 'bg-primary'
                        : isDone
                        ? 'bg-primary/70'
                        : 'bg-muted'
                    }`}
                  />
                  <span
                    className={`text-[11px] font-bold truncate hidden sm:block ${
                      isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {step.id}. {step.name}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-primary">
              Step {currentStep} of {steps.length}
            </p>
            <h2 className="text-2xl font-black text-foreground">
              {steps[currentStep - 1].name}
            </h2>
            <p className="text-xs text-muted-foreground">
              {steps[currentStep - 1].desc}
            </p>
          </div>
        </div>

        {/* Wizard Form Card */}
        <Card className="glass-card border-border/60 shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardContent className="p-6 sm:p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* STEP 1: Gym Identity */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <Label htmlFor="gymName">Gym / Facility Name *</Label>
                    <div className="relative">
                      <Input
                        id="gymName"
                        placeholder="e.g. Iron Titan Fitness Arena"
                        error={errors.gymName?.message}
                        {...register('gymName')}
                      />
                      <Building2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="ownerName">Owner / Primary Contact Name *</Label>
                      <div className="relative">
                        <Input
                          id="ownerName"
                          placeholder="Your Full Name"
                          error={errors.ownerName?.message}
                          {...register('ownerName')}
                        />
                        <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="email">Official Gym Email *</Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          placeholder="admin@yourgym.com"
                          error={errors.email?.message}
                          {...register('email')}
                        />
                        <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 flex items-start gap-3">
                    <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Your gym facility will receive a dedicated, isolated database partition. All future trainer accounts and member telemetry will belong exclusively to this gym.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: Location & Contact */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone / WhatsApp Helpline *</Label>
                    <div className="relative">
                      <Input
                        id="phone"
                        placeholder="+91 98765 43210"
                        error={errors.phone?.message}
                        {...register('phone')}
                      />
                      <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="address">Street Address / Facility Location *</Label>
                    <div className="relative">
                      <Input
                        id="address"
                        placeholder="e.g. 42 Olympus Boulevard, Ground Floor"
                        error={errors.address?.message}
                        {...register('address')}
                      />
                      <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        placeholder="e.g. Mumbai"
                        error={errors.city?.message}
                        {...register('city')}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="state">State / Province</Label>
                      <Input
                        id="state"
                        placeholder="e.g. Maharashtra"
                        {...register('state')}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="pincode">Pincode / Zip</Label>
                      <Input
                        id="pincode"
                        placeholder="e.g. 400051"
                        {...register('pincode')}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Plan & Branding */}
              {currentStep === 3 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Select Subscription Tier</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { id: 'STARTER', name: 'Starter', price: '₹3,999/mo', desc: 'Up to 250 members' },
                        { id: 'PRO', name: 'Growth & Pro', price: '₹7,999/mo', desc: 'AI Allocation & Food Vision' },
                        { id: 'ENTERPRISE', name: 'Enterprise', price: '₹15,999/mo', desc: 'Multi-branch & API' },
                      ].map((tier) => {
                        const isSelected = formValues.plan === tier.id
                        return (
                          <div
                            key={tier.id}
                            onClick={() => setValue('plan', tier.id as any)}
                            className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'border-primary bg-primary/10 shadow-md ring-1 ring-primary'
                                : 'border-border/60 bg-card/60 hover:border-border'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-sm text-foreground">{tier.name}</span>
                              {isSelected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                            </div>
                            <p className="text-xs font-black text-primary">{tier.price}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{tier.desc}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Custom Gym Logo Upload */}
                  <div className="space-y-3 p-4 rounded-xl border border-border/80 bg-card/60">
                    <div>
                      <Label className="text-sm font-semibold">Upload Your Gym Logo</Label>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Accepts PNG, JPG, or WebP (max 5MB). Displays in your executive dashboard header.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-1">
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-border bg-[#20252b] flex items-center justify-center shrink-0 shadow-inner">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo Preview"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Image
                            src="/assets/vyayam-ai-logo.png"
                            alt="Default Logo"
                            width={44}
                            height={44}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleLogoUpload}
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingLogo}
                          className="font-medium"
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          {isUploadingLogo ? 'Uploading...' : 'Choose Logo Image'}
                        </Button>
                        {logoPreview && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setLogoPreview(null)
                              setValue('logoUrl', '')
                            }}
                            className="ml-2 text-xs text-muted-foreground hover:text-destructive"
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border/40">
                      <Label htmlFor="logoUrl" className="text-xs text-muted-foreground">Or Enter Logo Image URL (Optional)</Label>
                      <div className="relative mt-1">
                        <Input
                          id="logoUrl"
                          placeholder="https://example.com/logo.png"
                          {...register('logoUrl')}
                          onChange={(e) => {
                            register('logoUrl').onChange(e)
                            if (e.target.value) setLogoPreview(e.target.value)
                          }}
                        />
                        <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Confirmation & Summary */}
              {currentStep === 4 && (
                <div className="space-y-5 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-muted/40 border border-border/60 space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-border/40">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl overflow-hidden border border-border bg-[#20252b] flex items-center justify-center shrink-0">
                          {logoPreview ? (
                            <img src={logoPreview} alt="Gym Logo" className="h-full w-full object-contain" />
                          ) : (
                            <div className="h-full w-full bg-primary/15 flex items-center justify-center text-primary font-bold">
                              <Building2 className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-base font-bold text-foreground">{formValues.gymName || 'Gym Name'}</p>
                          <p className="text-xs text-muted-foreground">{formValues.city || 'City'}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase">
                        {formValues.plan} Plan
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Owner</span>
                        <span className="font-semibold text-foreground">{formValues.ownerName}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Official Email</span>
                        <span className="font-semibold text-foreground truncate block">{formValues.email}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Helpline</span>
                        <span className="font-semibold text-foreground">{formValues.phone}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase font-bold">Address</span>
                        <span className="font-semibold text-foreground">{formValues.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-success/10 border border-success/20 flex items-center gap-2.5 text-xs text-success font-medium">
                    <ShieldCheck className="h-4 w-4 shrink-0" />
                    <span>Your full platform access starts immediately upon completion.</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border/40 flex items-center justify-between">
                {currentStep > 1 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="font-semibold"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1.5" />
                    Previous
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < steps.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-md shadow-primary/20"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground font-bold hover:bg-primary/90 shadow-lg shadow-primary/25 px-8"
                    isLoading={isLoading}
                  >
                    Complete Setup & Launch Dashboard
                    <Sparkles className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer Note */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-muted-foreground pt-8">
        Need assistance with setup? Contact our team at <a href="mailto:support@vyayam.ai" className="text-primary hover:underline">support@vyayam.ai</a>
      </footer>
    </div>
  )
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      }
    >
      <OnboardingForm />
    </Suspense>
  )
}
