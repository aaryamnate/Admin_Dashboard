import { NextRequest, NextResponse } from 'next/server'
import { COOKIE_NAME } from '@/lib/auth'

function clearAuthCookie(response: NextResponse, request: NextRequest) {
  const isHttps =
    request.nextUrl.protocol === 'https:' ||
    request.headers.get('x-forwarded-proto') === 'https'

  // Delete via standard delete
  response.cookies.delete(COOKIE_NAME)

  // Force expiration via explicit headers
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: isHttps,
    sameSite: 'lax',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
  })

  return response
}

export async function POST(request: NextRequest) {
  const response = NextResponse.json(
    { success: true, message: 'Logged out successfully' },
    { status: 200 }
  )

  return clearAuthCookie(response, request)
}

export async function GET(request: NextRequest) {
  const loginUrl = new URL('/login', request.url)
  const response = NextResponse.redirect(loginUrl)

  return clearAuthCookie(response, request)
}
