import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { errorResponse } from '@/lib/api-response'

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return errorResponse('Not authenticated', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        approvalStatus: true,
        onboardingCompleted: true,
        gymId: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        gym: true,
        ownedGyms: true,
      },
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    let activeGym = user.gym || (user.ownedGyms && user.ownedGyms.length > 0 ? user.ownedGyms[0] : null)

    // Check if there are user/gym specific settings or fallback
    const gymSettingsList = await prisma.gymSettings.findMany()
    const settingsMap: Record<string, string> = {}
    gymSettingsList.forEach((s) => {
      settingsMap[s.key] = s.value
    })

    if (activeGym) {
      // Prioritize activeGym's own database values, fallback to settingsMap if gym fields are empty
      activeGym = {
        ...activeGym,
        name: activeGym.name || settingsMap.gymName || 'VYAYAM AI Elite Performance Club',
        phone: activeGym.phone || settingsMap.gymPhone || null,
        address: activeGym.address || settingsMap.gymAddress || null,
        logoUrl: activeGym.logoUrl || settingsMap.gymLogoUrl || null,
      }
    } else if (settingsMap.gymName) {
      activeGym = {
        id: 'default',
        name: settingsMap.gymName,
        phone: settingsMap.gymPhone || null,
        address: settingsMap.gymAddress || null,
        logoUrl: settingsMap.gymLogoUrl || null,
      } as any
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          ...user,
          activeGym,
        },
        message: 'Session valid',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Session error:', error)
    return errorResponse('Internal server error', 500)
  }
}
