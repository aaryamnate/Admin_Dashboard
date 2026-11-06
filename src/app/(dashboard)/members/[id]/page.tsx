'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { useMember } from '@/hooks/use-members'
import { useCreateHealthMetric } from '@/hooks/use-health-metrics'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/toast'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createHealthMetricSchema, type CreateHealthMetricInput } from '@/lib/validators/health-metric'
import {
  ArrowLeft,
  Calendar,
  Phone,
  Mail,
  User,
  Scale,
  Activity,
  Dumbbell,
  Clock,
  Heart,
  Plus,
  Apple,
  CreditCard,
} from 'lucide-react'
import { formatDate, calculateBMI, getBMICategory } from '@/lib/utils'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const statusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE': return <Badge variant="success">Active</Badge>
    case 'EXPIRED': return <Badge variant="destructive">Expired</Badge>
    case 'FROZEN': return <Badge variant="warning">Frozen</Badge>
    default: return <Badge variant="outline">{status}</Badge>
  }
}

export default function MemberDetailsPage() {
  const router = useRouter()
  const { id } = useParams() as { id: string }
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [isAddMetricOpen, setIsAddMetricOpen] = useState(false)

  // Fetch Member
  const { data: memberRes, isLoading, refetch } = useMember(id)
  const member = memberRes?.data as any

  // Metric Log Mutation
  const createMetricMutation = useCreateHealthMetric()

  // Form for new metric
  const metricForm = useForm<CreateHealthMetricInput>({
    resolver: zodResolver(createHealthMetricSchema),
    defaultValues: {
      clientId: id,
      weightKg: undefined,
      bmi: undefined,
      notes: '',
    },
  })

  // Handle new metric submission
  const onSubmitMetric = (data: CreateHealthMetricInput) => {
    // Auto-calculate BMI if height is available
    const height = member?.heightCm
    let calculatedBmi = data.bmi
    if (!calculatedBmi && height && data.weightKg) {
      calculatedBmi = calculateBMI(data.weightKg, height)
    }

    createMetricMutation.mutate(
      {
        ...data,
        bmi: calculatedBmi,
      },
      {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Health metric logged successfully', variant: 'success' })
          setIsAddMetricOpen(false)
          metricForm.reset({ clientId: id })
          refetch()
        },
        onError: (err: any) => {
          toast({ title: 'Error', description: err.message || 'Failed to save health metric', variant: 'error' })
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Skeleton className="h-10 w-[200px]" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] lg:col-span-2 w-full" />
        </div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <h3 className="text-xl font-bold">Member not found</h3>
        <Button onClick={() => router.push('/members')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Members
        </Button>
      </div>
    )
  }

  // Calculate age
  const getAge = (dobString?: string | null) => {
    if (!dobString) return 'N/A'
    const birthDate = new Date(dobString)
    const difference = Date.now() - birthDate.getTime()
    return Math.floor(difference / (1000 * 60 * 60 * 24 * 365.25))
  }

  const activeMembership = member.memberships?.[0]
  const activeAllocation = member.clientAllocations?.[0]

  // Recharts Weight History data
  const chartData = member.healthMetrics
    ? [...member.healthMetrics]
        .reverse()
        .map((h: any) => ({
          date: formatDate(h.recordedAt).split(',')[0],
          Weight: h.weightKg,
          BMI: h.bmi || 0,
        }))
    : []

  const latestMetric = member.healthMetrics?.[0]

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push('/members')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <PageHeader title={member.name} description="Member profile dashboard" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Profile Card */}
        <Card className="glass-card">
          <CardContent className="p-6 flex flex-col items-center space-y-6">
            <Avatar fallback={member.name} size="lg" src={member.avatarUrl} className="h-20 w-20 ring-4 ring-primary/20" />
            <div className="text-center">
              <h2 className="text-xl font-bold">{member.name}</h2>
              <p className="text-sm text-muted-foreground">{member.email}</p>
              <div className="mt-2 flex gap-1 justify-center">
                <Badge variant={member.status === 'ACTIVE' ? 'success' : member.status === 'INACTIVE' ? 'secondary' : 'destructive'}>
                  {member.status}
                </Badge>
              </div>
            </div>

            <div className="w-full border-t border-border pt-6 space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{member.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Age {getAge(member.dateOfBirth)} ({member.gender || 'N/A'})</span>
              </div>
              <div className="flex items-center gap-3">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <span>
                  {member.heightCm ? `${member.heightCm} cm` : 'N/A'} / {member.weightKg ? `${member.weightKg} kg` : 'N/A'}
                </span>
              </div>
              {activeMembership && (
                <div className="flex items-center gap-3">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span>Plan: <strong className="text-primary">{activeMembership.planName}</strong></span>
                </div>
              )}
              {activeAllocation && (
                <div className="flex items-center gap-3">
                  <Dumbbell className="h-4 w-4 text-muted-foreground" />
                  <span>Trainer: <strong>{activeAllocation.trainer.name}</strong></span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Detail Tabs */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Health Metrics</TabsTrigger>
              <TabsTrigger value="nutrition">Nutrition Logs</TabsTrigger>
              <TabsTrigger value="memberships">Membership History</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card className="glass-card">
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Current Weight</CardTitle>
                    <Scale className="h-4 w-4 text-primary" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{latestMetric?.weightKg || member.weightKg || 'N/A'} <span className="text-xs font-normal">kg</span></p>
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Current BMI</CardTitle>
                    <Activity className="h-4 w-4 text-emerald-400" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{latestMetric?.bmi || 'N/A'}</p>
                    {latestMetric?.bmi && (
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Category: {getBMICategory(latestMetric.bmi)}
                      </span>
                    )}
                  </CardContent>
                </Card>
                <Card className="glass-card">
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <CardTitle className="text-xs font-medium text-muted-foreground">Body Fat %</CardTitle>
                    <Heart className="h-4 w-4 text-rose-400" />
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <p className="text-2xl font-bold">{latestMetric?.bodyFatPercent ? `${latestMetric.bodyFatPercent}%` : 'N/A'}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Weight & BMI Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] w-full">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                          <XAxis dataKey="date" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ background: 'rgba(17, 24, 39, 0.95)', border: '1px solid var(--color-border)', borderRadius: '8px' }} />
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
                          <Line type="monotone" dataKey="Weight" stroke="var(--color-primary)" strokeWidth={2.5} activeDot={{ r: 6 }} />
                          <Line type="monotone" dataKey="BMI" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No health metrics recorded yet</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Metrics Tab */}
            <TabsContent value="metrics" className="mt-6 space-y-6">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-4">
                  <div>
                    <CardTitle className="text-sm font-semibold">Weight & BMI History</CardTitle>
                    <CardDescription>Track fitness progress markers over time</CardDescription>
                  </div>
                  <Button size="sm" onClick={() => setIsAddMetricOpen(true)}>
                    <Plus className="mr-1 h-4 w-4" /> Add Entry
                  </Button>
                </CardHeader>
                <CardContent className="p-0">
                  {member.healthMetrics?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Weight</TableHead>
                          <TableHead>BMI</TableHead>
                          <TableHead>Body Fat</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {member.healthMetrics.map((h: any) => (
                          <TableRow key={h.id}>
                            <TableCell className="text-sm font-medium">{formatDate(h.recordedAt).split(',')[0]}</TableCell>
                            <TableCell className="text-sm">{h.weightKg} kg</TableCell>
                            <TableCell className="text-sm">{h.bmi || 'N/A'}</TableCell>
                            <TableCell className="text-sm">{h.bodyFatPercent ? `${h.bodyFatPercent}%` : 'N/A'}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{h.notes || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">No records logged</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Nutrition logs tab */}
            <TabsContent value="nutrition" className="mt-6 space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Daily Meal Logs</CardTitle>
                  <CardDescription>Calorie and macronutrient logging logs</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {member.nutritionLogs?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Meal Type</TableHead>
                          <TableHead>Food</TableHead>
                          <TableHead>Calories</TableHead>
                          <TableHead>Protein</TableHead>
                          <TableHead>Macros (C/F)</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {member.nutritionLogs.map((n: any) => (
                          <TableRow key={n.id}>
                            <TableCell className="text-sm font-medium">{formatDate(n.loggedAt).split(',')[0]}</TableCell>
                            <TableCell className="text-sm capitalize"><Badge variant="outline">{n.mealType.toLowerCase()}</Badge></TableCell>
                            <TableCell className="text-sm font-medium">{n.detectedFood || 'Logged Meal'}</TableCell>
                            <TableCell className="text-sm text-amber-400 font-semibold">{n.calories} kcal</TableCell>
                            <TableCell className="text-sm text-emerald-400 font-semibold">{n.protein}g</TableCell>
                            <TableCell className="text-xs text-muted-foreground">{n.carbs}g / {n.fats}g</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">No nutrition logs submitted by client</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Membership history tab */}
            <TabsContent value="memberships" className="mt-6 space-y-6">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">Membership Plans History</CardTitle>
                  <CardDescription>Log of past and present gym contracts</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {member.memberships?.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Plan</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Start Date</TableHead>
                          <TableHead>End Date</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {member.memberships.map((m: any) => (
                          <TableRow key={m.id}>
                            <TableCell className="text-sm font-medium">{m.planName}</TableCell>
                            <TableCell className="text-sm">₹{m.amount.toLocaleString('en-IN')}</TableCell>
                            <TableCell className="text-sm">{formatDate(m.startDate).split(',')[0]}</TableCell>
                            <TableCell className="text-sm">{formatDate(m.endDate).split(',')[0]}</TableCell>
                            <TableCell className="text-xs">{statusBadge(m.status)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">No membership record found</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Metric Dialog */}
      <Dialog open={isAddMetricOpen} onOpenChange={setIsAddMetricOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Log Health Metric</DialogTitle>
            <DialogDescription>Record weight, BMI, and notes for the member</DialogDescription>
          </DialogHeader>
          <form onSubmit={metricForm.handleSubmit(onSubmitMetric)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metric-weight">Weight (kg) <span className="text-destructive">*</span></Label>
              <Input
                id="metric-weight"
                type="number"
                step="0.1"
                error={metricForm.formState.errors.weightKg?.message}
                {...metricForm.register('weightKg', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metric-bmi">BMI (Optional - will auto-calculate if height is registered)</Label>
              <Input
                id="metric-bmi"
                type="number"
                step="0.1"
                error={metricForm.formState.errors.bmi?.message}
                {...metricForm.register('bmi', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="metric-notes">Notes</Label>
              <Textarea id="metric-notes" placeholder="e.g. Body fat measured at 18%" {...metricForm.register('notes')} />
            </div>

            <DialogFooter>
              <DialogClose>
                <Button variant="outline" type="button" disabled={createMetricMutation.isPending}>Cancel</Button>
              </DialogClose>
              <Button type="submit" isLoading={createMetricMutation.isPending}>Save Record</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
