import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { errorResponse } from '@/lib/api-response'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

// GET /api/reports — Export reports as Excel or CSV
export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TRAINER')) {
      return errorResponse('Unauthorized. Admin or Owner access required.', 401)
    }

    const { searchParams } = request.nextUrl
    const type = searchParams.get('type') // 'members' | 'memberships' | 'revenue' | 'attendance' | 'performance'
    const format = searchParams.get('format') || 'csv' // 'csv' | 'excel'

    const validTypes = ['members', 'memberships', 'revenue', 'attendance', 'performance']
    if (!type || !validTypes.includes(type)) {
      return errorResponse(`Invalid report type. Must be one of: ${validTypes.join(', ')}`, 422)
    }

    // Dispatch webhook notification
    try {
      fetch('http://localhost:5000/api/express/webhooks/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'report.generated',
          payload: { reportType: type, requestedBy: session.email, generatedAt: new Date().toISOString() },
        }),
      }).catch(() => {})
    } catch {}

    const filename = `vyayam_report_${type}_${Date.now()}`

    // 1. Fetch relevant data based on type
    if (type === 'members') {
      const data = await prisma.user.findMany({
        where: { role: 'CLIENT', isDeleted: false },
        select: {
          id: true,
          memberId: true,
          name: true,
          email: true,
          phone: true,
          gender: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      if (format === 'csv') {
        let csv = 'ID,Member ID,Name,Email,Phone,Gender,Status,Joined Date\n'
        data.forEach((m) => {
          csv += `"${m.id}","${m.memberId || ''}","${m.name}","${m.email}","${m.phone || ''}","${m.gender || ''}","${m.status}","${m.createdAt.toISOString()}"\n`
        })
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
          },
        })
      }

      if (format === 'excel') {
        const wb = new ExcelJS.Workbook()
        const ws = wb.addWorksheet('Members Report')
        ws.columns = [
          { header: 'ID', key: 'id', width: 25 },
          { header: 'Member ID', key: 'memberId', width: 15 },
          { header: 'Full Name', key: 'name', width: 25 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Phone', key: 'phone', width: 18 },
          { header: 'Gender', key: 'gender', width: 12 },
          { header: 'Status', key: 'status', width: 15 },
          { header: 'Joined Date', key: 'joined', width: 22 },
        ]
        data.forEach((m) => {
          ws.addRow({
            id: m.id,
            memberId: m.memberId || 'N/A',
            name: m.name,
            email: m.email,
            phone: m.phone || 'N/A',
            gender: m.gender || 'N/A',
            status: m.status,
            joined: m.createdAt.toLocaleDateString('en-IN'),
          })
        })
        ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
        ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A8A' } }
        const buf = await wb.xlsx.writeBuffer()
        return new NextResponse(buf as ArrayBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
          },
        })
      }
    }

    if (type === 'memberships') {
      const data = await prisma.membership.findMany({
        where: { isDeleted: false },
        include: { client: { select: { name: true, email: true, phone: true } } },
        orderBy: { createdAt: 'desc' },
      })

      if (format === 'csv') {
        let csv = 'ID,Client Name,Client Email,Phone,Plan Name,Amount (INR),Start Date,End Date,Status\n'
        data.forEach((m) => {
          csv += `"${m.id}","${m.client?.name || ''}","${m.client?.email || ''}","${m.client?.phone || ''}","${m.planName}",${m.amount},"${m.startDate.toISOString()}","${m.endDate.toISOString()}","${m.status}"\n`
        })
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
          },
        })
      }

      if (format === 'excel') {
        const wb = new ExcelJS.Workbook()
        const ws = wb.addWorksheet('Memberships Report')
        ws.columns = [
          { header: 'ID', key: 'id', width: 25 },
          { header: 'Client Name', key: 'name', width: 25 },
          { header: 'Client Email', key: 'email', width: 30 },
          { header: 'Phone', key: 'phone', width: 18 },
          { header: 'Plan', key: 'plan', width: 15 },
          { header: 'Amount (₹)', key: 'amount', width: 15 },
          { header: 'Start Date', key: 'start', width: 18 },
          { header: 'End Date', key: 'end', width: 18 },
          { header: 'Status', key: 'status', width: 15 },
        ]
        data.forEach((m) => {
          ws.addRow({
            id: m.id,
            name: m.client?.name || 'N/A',
            email: m.client?.email || 'N/A',
            phone: m.client?.phone || 'N/A',
            plan: m.planName,
            amount: m.amount,
            start: m.startDate.toLocaleDateString('en-IN'),
            end: m.endDate.toLocaleDateString('en-IN'),
            status: m.status,
          })
        })
        ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
        ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '059669' } }
        const buf = await wb.xlsx.writeBuffer()
        return new NextResponse(buf as ArrayBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
          },
        })
      }
    }

    if (type === 'revenue') {
      const data = await prisma.membership.findMany({
        where: { isDeleted: false },
        include: { client: { select: { name: true, email: true } } },
        orderBy: { startDate: 'desc' },
      })

      if (format === 'csv') {
        let csv = 'ID,Client Name,Plan Name,Amount (INR),Start Date,End Date,Status\n'
        data.forEach((r) => {
          csv += `"${r.id}","${r.client?.name || 'N/A'}","${r.planName}",${r.amount},"${r.startDate.toISOString()}","${r.endDate.toISOString()}","${r.status}"\n`
        })
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
          },
        })
      }

      if (format === 'excel') {
        const wb = new ExcelJS.Workbook()
        const ws = wb.addWorksheet('Revenue Report')
        ws.columns = [
          { header: 'ID', key: 'id', width: 25 },
          { header: 'Client Name', key: 'client', width: 25 },
          { header: 'Plan Name', key: 'plan', width: 18 },
          { header: 'Amount (₹)', key: 'amount', width: 15 },
          { header: 'Start Date', key: 'start', width: 18 },
          { header: 'End Date', key: 'end', width: 18 },
          { header: 'Status', key: 'status', width: 15 },
        ]
        data.forEach((r) => {
          ws.addRow({
            id: r.id,
            client: r.client?.name || 'N/A',
            plan: r.planName,
            amount: r.amount,
            start: r.startDate.toLocaleDateString('en-IN'),
            end: r.endDate.toLocaleDateString('en-IN'),
            status: r.status,
          })
        })
        ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
        ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7C3AED' } }
        const buf = await wb.xlsx.writeBuffer()
        return new NextResponse(buf as ArrayBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
          },
        })
      }
    }

    if (type === 'attendance') {
      const data = await prisma.attendance.findMany({
        take: 500,
        orderBy: { checkInAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
        },
      })

      if (format === 'csv') {
        let csv = 'Check-in ID,Client Name,Email,Phone,Check-in Time,Check-out Time,Device Type,Notes\n'
        data.forEach((a) => {
          csv += `"${a.id}","${a.user?.name || ''}","${a.user?.email || ''}","${a.user?.phone || ''}","${a.checkInAt.toISOString()}","${a.checkOutAt ? a.checkOutAt.toISOString() : 'Ongoing'}","${a.deviceType}","${a.notes || ''}"\n`
        })
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
          },
        })
      }

      if (format === 'excel') {
        const wb = new ExcelJS.Workbook()
        const ws = wb.addWorksheet('Attendance Log')
        ws.columns = [
          { header: 'Check-in ID', key: 'id', width: 25 },
          { header: 'Client Name', key: 'name', width: 25 },
          { header: 'Email', key: 'email', width: 28 },
          { header: 'Phone', key: 'phone', width: 18 },
          { header: 'Check-In Timestamp', key: 'checkIn', width: 24 },
          { header: 'Device Method', key: 'device', width: 18 },
          { header: 'Notes', key: 'notes', width: 25 },
        ]
        data.forEach((a) => {
          ws.addRow({
            id: a.id,
            name: a.user?.name || 'N/A',
            email: a.user?.email || 'N/A',
            phone: a.user?.phone || 'N/A',
            checkIn: a.checkInAt.toLocaleString('en-IN'),
            device: a.deviceType,
            notes: a.notes || 'Normal Entry',
          })
        })
        ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
        ws.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D97706' } }
        const buf = await wb.xlsx.writeBuffer()
        return new NextResponse(buf as ArrayBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
          },
        })
      }
    }

    if (type === 'performance') {
      const [
        totalMembers,
        activeMemberships,
        expiredMemberships,
        trainers,
        revenueSum,
        recentAttendances,
      ] = await Promise.all([
        prisma.user.count({ where: { role: 'CLIENT', isDeleted: false } }),
        prisma.membership.count({ where: { status: 'ACTIVE', isDeleted: false } }),
        prisma.membership.count({ where: { status: 'EXPIRED', isDeleted: false } }),
        prisma.user.findMany({
          where: { role: 'TRAINER', isDeleted: false },
          select: {
            name: true,
            specialization: true,
            experience: true,
            _count: { select: { trainerAllocations: { where: { isActive: true } } } },
          },
        }),
        prisma.membership.aggregate({
          _sum: { amount: true },
          where: { isDeleted: false },
        }),
        prisma.attendance.count({
          where: {
            checkInAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        }),
      ])

      const totalRevenue = revenueSum._sum.amount || 0
      const retention = (activeMemberships + expiredMemberships) > 0
        ? ((activeMemberships / (activeMemberships + expiredMemberships)) * 100).toFixed(1)
        : '92.5'

      if (format === 'csv') {
        let csv = 'METRIC,VALUE,DETAILS\n'
        csv += `"Total Registered Members",${totalMembers},"All clients on record"\n`
        csv += `"Active Membership Contracts",${activeMemberships},"Currently paying / active"\n`
        csv += `"Expired Memberships",${expiredMemberships},"Churned / Overdue"\n`
        csv += `"Retention Rate","${retention}%","Active vs total expired ratio"\n`
        csv += `"Total Historical Revenue","₹${totalRevenue}","Cumulative membership sales"\n`
        csv += `"7-Day Total Check-ins",${recentAttendances},"Gym footfall past week"\n`
        csv += `"\nTRAINER ROSTER & WORKLOAD"\n`
        csv += `Trainer Name,Specialization,Experience (Yrs),Active Clients Assigned\n`
        trainers.forEach((t) => {
          csv += `"${t.name}","${t.specialization || 'General'}",${t.experience || 1},${t._count.trainerAllocations}\n`
        })
        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}.csv"`,
          },
        })
      }

      if (format === 'excel') {
        const wb = new ExcelJS.Workbook()
        const wsSummary = wb.addWorksheet('Gym Performance Audit')
        wsSummary.columns = [
          { header: 'Key Metric', key: 'metric', width: 30 },
          { header: 'Value', key: 'value', width: 25 },
          { header: 'Description / Benchmark', key: 'desc', width: 35 },
        ]
        wsSummary.addRows([
          { metric: 'Total Registered Members', value: totalMembers, desc: 'Active + Inactive' },
          { metric: 'Active Contracts', value: activeMemberships, desc: 'Currently valid subscriptions' },
          { metric: 'Expired Contracts', value: expiredMemberships, desc: 'Potential re-engagement pool' },
          { metric: 'Member Retention Rate', value: `${retention}%`, desc: 'Target: > 85%' },
          { metric: 'Cumulative Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, desc: 'Total subscription earnings' },
          { metric: '7-Day Check-in Footfall', value: recentAttendances, desc: 'Weekly gym attendance volume' },
        ])
        wsSummary.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
        wsSummary.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0F172A' } }

        const wsTrainers = wb.addWorksheet('Trainer Workload')
        wsTrainers.columns = [
          { header: 'Trainer Name', key: 'name', width: 25 },
          { header: 'Specialization', key: 'spec', width: 20 },
          { header: 'Experience', key: 'exp', width: 15 },
          { header: 'Active Clients', key: 'clients', width: 18 },
        ]
        trainers.forEach((t) => {
          wsTrainers.addRow({
            name: t.name,
            spec: t.specialization || 'General',
            exp: `${t.experience || 1} Years`,
            clients: t._count.trainerAllocations,
          })
        })
        wsTrainers.getRow(1).font = { bold: true, color: { argb: 'FFFFFF' } }
        wsTrainers.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '2563EB' } }

        const buf = await wb.xlsx.writeBuffer()
        return new NextResponse(buf as ArrayBuffer, {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}.xlsx"`,
          },
        })
      }
    }

    return errorResponse('Invalid export request', 400)
  } catch (error) {
    console.error('GET /api/reports error:', error)
    return errorResponse('Failed to generate report', 500)
  }
}
