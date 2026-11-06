import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession, signToken, COOKIE_NAME } from '@/lib/auth'
import { onboardingSchema } from '@/lib/validators/auth'
import { errorResponse, successResponse } from '@/lib/api-response'
import { Role } from '@/types'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) {
      return errorResponse('Authentication required', 401)
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        gym: true,
        ownedGyms: true,
      },
    })

    if (!user) {
      return errorResponse('User not found', 404)
    }

    const gym = user.gym || (user.ownedGyms && user.ownedGyms.length > 0 ? user.ownedGyms[0] : null)

    return successResponse({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        onboardingCompleted: user.onboardingCompleted,
        approvalStatus: user.approvalStatus,
      },
      gym: gym
        ? {
            id: gym.id,
            name: gym.name,
            phone: gym.phone,
            email: gym.email,
            address: gym.address,
            city: gym.city,
            state: gym.state,
            pincode: gym.pincode,
            plan: gym.plan,
            logoUrl: gym.logoUrl,
          }
        : null,
    })
  } catch (error) {
    console.error('Onboarding GET error:', error)
    return errorResponse('Failed to fetch onboarding status', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return errorResponse('Authentication required. Please log in.', 401)
    }

    const body = await request.json()

    const parsed = onboardingSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.')
        if (!fieldErrors[field]) fieldErrors[field] = []
        fieldErrors[field].push(issue.message)
      }
      return errorResponse('Validation failed', 422, fieldErrors)
    }

    const data = parsed.data

    // Check if user already owns a gym
    let gym = await prisma.gym.findFirst({
      where: { ownerId: session.userId },
    })

    const slug = data.gymName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substring(2, 6)

    if (gym) {
      // Update existing gym
      gym = await prisma.gym.update({
        where: { id: gym.id },
        data: {
          name: data.gymName,
          phone: data.phone,
          email: data.email,
          address: data.address,
          city: data.city,
          state: data.state || '',
          pincode: data.pincode || '',
          plan: data.plan || 'PRO',
          logoUrl: data.logoUrl || null,
        },
      })
    } else {
      // Create new Gym
      gym = await prisma.gym.create({
        data: {
          name: data.gymName,
          slug,
          ownerId: session.userId,
          email: data.email,
          phone: data.phone,
          address: data.address,
          city: data.city,
          state: data.state || '',
          pincode: data.pincode || '',
          plan: data.plan || 'PRO',
          logoUrl: data.logoUrl || null,
          status: 'ACTIVE',
        },
      })
    }

    // Update User record with phone, gym association and mark onboardingCompleted = true
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: {
        name: data.ownerName,
        phone: data.phone,
        gymId: gym.id,
        onboardingCompleted: true,
      },
    })

    // Issue refreshed JWT token reflecting completed onboarding
    const token = await signToken({
      userId: updatedUser.id,
      email: updatedUser.email,
      role: updatedUser.role as Role,
      name: updatedUser.name,
      gymId: gym.id,
      onboardingCompleted: true,
      approvalStatus: updatedUser.approvalStatus,
      status: updatedUser.status,
    })

    const response = NextResponse.json(
      {
        success: true,
        data: {
          gym,
          user: updatedUser,
          redirectUrl: updatedUser.approvalStatus === 'PENDING' ? '/pending-approval' : '/dashboard',
        },
        message: 'Gym setup complete! Welcome to VYAYAM AI.',
      },
      { status: 200 }
    )

    // Set updated cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Onboarding POST error:', error)
    return errorResponse('Failed to complete onboarding', 500)
  }
}
