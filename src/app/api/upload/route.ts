import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { getSession } from '@/lib/auth'
import { errorResponse, successResponse } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return errorResponse('Authentication required', 401)
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return errorResponse('No file uploaded', 400)
    }

    // Validate mime type
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return errorResponse('Invalid file type. Only PNG, JPG, and WebP images are allowed.', 400)
    }

    // Validate size (max 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return errorResponse('File size exceeds the 5MB limit.', 400)
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = path.extname(file.name) || (file.type === 'image/png' ? '.png' : file.type === 'image/webp' ? '.webp' : '.jpg')
    const fileName = `gym-logo-${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const filePath = path.join(uploadsDir, fileName)

    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/${fileName}`

    return successResponse({ url: publicUrl }, 'Logo uploaded successfully')
  } catch (error) {
    console.error('Logo upload error:', error)
    return errorResponse('Failed to upload logo', 500)
  }
}
