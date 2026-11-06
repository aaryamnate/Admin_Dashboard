import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { token, email } = body

    if (!token) {
      return errorResponse('Verification token is required', 400)
    }

    // Look up user by verification token
    const user = await prisma.user.findFirst({
      where: {
        verificationToken: token,
        ...(email ? { email: email.toLowerCase().trim() } : {}),
      },
    })

    if (!user) {
      return errorResponse('Invalid or expired verification token. Please request a new verification link.', 400)
    }

    // Check if token has expired
    if (user.verificationTokenExpires && new Date() > user.verificationTokenExpires) {
      return errorResponse('Verification link has expired. Please request a new verification email.', 400)
    }

    // Mark email verified, clear single-use token and expiration
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
      },
    })

    return successResponse(
      {
        verified: true,
        email: user.email,
        name: user.name,
      },
      'Email address verified successfully! You can now log in to continue gym setup.'
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return errorResponse('Internal server error during email verification', 500)
  }
}
