import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || (session.role !== 'ADMIN' && session.role !== 'TRAINER')) {
      return errorResponse('Unauthorized. Owner or Admin access required.', 401)
    }

    const body = await req.json()
    const { action } = body // 'send_renewal_reminders' | 'reconcile_expired' | 'reengage_inactive'

    const today = new Date()
    today.setHours(23, 59, 59, 999)

    const sevenDaysFromNow = new Date()
    sevenDaysFromNow.setDate(today.getDate() + 7)

    // Find default admin sender
    const defaultAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' },
      select: { id: true, name: true },
    })

    const senderId = session.userId || defaultAdmin?.id

    if (action === 'send_renewal_reminders') {
      // Find memberships expiring in next 7 days
      const expiringMemberships = await prisma.membership.findMany({
        where: {
          status: 'ACTIVE',
          isDeleted: false,
          endDate: {
            gte: new Date(),
            lte: sevenDaysFromNow,
          },
        },
        include: {
          client: { select: { id: true, name: true, email: true } },
        },
      })

      if (expiringMemberships.length === 0) {
        return successResponse({
          count: 0,
          message: 'No memberships are expiring within the next 7 days.',
        })
      }

      let sentCount = 0
      for (const m of expiringMemberships) {
        if (!senderId) continue

        // Check if reminder was already sent in last 3 days
        const recentNotif = await prisma.notification.findFirst({
          where: {
            type: 'RENEWAL_REMINDER',
            sentById: senderId,
            createdAt: {
              gte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            },
            recipients: {
              some: { userId: m.clientId },
            },
          },
        })

        if (!recentNotif) {
          await prisma.$transaction(async (tx) => {
            const notif = await tx.notification.create({
              data: {
                title: '⚡ Automated Membership Renewal Reminder',
                message: `Dear ${m.client.name}, your ${m.planName} plan expires on ${m.endDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}. Renew today at the front desk or via the portal to maintain continuous gym access!`,
                type: 'RENEWAL_REMINDER',
                sentById: senderId,
              },
            })

            await tx.notificationRecipient.create({
              data: {
                notificationId: notif.id,
                userId: m.clientId,
              },
            })
          })
          sentCount++
        }
      }

      return successResponse({
        count: sentCount,
        totalExpiring: expiringMemberships.length,
        message: `Successfully dispatched automated renewal alerts to ${sentCount} members.`,
      })
    }

    if (action === 'reconcile_expired') {
      const expiredMemberships = await prisma.membership.findMany({
        where: {
          status: 'ACTIVE',
          isDeleted: false,
          endDate: { lt: new Date() },
        },
        select: { id: true },
      })

      if (expiredMemberships.length > 0) {
        await prisma.membership.updateMany({
          where: { id: { in: expiredMemberships.map((m) => m.id) } },
          data: { status: 'EXPIRED' },
        })
      }

      return successResponse({
        reconciledCount: expiredMemberships.length,
        message: `Reconciled ${expiredMemberships.length} overdue memberships to EXPIRED status.`,
      })
    }

    if (action === 'reengage_inactive') {
      const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

      const activeClients = await prisma.user.findMany({
        where: {
          role: 'CLIENT',
          status: 'ACTIVE',
          isDeleted: false,
        },
        select: {
          id: true,
          name: true,
          attendances: {
            orderBy: { checkInAt: 'desc' },
            take: 1,
            select: { checkInAt: true },
          },
        },
      })

      const inactive = activeClients.filter((c) => {
        const lastCheckIn = c.attendances[0]?.checkInAt
        return !lastCheckIn || new Date(lastCheckIn) < fourteenDaysAgo
      })

      let dispatches = 0
      for (const client of inactive.slice(0, 20)) {
        if (!senderId) continue
        await prisma.$transaction(async (tx) => {
          const notif = await tx.notification.create({
            data: {
              title: '🔥 We Miss You at Vyayam Gym!',
              message: `Hi ${client.name}, consistency is key to your fitness transformation! Your dedicated trainers are ready for you. Stop by this week for your workout session.`,
              type: 'GENERAL',
              sentById: senderId,
            },
          })
          await tx.notificationRecipient.create({
            data: {
              notificationId: notif.id,
              userId: client.id,
            },
          })
        })
        dispatches++
      }

      return successResponse({
        count: dispatches,
        message: `Dispatched re-engagement motivation push to ${dispatches} inactive members.`,
      })
    }

    return errorResponse('Invalid action specified', 400)
  } catch (error) {
    console.error('POST /api/owner/automate error:', error)
    return errorResponse('Failed to execute automated operation', 500)
  }
}
