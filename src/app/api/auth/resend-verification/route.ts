import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { errorResponse, successResponse } from '@/lib/api-response'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}))
    const { email } = body

    if (!email || typeof email !== 'string') {
      return errorResponse('Email address is required', 400)
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (!user) {
      // Per instructions: "If an email has no registered account, display: 'No account found. Please create an account first.'"
      return errorResponse('No account found. Please create an account first.', 404)
    }

    if (user.isEmailVerified) {
      return errorResponse('This email is already verified. Please proceed to sign in.', 400)
    }

    // Generate new token & 24h expiration
    const verificationToken = generateVerificationToken()
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken,
        verificationTokenExpires,
      },
    })

    const emailResult = await sendVerificationEmail({
      email: user.email,
      name: user.name,
      token: verificationToken,
    })

    return successResponse(
      {
        email: user.email,
        provider: emailResult.provider,
        devVerificationUrl: emailResult.provider === 'console-dev' ? emailResult.verificationUrl : undefined,
      },
      'Verification email sent successfully! Please check your inbox.'
    )
  } catch (error) {
    console.error('Resend verification error:', error)
    return errorResponse('Failed to resend verification email', 500)
  }
}
