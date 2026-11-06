import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { registerSchema } from '@/lib/validators/auth'
import { errorResponse } from '@/lib/api-response'
import { Role } from '@/types'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const parsed = registerSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.')
        if (!fieldErrors[field]) fieldErrors[field] = []
        fieldErrors[field].push(issue.message)
      }
      return errorResponse('Validation failed', 422, fieldErrors)
    }

    const { name, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      // Prevent duplicate registrations
      return errorResponse('An account with this email already exists', 409)
    }

    // Hash password securely
    const passwordHash = await hashPassword(password)

    // Generate secure single-use verification token (expires in 24 hours)
    const verificationToken = generateVerificationToken()
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Create new Gym Owner user with isEmailVerified = false and onboardingCompleted = false
    // Do NOT issue login session JWT cookie until verification succeeds!
    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        passwordHash,
        role: Role.ADMIN,
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        onboardingCompleted: false,
        isEmailVerified: false,
        verificationToken,
        verificationTokenExpires,
      },
    })

    // Dispatch verification email
    const emailResult = await sendVerificationEmail({
      email: normalizedEmail,
      name: newUser.name,
      token: verificationToken,
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          email: normalizedEmail,
          requiresVerification: true,
          provider: emailResult.provider,
          // In local development, return devUrl so testers can verify with 1 click even without external SMTP
          devVerificationUrl: emailResult.provider === 'console-dev' ? emailResult.verificationUrl : undefined,
        },
        message: 'Please verify your email address before continuing.',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return errorResponse('Internal server error during registration', 500)
  }
}
