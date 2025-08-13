import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // For demo purposes, return the same placeholder image for all IDs
    const imagePath = join(process.cwd(), 'public', 'placeholder-user.jpg')
    const imageBuffer = readFileSync(imagePath)

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Content-Disposition': `inline; filename="avatar-${id}.jpg"`
      }
    })

  } catch (error) {
    console.error('Avatar placeholder error:', error)
    
    // Return a simple 1x1 transparent pixel as fallback
    const transparentPixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
      'base64'
    )
    
    return new NextResponse(transparentPixel, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400'
      }
    })
  }
}