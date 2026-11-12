'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import {
  Users,
  CreditCard,
  Dumbbell,
  TrendingUp,
  Activity,
  Sparkles,
  Zap,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Bell,
  RefreshCw,
  FileSpreadsheet,
  Download,
  Clock,
  ShieldCheck,
  Crown,
  ChevronRight,
  Flame,
  ArrowUpRight,
  IndianRupee,
  Layers,
  Send,
  UserCheck,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function OwnerHubPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState<
    'overview' | 'financials' | 'clients' | 'trainers' | 'reports' | 'notifications' | 'ai-insights'
  >('overview')

  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // Fetch Owner Overview Data
  const fetchOverview = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/owner/overview')
      const json = await res.json()
      if (res.ok && json.data) {
        setData(json.data)
      } else {
        throw new Error(json.error || 'Failed to load owner analytics')
      }
    } catch (err: any) {
      toast({
        title: 'Error loading dashboard',
        description: err.message || 'Please refresh the page',
        variant: 'error',
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOverview()
  }, [])

  // Execute Automated Actions
  const handleAutomate = async (action: string, successMessage: string) => {
    try {
      setActionLoading(action)
      const res = await fetch('/api/owner/automate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })
      const result = await res.json()
      if (res.ok) {
        toast({
          title: 'Automation Executed',
          description: result.data?.message || successMessage,
          variant: 'success',
        })
        fetchOverview()
      } else {
        throw new Error(result.error || 'Failed to trigger automation')
      }
    } catch (err: any) {
      toast({
        title: 'Action Failed',
        description: err.message,
        variant: 'error',
      })
    } finally {
      setActionLoading(null)
    }
  }

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899']

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner: Gym Owner Executive Command Bar */}
      <div className="relative rounded-2xl overflow-hidden p-6 md:p-8 bg-gradient-to-r from-primary/15 via-accent/10 to-card border border-border/40 backdrop-blur-md shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Crown className="h-4 w-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Executive Owner Module
              </span>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/30">
                Automated Operations Live
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
              Gym Owner Command Center
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground max-w-2xl">
              Centralized oversight of revenue, automated member reminders, trainer workloads, operational attendance, and AI-powered business growth.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={() => handleAutomate('send_renewal_reminders', 'Renewal reminders dispatched')}
              disabled={actionLoading !== null}
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md text-xs h-10 px-4"
            >
              <Zap className="mr-1.5 h-3.5 w-3.5" />
              {actionLoading === 'send_renewal_reminders' ? 'Sending...' : 'Auto-Send Renewal Alerts'}
            </Button>
            <Button
              variant="outline"
              onClick={fetchOverview}
              disabled={isLoading}
              className="border-border/60 text-xs h-10 px-3"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto gap-2 pt-6 border-t border-border/30 mt-6 scrollbar-none">
          {[
            { id: 'overview', label: 'Performance Dashboard', icon: Activity },
            { id: 'financials', label: 'Revenue & Financials', icon: IndianRupee },
            { id: 'clients', label: 'Client Management', icon: Users },
            { id: 'trainers', label: 'Trainer Workload', icon: Dumbbell },
            { id: 'reports', label: 'Automated Reports', icon: FileSpreadsheet },
            { id: 'notifications', label: 'Automated Alerts', icon: Bell },
            { id: 'ai-insights', label: 'AI Growth Insights', icon: Sparkles },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-card/50 text-muted-foreground hover:text-foreground hover:bg-accent/40 border border-border/30'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : (
        <>
          {/* ======================================================== */}
          {/* TAB 1: OVERVIEW & REAL-TIME PERFORMANCE DASHBOARD */}
          {/* ======================================================== */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Executive Metrics Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card border-border/40 hover:border-primary/40 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Total Clients
                      </p>
                      <h3 className="text-2xl font-extrabold text-foreground mt-1">
                        {data?.summary?.totalMembers || 0}
                      </h3>
                      <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        <span>{data?.summary?.activeMemberships || 0} active subscriptions</span>
                      </p>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                      <Users className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/40 hover:border-emerald-500/40 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Today's Check-Ins
                      </p>
                      <h3 className="text-2xl font-extrabold text-foreground mt-1">
                        {data?.summary?.todayAttendances || 0}
                      </h3>
                      <p className="text-[11px] text-primary font-medium mt-1 flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        <span>{data?.summary?.capacityUtilizationPercent || 0}% floor capacity</span>
                      </p>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <Clock className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/40 hover:border-amber-500/40 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Retention Rate
                      </p>
                      <h3 className="text-2xl font-extrabold text-foreground mt-1">
                        {data?.summary?.retentionRate || 92.5}%
                      </h3>
                      <p className="text-[11px] text-amber-400 font-medium mt-1 flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Low churn probability</span>
                      </p>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card border-border/40 hover:border-cyan-500/40 transition-all">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        Monthly Revenue
                      </p>
                      <h3 className="text-2xl font-extrabold text-foreground mt-1">
                        ₹{Number(data?.financials?.monthlyRevenue || 0).toLocaleString('en-IN')}
                      </h3>
                      <p className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" />
                        <span>Net Profit: ₹{Number(data?.financials?.netOperatingProfit || 0).toLocaleString('en-IN')}</span>
                      </p>
                    </div>
                    <div className="h-11 w-11 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <IndianRupee className="h-5 w-5" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Interactive Dashboard Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* AI Operational Insights Widget */}
                <Card className="glass-card border-border/40 lg:col-span-2 p-6 flex flex-col justify-between">
                  <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                        AI-Powered Action Engine
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                      Real-Time Heuristics
                    </Badge>
                  </div>

                  <div className="space-y-3.5">
                    {data?.aiInsights?.map((insight: any) => (
                      <div
                        key={insight.id}
                        className="p-4 rounded-xl border border-border/40 bg-card/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 hover:bg-card/70 transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-2 w-2 rounded-full ${
                                insight.type === 'warning'
                                  ? 'bg-amber-400'
                                  : insight.type === 'success'
                                  ? 'bg-emerald-400'
                                  : 'bg-primary'
                              }`}
                            />
                            <h4 className="text-xs font-bold text-foreground">{insight.title}</h4>
                            <Badge
                              variant="outline"
                              className={`text-[9px] py-0 px-1.5 ${
                                insight.impact === 'High'
                                  ? 'text-rose-400 border-rose-500/30'
                                  : 'text-amber-400 border-amber-500/30'
                              }`}
                            >
                              {insight.impact} Priority
                            </Badge>
                          </div>
                          <p className="text-[11px] text-muted-foreground leading-relaxed pl-4">
                            {insight.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (insight.actionType === 'send_renewal_reminders') {
                              handleAutomate('send_renewal_reminders', 'Renewal reminders sent!')
                            } else if (insight.actionType === 'send_reengagement') {
                              handleAutomate('reengage_inactive', 'Re-engagement notifications dispatched!')
                            } else if (insight.actionType === 'open_allocations') {
                              router.push('/allocations')
                            } else {
                              router.push('/memberships')
                            }
                          }}
                          className="shrink-0 text-xs border-primary/30 text-primary hover:bg-primary/10"
                        >
                          {insight.actionLabel}
                          <ChevronRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Quick Owner Automation Toolbox */}
                <Card className="glass-card border-border/40 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                      <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                        Owner Operations Toolbox
                      </CardTitle>
                      <Zap className="h-4 w-4 text-amber-400" />
                    </div>
                    <p className="text-xs text-muted-foreground mb-4">
                      One-click automated tasks to eliminate manual gym administrative overhead:
                    </p>

                    <div className="space-y-2.5">
                      <Button
                        onClick={() => handleAutomate('send_renewal_reminders', 'Dispatched renewal reminders')}
                        disabled={actionLoading !== null}
                        className="w-full justify-between text-xs h-11 bg-primary/15 hover:bg-primary/25 text-primary border border-primary/30"
                      >
                        <span className="flex items-center gap-2">
                          <Bell className="h-3.5 w-3.5" />
                          <span>Batch Renewal Reminders</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        onClick={() => handleAutomate('reconcile_expired', 'Reconciled overdue accounts')}
                        disabled={actionLoading !== null}
                        variant="outline"
                        className="w-full justify-between text-xs h-11 border-border/40 hover:bg-accent/40"
                      >
                        <span className="flex items-center gap-2">
                          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
                          <span>Reconcile Expired Contracts</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        onClick={() => handleAutomate('reengage_inactive', 'Dispatched motivation push notifications')}
                        disabled={actionLoading !== null}
                        variant="outline"
                        className="w-full justify-between text-xs h-11 border-border/40 hover:bg-accent/40"
                      >
                        <span className="flex items-center gap-2">
                          <Flame className="h-3.5 w-3.5 text-rose-400" />
                          <span>Re-engage Inactive Members</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>

                      <Button
                        onClick={() => router.push('/reports')}
                        variant="outline"
                        className="w-full justify-between text-xs h-11 border-border/40 hover:bg-accent/40"
                      >
                        <span className="flex items-center gap-2">
                          <Download className="h-3.5 w-3.5 text-emerald-400" />
                          <span>Download Performance Audit</span>
                        </span>
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Active Trainers on Duty:</span>
                    <span className="font-bold text-foreground">{data?.summary?.totalTrainers || 0} coaches</span>
                  </div>
                </Card>
              </div>

              {/* Expiring Memberships in next 7 days */}
              <Card className="glass-card border-border/40 p-6">
                <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-4">
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Upcoming Subscription Expirations (Next 7 Days)
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      {data?.expiringMemberships?.length || 0} members due for subscription renewal
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => router.push('/memberships')}
                    variant="outline"
                    className="text-xs border-primary/30 text-primary"
                  >
                    Manage All Memberships
                  </Button>
                </div>

                {data?.expiringMemberships?.length === 0 ? (
                  <div className="p-8 text-center text-xs text-muted-foreground">
                    No memberships expiring within the next 7 days.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[10px] uppercase font-bold text-muted-foreground border-b border-border/40">
                        <tr>
                          <th className="py-2.5">Member</th>
                          <th className="py-2.5">Plan</th>
                          <th className="py-2.5">Renewal Fee</th>
                          <th className="py-2.5">Expiry Date</th>
                          <th className="py-2.5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {data?.expiringMemberships?.map((item: any) => (
                          <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3">
                              <p className="font-bold text-foreground">{item.clientName}</p>
                              <p className="text-[10px] text-muted-foreground">{item.clientEmail}</p>
                            </td>
                            <td className="py-3 font-medium text-foreground">{item.planName}</td>
                            <td className="py-3 font-mono font-semibold text-emerald-400">
                              ₹{Number(item.amount).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 text-amber-400 font-medium">
                              {new Date(item.endDate).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                              })}
                            </td>
                            <td className="py-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push('/memberships')}
                                className="text-[10px] h-7 px-2.5 border-border/60"
                              >
                                Renew Plan
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: REVENUE & FINANCIAL ANALYTICS */}
          {/* ======================================================== */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              {/* Financial Metrics Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="glass-card border-border/40 p-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Cumulative Revenue
                  </p>
                  <h3 className="text-2xl font-extrabold text-foreground mt-2 font-mono">
                    ₹{Number(data?.financials?.totalRevenue || 0).toLocaleString('en-IN')}
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-1">All-time membership billings</p>
                </Card>

                <Card className="glass-card border-border/40 p-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    30-Day Collections
                  </p>
                  <h3 className="text-2xl font-extrabold text-emerald-400 mt-2 font-mono">
                    ₹{Number(data?.financials?.monthlyRevenue || 0).toLocaleString('en-IN')}
                  </h3>
                  <p className="text-[11px] text-emerald-400/80 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>Active cash inflow</span>
                  </p>
                </Card>

                <Card className="glass-card border-border/40 p-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Pending Renewal Fees (7d)
                  </p>
                  <h3 className="text-2xl font-extrabold text-amber-400 mt-2 font-mono">
                    ₹{Number(data?.financials?.pendingRenewalRevenue || 0).toLocaleString('en-IN')}
                  </h3>
                  <p className="text-[11px] text-amber-400/80 mt-1">Upcoming renewal receivables</p>
                </Card>

                <Card className="glass-card border-border/40 p-5">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Est. Net Operating Margin
                  </p>
                  <h3 className="text-2xl font-extrabold text-primary mt-2 font-mono">
                    ₹{Number(data?.financials?.netOperatingProfit || 0).toLocaleString('en-IN')}
                  </h3>
                  <p className="text-[11px] text-primary/80 mt-1">~65% estimated net margin</p>
                </Card>
              </div>

              {/* Chart: Plan-Wise Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="glass-card border-border/40 p-6">
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
                    Revenue Breakdown by Plan Type
                  </CardTitle>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.financials?.planStats || []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.2} />
                        <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                        <Tooltip
                          contentStyle={{ background: 'var(--color-card)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '11px' }}
                          formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
                        />
                        <Bar dataKey="revenue" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={45} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="glass-card border-border/40 p-6 flex flex-col justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground mb-4">
                      Plan Distribution Breakdown
                    </CardTitle>
                    <div className="space-y-4">
                      {data?.financials?.planStats?.map((plan: any, idx: number) => (
                        <div key={plan.name} className="flex items-center justify-between border-b border-border/30 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                            <span className="text-xs font-semibold text-foreground">{plan.name} Plan</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold font-mono text-foreground">
                              ₹{Number(plan.revenue).toLocaleString('en-IN')}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{plan.count} subscribers</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={() => router.push('/reports')}
                    className="w-full text-xs h-10 mt-6"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Financial Audit (Excel)
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CLIENT MANAGEMENT & INACTIVITY TRACKER */}
          {/* ======================================================== */}
          {activeTab === 'clients' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Client Retention & Churn Control</h3>
                  <p className="text-xs text-muted-foreground">
                    Spot inactive members before they cancel and manage client subscriptions.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleAutomate('reengage_inactive', 'Re-engagement message sent to inactive clients')}
                    disabled={actionLoading !== null}
                    className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                  >
                    <Flame className="mr-1.5 h-3.5 w-3.5" />
                    Re-engage Inactive Members
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push('/members')}
                    className="text-xs border-border/60"
                  >
                    Open Member Directory
                  </Button>
                </div>
              </div>

              {/* Inactive Client Watchlist */}
              <Card className="glass-card border-border/40 p-6">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-foreground mb-1">
                  At-Risk Inactive Clients (No Check-Ins for 14+ Days)
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground mb-4">
                  Members with active subscriptions who have stopped attending sessions
                </CardDescription>

                {data?.inactiveClients?.length === 0 ? (
                  <div className="p-8 text-center text-xs text-emerald-400 font-medium">
                    🎉 Excellent! All active members have attended workouts within the last 14 days.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="text-[10px] uppercase font-bold text-muted-foreground border-b border-border/40">
                        <tr>
                          <th className="py-2.5">Member Profile</th>
                          <th className="py-2.5">Active Plan</th>
                          <th className="py-2.5">Days Inactive</th>
                          <th className="py-2.5">Last Attendance</th>
                          <th className="py-2.5 text-right">Retention Outreach</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {data?.inactiveClients?.map((client: any) => (
                          <tr key={client.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-2.5">
                                <Avatar fallback={client.name} size="sm" src={client.avatarUrl} />
                                <div>
                                  <p className="font-bold text-foreground">{client.name}</p>
                                  <p className="text-[10px] text-muted-foreground">{client.phone || client.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 font-medium text-foreground">{client.planName}</td>
                            <td className="py-3">
                              <Badge variant="destructive" className="text-[10px] font-mono">
                                {client.daysInactive} days away
                              </Badge>
                            </td>
                            <td className="py-3 text-muted-foreground">
                              {client.lastCheckIn ? formatDate(client.lastCheckIn).split(',')[0] : 'Never Recorded'}
                            </td>
                            <td className="py-3 text-right">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push('/notifications')}
                                className="text-[10px] h-7 px-2.5 border-primary/30 text-primary"
                              >
                                Send Motivation Note
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: TRAINER MANAGEMENT & WORKLOAD */}
          {/* ======================================================== */}
          {activeTab === 'trainers' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Trainer Capacity & Workload Analytics</h3>
                  <p className="text-xs text-muted-foreground">
                    Monitor instructor allocation load, avoid trainer burnout, and rebalance client rosters.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => router.push('/allocations')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                >
                  <Dumbbell className="mr-1.5 h-3.5 w-3.5" />
                  Visual Allocation Network
                </Button>
              </div>

              {/* Trainer Workload Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data?.trainers?.map((trainer: any) => (
                  <Card key={trainer.id} className="glass-card border-border/40 p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar fallback={trainer.name} size="md" src={trainer.avatarUrl} />
                          <div>
                            <h4 className="text-sm font-bold text-foreground">{trainer.name}</h4>
                            <p className="text-[10px] text-muted-foreground">{trainer.specialization}</p>
                          </div>
                        </div>
                        <Badge
                          variant={
                            trainer.status === 'Overloaded'
                              ? 'destructive'
                              : trainer.status === 'High'
                              ? 'warning'
                              : 'success'
                          }
                          className="text-[10px]"
                        >
                          {trainer.status}
                        </Badge>
                      </div>

                      <div className="space-y-2 mt-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Client Workload:</span>
                          <span className="font-bold text-foreground">
                            {trainer.activeClients} / {trainer.maxCapacity} clients
                          </span>
                        </div>
                        <div className="w-full bg-muted/60 h-2.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              trainer.workloadPercent >= 90
                                ? 'bg-rose-500'
                                : trainer.workloadPercent >= 70
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                            style={{ width: `${trainer.workloadPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-border/40 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{trainer.experience} Yrs Experience</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => router.push('/allocations')}
                        className="text-xs text-primary hover:underline h-7 p-0 cursor-pointer"
                      >
                        Adjust Allocations →
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 5: AUTOMATED REPORTS ENGINE */}
          {/* ======================================================== */}
          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-foreground">Automated Operational Reports</h3>
                  <p className="text-xs text-muted-foreground">
                    Instant Excel & CSV reports for memberships, footfall, financial statements, and staff audits.
                  </p>
                </div>
                <Button
                  onClick={() => router.push('/reports')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                >
                  <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
                  Full Reports Center
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Gym Performance Audit',
                    type: 'performance',
                    desc: 'Operational summary of retention rates, active contracts, and coach workloads.',
                    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                  },
                  {
                    title: 'Daily Attendance & Entry Log',
                    type: 'attendance',
                    desc: 'Full check-in history, QR scanner entries, and peak gym rush hour metrics.',
                    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
                  },
                  {
                    title: 'Revenue & Financial Statement',
                    type: 'revenue',
                    desc: 'Payment logs, subscription plans revenue breakdown, and receivable balances.',
                    color: 'text-primary bg-primary/10 border-primary/20',
                  },
                ].map((rep) => (
                  <Card key={rep.type} className="glass-card border-border/40 p-5 flex flex-col justify-between">
                    <div>
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${rep.color} mb-3`}>
                        <FileSpreadsheet className="h-5 w-5" />
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{rep.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{rep.desc}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-5">
                      <Button
                        size="sm"
                        onClick={() => {
                          toast({ title: 'Exporting Excel', description: 'Generating report...', variant: 'info' })
                          window.location.href = `/api/reports?type=${rep.type}&format=excel`
                        }}
                        className="text-xs h-9"
                      >
                        <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
                        Excel
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          toast({ title: 'Exporting CSV', description: 'Generating CSV file...', variant: 'info' })
                          window.location.href = `/api/reports?type=${rep.type}&format=csv`
                        }}
                        className="text-xs h-9 border-border/60"
                      >
                        <Download className="mr-1.5 h-3.5 w-3.5" />
                        CSV
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: AUTOMATED NOTIFICATIONS & REMINDERS */}
          {/* ======================================================== */}
          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Automated Notification Center</h3>
                  <p className="text-xs text-muted-foreground">
                    Automate repetitive messaging: payment alerts, expiring memberships, and gym notices.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => router.push('/notifications')}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
                >
                  <Send className="mr-1.5 h-3.5 w-3.5" />
                  Custom Broadcast Page
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="glass-card border-border/40 p-6 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2">
                      <Bell className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">Automatic 7-Day Renewal Reminders</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Scans the database for members whose contracts expire in the next 7 days and dispatches customized renewal alerts directly to their user portal accounts.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAutomate('send_renewal_reminders', 'Dispatched renewal reminders')}
                    disabled={actionLoading !== null}
                    className="w-full text-xs h-10 mt-6 bg-primary hover:bg-primary/90"
                  >
                    <Zap className="mr-2 h-4 w-4" />
                    {actionLoading === 'send_renewal_reminders' ? 'Processing...' : 'Run Automated Reminders Dispatch'}
                  </Button>
                </Card>

                <Card className="glass-card border-border/40 p-6 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-2">
                      <Flame className="h-5 w-5" />
                    </div>
                    <h4 className="text-sm font-bold text-foreground">Inactive Member Motivation Push</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Automatically detects members with active memberships who haven't logged a gym check-in over 14 days and sends re-engagement motivation notifications.
                    </p>
                  </div>
                  <Button
                    onClick={() => handleAutomate('reengage_inactive', 'Dispatched motivation push')}
                    disabled={actionLoading !== null}
                    variant="outline"
                    className="w-full text-xs h-10 mt-6 border-border/60 hover:bg-accent/40"
                  >
                    <Flame className="mr-2 h-4 w-4 text-rose-400" />
                    {actionLoading === 'reengage_inactive' ? 'Processing...' : 'Send Re-engagement Motivation'}
                  </Button>
                </Card>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: AI-POWERED BUSINESS GROWTH INSIGHTS */}
          {/* ======================================================== */}
          {activeTab === 'ai-insights' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <span>Vyayam AI Gym Analytics Engine</span>
                    <Sparkles className="h-4 w-4 text-amber-400" />
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Actionable intelligence on member churn, revenue patterns, and operational optimization.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data?.aiInsights?.map((insight: any) => (
                  <Card key={insight.id} className="glass-card border-border/40 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge
                          variant="outline"
                          className={`text-[10px] ${
                            insight.impact === 'High'
                              ? 'text-rose-400 border-rose-500/30 bg-rose-500/10'
                              : 'text-amber-400 border-amber-500/30 bg-amber-500/10'
                          }`}
                        >
                          {insight.impact} Business Impact
                        </Badge>
                        <span className="text-[10px] text-muted-foreground uppercase font-mono">Vyayam Intelligence</span>
                      </div>
                      <h4 className="text-sm font-bold text-foreground">{insight.title}</h4>
                      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{insight.description}</p>
                    </div>

                    <Button
                      onClick={() => {
                        if (insight.actionType === 'send_renewal_reminders') {
                          handleAutomate('send_renewal_reminders', 'Dispatched renewal reminders')
                        } else if (insight.actionType === 'send_reengagement') {
                          handleAutomate('reengage_inactive', 'Sent re-engagement messages')
                        } else if (insight.actionType === 'open_allocations') {
                          router.push('/allocations')
                        } else {
                          router.push('/memberships')
                        }
                      }}
                      className="w-full text-xs h-10 mt-6 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30"
                    >
                      {insight.actionLabel}
                      <ChevronRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
