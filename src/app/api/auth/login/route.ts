import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { comparePassword, signToken, COOKIE_NAME } from '@/lib/auth'
import { loginSchema } from '@/lib/validators/auth'
import { errorResponse } from '@/lib/api-response'
import { Role } from '@/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const parsed = loginSchema.safeParse(body)
    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.')
        if (!fieldErrors[field]) fieldErrors[field] = []
        fieldErrors[field].push(issue.message)
      }
      return errorResponse('Validation failed', 422, fieldErrors)
    }

    const { email, password } = parsed.data
    const normalizedEmail = email.toLowerCase().trim()

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        gym: true,
        ownedGyms: true,
      },
    })

    // 1. If an email has no registered account:
    // "No account found. Please create an account first."
    if (!user || (user as any).isDeleted) {
      return NextResponse.json(
        {
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'No account found. Please create an account first.',
        },
        { status: 404 }
      )
    }

    // 2. If an account exists but the email is not verified:
    // Prevent access and offer to resend the verification email
    if (!user.isEmailVerified) {
      return NextResponse.json(
        {
          success: false,
          code: 'EMAIL_NOT_VERIFIED',
          email: user.email,
          message: 'Please verify your email address before continuing.',
        },
        { status: 403 }
      )
    }

    // 3. Verify password:
    // If the password is incorrect, display a suitable error without creating an account
    const isValid = await comparePassword(password, user.passwordHash)
    if (!isValid) {
      return errorResponse('Invalid password. Please check your credentials.', 401)
    }

    // Check account status
    if (user.status === 'SUSPENDED') {
      return NextResponse.json(
        {
          success: false,
          redirectUrl: '/access-denied',
          message: 'Account has been suspended. Please contact support.',
        },
        { status: 403 }
      )
    }

    // Determine target redirect destination
    let redirectUrl = '/dashboard'
    const isOnboardingDone = Boolean((user as any).onboardingCompleted)
    const approvalStatus = (user as any).approvalStatus || 'APPROVED'

    if (!isOnboardingDone) {
      redirectUrl = '/onboarding'
    } else if (approvalStatus === 'PENDING') {
      redirectUrl = '/pending-approval'
    }

    const gymId = user.gymId || (user.ownedGyms && user.ownedGyms.length > 0 ? user.ownedGyms[0].id : null)

    // Generate JWT
    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      name: user.name,
      gymId,
      onboardingCompleted: isOnboardingDone,
      approvalStatus,
      status: user.status,
    })

    // Build response with user data (omit password)
    const { passwordHash: _, ...safeUser } = user

    const response = NextResponse.json(
      {
        success: true,
        data: {
          user: safeUser,
          token,
          redirectUrl,
        },
        message: 'Login successful',
      },
      { status: 200 }
    )

    const isHttps =
      request.nextUrl.protocol === 'https:' ||
      request.headers.get('x-forwarded-proto') === 'https'

    // Set HTTP-only cookie
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return errorResponse('Internal server error', 500)
  }
}
