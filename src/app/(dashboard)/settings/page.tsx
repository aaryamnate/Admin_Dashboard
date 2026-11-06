'use client'

import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { useForm } from 'react-hook-form'
import { useSettings, useUpdateSettings } from '@/hooks/use-settings'
import { Settings, Save, Upload, Building2, Globe, Mail, Phone, MapPin, Image as ImageIcon } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

interface SettingsFormInput {
  gymName: string
  gymPhone: string
  gymEmail: string
  gymAddress: string
  city: string
  state: string
  pincode: string
  branchesCount: string
  website: string
  logoUrl: string
  notificationAlerts: boolean
  billingCurrency: string
}

export default function SettingsPage() {
  const { toast } = useToast()
  
  // Queries & Mutations
  const { data: settings, isLoading } = useSettings()
  const updateSettingsMutation = useUpdateSettings()

  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { isDirty },
  } = useForm<SettingsFormInput>()

  const currentLogoUrl = watch('logoUrl')

  // Sync data when loaded
  useEffect(() => {
    if (settings) {
      reset({
        gymName: settings.gymName || '',
        gymPhone: settings.gymPhone || '',
        gymEmail: settings.gymEmail || '',
        gymAddress: settings.gymAddress || '',
        city: settings.city || '',
        state: settings.state || '',
        pincode: settings.pincode || '',
        branchesCount: settings.branchesCount || '1',
        website: settings.website || '',
        logoUrl: settings.logoUrl || '',
        notificationAlerts: settings.notificationAlerts === 'true',
        billingCurrency: settings.billingCurrency || 'INR',
      })
      if (settings.logoUrl) {
        setLogoPreview(settings.logoUrl)
      }
    }
  }, [settings, reset])

  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Show instant local preview
    const localUrl = URL.createObjectURL(file)
    setLogoPreview(localUrl)

    // Upload to server
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
        setValue('logoUrl', json.data.url, { shouldDirty: true })
        setLogoPreview(json.data.url)
        toast({
          title: 'Logo Uploaded',
          description: 'Custom gym logo uploaded successfully. Save changes to apply.',
          variant: 'success',
        })
      } else {
        throw new Error(json.message || 'Upload failed')
      }
    } catch (err: any) {
      toast({
        title: 'Upload Failed',
        description: err.message || 'Failed to upload gym logo',
        variant: 'error',
      })
      setLogoPreview(settings?.logoUrl || null)
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const onSubmit = (data: SettingsFormInput) => {
    const payload = {
      ...data,
      notificationAlerts: data.notificationAlerts ? 'true' : 'false',
    }

    updateSettingsMutation.mutate(payload, {
      onSuccess: () => {
        toast({ title: 'Success', description: 'Gym settings updated successfully', variant: 'success' })
      },
      onError: (err: any) => {
        toast({ title: 'Error', description: err.message || 'Failed to save settings', variant: 'error' })
      },
    })
  }

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader title="Settings" description="Configure gym information, notification preferences, and system parameters" />

      {isLoading ? (
        <Card className="glass-card">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
          {/* Gym Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Gym Information</CardTitle>
              <CardDescription>Public details and business profile configured for your gym</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Gym Logo Upload Section */}
              <div className="space-y-2 p-4 rounded-xl border border-border/70 bg-card/40">
                <Label className="text-sm font-semibold">Upload Your Gym Logo</Label>
                <p className="text-xs text-muted-foreground">
                  Accepts PNG, JPG, or WebP (max 5MB). Displays in your executive dashboard header.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-border bg-[#20252b] flex items-center justify-center shrink-0 shadow-inner">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Gym Logo Preview"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <Image
                        src="/assets/vyayam-ai-logo.png"
                        alt="Fallback Logo"
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoFileChange}
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
                    {logoPreview && logoPreview !== '/assets/vyayam-ai-logo.png' && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setLogoPreview(null)
                          setValue('logoUrl', '', { shouldDirty: true })
                        }}
                        className="ml-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        Reset to Default
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Gym Brand Name & Contact Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="set-name">Gym Brand Name *</Label>
                  <Input id="set-name" {...register('gymName', { required: true })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="set-phone">Contact Number *</Label>
                  <Input id="set-phone" {...register('gymPhone', { required: true })} />
                </div>
              </div>

              {/* Gym Email & Gym Website */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="set-email">Gym Email</Label>
                  <Input id="set-email" type="email" placeholder="contact@yourgym.com" {...register('gymEmail')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="set-website">Gym Website</Label>
                  <Input id="set-website" placeholder="https://yourgym.com" {...register('website')} />
                </div>
              </div>

              {/* Physical Address */}
              <div className="space-y-2">
                <Label htmlFor="set-address">Physical Address *</Label>
                <Textarea id="set-address" {...register('gymAddress', { required: true })} className="h-20" />
              </div>

              {/* City, State, PIN Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="set-city">City</Label>
                  <Input id="set-city" placeholder="e.g. Pune" {...register('city')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="set-state">State</Label>
                  <Input id="set-state" placeholder="e.g. Maharashtra" {...register('state')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="set-pincode">PIN Code</Label>
                  <Input id="set-pincode" placeholder="e.g. 410503" {...register('pincode')} />
                </div>
              </div>

              {/* Number of Gym Branches */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="set-branches">Number of Gym Branches</Label>
                  <Input id="set-branches" type="number" min="1" placeholder="1" {...register('branchesCount')} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base font-semibold">System Preferences</CardTitle>
              <CardDescription>Global defaults and toggles</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="set-currency">Billing Currency</Label>
                  <select
                    id="set-currency"
                    {...register('billingCurrency')}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none"
                  >
                    <option value="INR">Indian Rupee (INR - ₹)</option>
                    <option value="USD">US Dollar (USD - $)</option>
                    <option value="EUR">Euro (EUR - €)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-card/40">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-semibold">Enable Automated Reminders</h4>
                  <p className="text-xs text-muted-foreground">Automatically trigger checkup cron jobs and send membership warnings.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    {...register('notificationAlerts')}
                  />
                  <div className="w-9 h-5 bg-muted rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              type="submit"
              disabled={!isDirty || updateSettingsMutation.isPending || isUploadingLogo}
              isLoading={updateSettingsMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" /> Save Changes
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
