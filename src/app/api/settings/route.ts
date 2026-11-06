import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/auth'
import { successResponse, errorResponse } from '@/lib/api-response'

// GET /api/settings — Retrieve all gym configuration settings for logged-in user
export async function GET() {
  try {
    const session = await getSession()
    let gymData: any = null

    if (session) {
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        include: { gym: true, ownedGyms: true },
      })
      gymData = user?.gym || (user?.ownedGyms && user.ownedGyms.length > 0 ? user.ownedGyms[0] : null)
    }

    const settingsList = await prisma.gymSettings.findMany()
    const settingsRecord: Record<string, string> = {}
    settingsList.forEach((s) => {
      settingsRecord[s.key] = s.value
    })

    const responseData = {
      gymName: gymData?.name || settingsRecord.gymName || 'Iron Titan Fitness',
      gymPhone: gymData?.phone || settingsRecord.gymPhone || '09579369952',
      gymEmail: gymData?.email || settingsRecord.gymEmail || 'support@irontitan.com',
      gymAddress: gymData?.address || settingsRecord.gymAddress || 'SWARNA KALASH B 110, INFRONT OF S T STAND, PUNE NASHIK HIGHWAY Ambegaon Pune Maharashtra India, 410503',
      city: gymData?.city || settingsRecord.city || 'Pune',
      state: gymData?.state || settingsRecord.state || 'Maharashtra',
      pincode: gymData?.pincode || settingsRecord.pincode || '410503',
      branchesCount: settingsRecord.branchesCount || '1',
      website: settingsRecord.website || 'https://irontitanfitness.com',
      logoUrl: gymData?.logoUrl || settingsRecord.gymLogoUrl || '',
      notificationAlerts: settingsRecord.notificationAlerts || 'true',
      billingCurrency: settingsRecord.billingCurrency || 'INR',
    }

    return successResponse(responseData)
  } catch (error) {
    console.error('GET /api/settings error:', error)
    return errorResponse('Failed to fetch settings', 500)
  }
}

// PUT /api/settings — Bulk update configuration settings and owner's gym record
export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return errorResponse('Unauthorized. Admin access only.', 401)
    }

    const body = (await request.json()) as Record<string, string>
    if (!body || typeof body !== 'object') {
      return errorResponse('Invalid settings payload', 422)
    }

    // Execute bulk upsert in gym_settings
    const updatedSettings = await prisma.$transaction(async (tx) => {
      const promises = Object.entries(body).map(([key, value]) => {
        return tx.gymSettings.upsert({
          where: { key },
          update: { value: String(value ?? '') },
          create: { key, value: String(value ?? '') },
        })
      })
      return Promise.all(promises)
    })

    // Synchronize the logged in owner's specific Gym record
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { ownedGyms: true, gym: true },
    })

    const targetGym = user?.gym || (user?.ownedGyms && user.ownedGyms.length > 0 ? user.ownedGyms[0] : null)
    if (targetGym) {
      const gymUpdateData: Record<string, any> = {}
      if (body.gymName !== undefined) gymUpdateData.name = body.gymName
      if (body.gymPhone !== undefined) gymUpdateData.phone = body.gymPhone
      if (body.gymEmail !== undefined) gymUpdateData.email = body.gymEmail
      if (body.gymAddress !== undefined) gymUpdateData.address = body.gymAddress
      if (body.city !== undefined) gymUpdateData.city = body.city
      if (body.state !== undefined) gymUpdateData.state = body.state
      if (body.pincode !== undefined) gymUpdateData.pincode = body.pincode
      if (body.logoUrl !== undefined) gymUpdateData.logoUrl = body.logoUrl

      if (Object.keys(gymUpdateData).length > 0) {
        await prisma.gym.update({
          where: { id: targetGym.id },
          data: gymUpdateData,
        })
      }
    }

    return successResponse(updatedSettings, 'Settings updated successfully')
  } catch (error) {
    console.error('PUT /api/settings error:', error)
    return errorResponse('Failed to save settings', 500)
  }
}
