import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const PUBLIC_PATHS = [
  '/',
  '/login',
  '/signup',
  '/verify-email',
  '/pending-approval',
  '/access-denied',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/logout',
  '/api/contact',
]

const STATIC_PREFIXES = ['/_next', '/favicon.ico', '/images', '/icons', '/assets', '/uploads']

function getSecretKey(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'gym-admin-jwt-secret-key-change-in-production-32chars'
  return new TextEncoder().encode(secret)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow static assets
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next()
  }

  // Extract token from cookie
  const token = request.cookies.get('admin-token')?.value

  // If no token:
  if (!token) {
    // If public path, allow access
    if (PUBLIC_PATHS.some((path) => pathname === path)) {
      return NextResponse.next()
    }

    // API routes → 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      )
    }

    // Protected pages → redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Token is present — verify it
  try {
    const { payload } = await jwtVerify(token, getSecretKey())

    const onboardingCompleted = payload.onboardingCompleted
    const approvalStatus = payload.approvalStatus as string | undefined
    const userStatus = payload.status as string | undefined

    // If logged-in user visits /login or /signup, redirect them appropriately
    if (pathname === '/login' || pathname === '/signup') {
      if (!onboardingCompleted) {
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }
      if (approvalStatus === 'PENDING') {
        return NextResponse.redirect(new URL('/pending-approval', request.url))
      }
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // If onboarding is incomplete, enforce onboarding page (except for onboarding API & logout)
    if (
      !onboardingCompleted &&
      pathname !== '/onboarding' &&
      !pathname.startsWith('/api/onboarding') &&
      !pathname.startsWith('/api/auth/logout') &&
      pathname !== '/' &&
      pathname !== '/access-denied'
    ) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Onboarding incomplete', redirectUrl: '/onboarding' },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }

    // If pending approval, redirect to /pending-approval
    if (
      approvalStatus === 'PENDING' &&
      pathname !== '/pending-approval' &&
      pathname !== '/' &&
      !pathname.startsWith('/api/auth/logout')
    ) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Account pending approval' },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/pending-approval', request.url))
    }

    // If suspended, redirect to /access-denied
    if (
      userStatus === 'SUSPENDED' &&
      pathname !== '/access-denied' &&
      pathname !== '/' &&
      !pathname.startsWith('/api/auth/logout')
    ) {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json(
          { success: false, message: 'Account suspended' },
          { status: 403 }
        )
      }
      return NextResponse.redirect(new URL('/access-denied', request.url))
    }

    // Inject user info into request headers for downstream API routes
    const response = NextResponse.next()
    response.headers.set('x-user-id', payload.userId as string)
    response.headers.set('x-user-email', payload.email as string)
    response.headers.set('x-user-role', payload.role as string)
    response.headers.set('x-user-name', payload.name as string)
    if (payload.gymId) {
      response.headers.set('x-gym-id', payload.gymId as string)
    }
    return response
  } catch {
    // Token expired or invalid
    if (PUBLIC_PATHS.some((path) => pathname === path)) {
      const response = NextResponse.next()
      response.cookies.delete('admin-token')
      return response
    }

    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    const response = NextResponse.redirect(loginUrl)
    response.cookies.delete('admin-token')
    return response
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
