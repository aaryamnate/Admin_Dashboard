import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { createMemberSchema } from '@/lib/validators/member'
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api-response'
import { parsePaginationParams, paginationArgs } from '@/lib/utils'

// GET /api/members — List all clients with pagination, search, sort
export async function GET(request: NextRequest) {
  try {
    const { page, pageSize, search, sortBy, sortOrder } = parsePaginationParams(
      request.nextUrl.searchParams
    )
    const status = request.nextUrl.searchParams.get('status') || undefined

    const where = {
      role: 'CLIENT' as const,
      isDeleted: false,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
      ...(status && { status: status as 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }),
    }

    const [members, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, name: true, email: true, phone: true, gender: true,
          dateOfBirth: true, role: true, heightCm: true, weightKg: true,
          status: true, avatarUrl: true, createdAt: true, updatedAt: true,
          memberships: {
            where: { isDeleted: false },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { id: true, planName: true, status: true, startDate: true, endDate: true },
          },
          clientAllocations: {
            where: { isActive: true },
            take: 1,
            select: { trainer: { select: { id: true, name: true } } },
          },
        },
        orderBy: { [sortBy === 'name' || sortBy === 'email' || sortBy === 'createdAt' ? sortBy : 'createdAt']: sortOrder },
        ...paginationArgs(page, pageSize),
      }),
      prisma.user.count({ where }),
    ])

    return paginatedResponse(members, total, page, pageSize)
  } catch (error) {
    console.error('GET /api/members error:', error)
    return errorResponse('Failed to fetch members', 500)
  }
}

// POST /api/members — Create a new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createMemberSchema.safeParse(body)

    if (!parsed.success) {
      const fieldErrors: Record<string, string[]> = {}
      for (const issue of parsed.error.issues) {
        const field = issue.path.join('.')
        if (!fieldErrors[field]) fieldErrors[field] = []
        fieldErrors[field].push(issue.message)
      }
      return errorResponse('Validation failed', 422, fieldErrors)
    }

    const { password, ...data } = parsed.data

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing) {
      return errorResponse('Email already exists', 409)
    }

    const passwordHash = await hashPassword(password)

    const member = await prisma.user.create({
      data: {
        ...data,
        passwordHash,
        role: 'CLIENT',
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
      },
      select: {
        id: true, name: true, email: true, phone: true, gender: true,
        dateOfBirth: true, role: true, heightCm: true, weightKg: true,
        status: true, createdAt: true,
      },
    })

    return successResponse(member, 'Member created successfully', 201)
  } catch (error) {
    console.error('POST /api/members error:', error)
    return errorResponse('Failed to create member', 500)
  }
}
