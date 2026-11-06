import { NextRequest, NextResponse } from 'next/server'
import { contactSchema } from '@/lib/validators/auth'
import { errorResponse, successResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = contactSchema.safeParse(body)

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.')
        if (!fieldErrors[field]) fieldErrors[field] = []
        fieldErrors[field].push(issue.message)
      }
      return errorResponse('Validation failed', 422, fieldErrors)
    }

    const { name, email, subject, message } = parsed.data

    // In production, send email to support team / trigger webhook
    console.log('[Contact Message Received]:', { name, email, subject, message, receivedAt: new Date().toISOString() })

    return successResponse(
      { received: true },
      'Thank you for reaching out! Our gym enterprise specialist will connect with you shortly.'
    )
  } catch (error) {
    console.error('Contact API error:', error)
    return errorResponse('Failed to submit message. Please try again.', 500)
  }
}
