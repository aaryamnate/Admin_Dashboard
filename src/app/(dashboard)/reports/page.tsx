'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/toast'
import {
  Users,
  CreditCard,
  TrendingUp,
  Download,
  FileSpreadsheet,
  Clock,
  ShieldCheck,
  Zap,
  Sparkles,
} from 'lucide-react'

export default function ReportsPage() {
  const { toast } = useToast()
  
  // Selection states for each report
  const [memberFormat, setMemberFormat] = useState<'csv' | 'excel'>('csv')
  const [membershipFormat, setMembershipFormat] = useState<'csv' | 'excel'>('csv')
  const [revenueFormat, setRevenueFormat] = useState<'csv' | 'excel'>('csv')
  const [attendanceFormat, setAttendanceFormat] = useState<'csv' | 'excel'>('excel')
  const [performanceFormat, setPerformanceFormat] = useState<'csv' | 'excel'>('excel')

  const [isAutomating, setIsAutomating] = useState(false)

  const handleDownload = (type: string, format: string) => {
    toast({
      title: 'Generating Report',
      description: `Preparing ${type} report (${format.toUpperCase()})...`,
      variant: 'info',
    })
    window.location.href = `/api/reports?type=${type}&format=${format}`
  }

  const triggerAutomatedReconciliation = async () => {
    try {
      setIsAutomating(true)
      const res = await fetch('/api/cron')
      const data = await res.json()
      if (res.ok) {
        toast({
          title: 'Automated Audit Completed',
          description: `Reconciled ${data.data?.reconciledExpiredCount || 0} expired memberships & dispatched ${data.data?.reminderNotificationsSent || 0} alerts.`,
          variant: 'success',
        })
      } else {
        throw new Error(data.error || 'Failed to trigger reconciliation')
      }
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to run automation',
        variant: 'error',
      })
    } finally {
      setIsAutomating(false)
    }
  }

  const reports = [
    {
      id: 'performance',
      title: 'Overall Gym Performance Audit',
      description: 'Comprehensive operational report covering active client ratio, retention percentage, trainer client allocation workloads, and capacity benchmarks.',
      icon: ShieldCheck,
      format: performanceFormat,
      setFormat: setPerformanceFormat,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      badge: 'Owner Priority',
    },
    {
      id: 'attendance',
      title: 'Attendance & Check-in Log',
      description: 'Complete member entry and exit time audit, QR scanner logs, daily peak footfall, and attendance history.',
      icon: Clock,
      format: attendanceFormat,
      setFormat: setAttendanceFormat,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      badge: 'Operational',
    },
    {
      id: 'revenue',
      title: 'Revenue & Financial Analytics',
      description: 'Review historical payments and revenue breakdown aggregated by active client memberships, plan types, and transactions.',
      icon: TrendingUp,
      format: revenueFormat,
      setFormat: setRevenueFormat,
      color: 'text-primary bg-primary/10 border-primary/20',
      badge: 'Financial',
    },
    {
      id: 'memberships',
      title: 'Membership & Renewal Report',
      description: 'List active, frozen, or expired contracts along with contract start/end dates, renewal dates, and billing amounts.',
      icon: CreditCard,
      format: membershipFormat,
      setFormat: setMembershipFormat,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
      badge: 'Contracts',
    },
    {
      id: 'members',
      title: 'Member Profile & Health Roster',
      description: 'Export all registered gym members with their registration status, phone numbers, contact info, and profile details.',
      icon: Users,
      format: memberFormat,
      setFormat: setMemberFormat,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
      badge: 'Directory',
    },
  ]

  return (
    <div className="animate-fade-in space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <PageHeader
          title="Automated Gym Reports & Analytics"
          description="Export real-time operational analytics, financial logs, attendance footfall, and performance audits."
        />
        <Button
          onClick={triggerAutomatedReconciliation}
          disabled={isAutomating}
          className="bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 shadow-sm"
        >
          <Zap className="mr-2 h-4 w-4" />
          {isAutomating ? 'Running Audit...' : 'Run Automated Reconciliation'}
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="glass-card flex flex-col justify-between border-border/40 hover:border-border transition-all">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center border ${report.color}`}>
                  <report.icon className="h-6 w-6" />
                </div>
                <Badge variant="outline" className="text-[10px] font-semibold tracking-wider uppercase border-border/50">
                  {report.badge}
                </Badge>
              </div>
              <CardTitle className="text-base font-semibold text-foreground">{report.title}</CardTitle>
              <CardDescription className="text-xs leading-relaxed text-muted-foreground mt-1.5">{report.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-2">
                <Label htmlFor={`format-${report.id}`} className="text-xs text-muted-foreground">Select Format:</Label>
                <select
                  id={`format-${report.id}`}
                  value={report.format}
                  onChange={(e) => report.setFormat(e.target.value as any)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs outline-none"
                >
                  <option value="excel">Microsoft Excel (.XLSX) - Styled</option>
                  <option value="csv">Standard CSV (.CSV)</option>
                </select>
              </div>

              <Button className="w-full text-xs h-10" onClick={() => handleDownload(report.id, report.format)}>
                {report.format === 'excel' ? (
                  <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-400" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export {report.format.toUpperCase()}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
