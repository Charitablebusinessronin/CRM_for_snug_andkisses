import { NextRequest } from 'next/server'
import { ziaAnalytics } from '@/lib/zia-analytics'
import { logAuditEvent } from '@/lib/hipaa-audit-edge'
import respond from '@/lib/api-respond'

export async function POST(request: NextRequest) {
  try {
    const { image_url, moderation_type, user_id } = await request.json()

    if (!image_url) {
      return respond.badRequest('Image URL is required')
    }

    const moderationResult = await ziaAnalytics.moderateImage(
      image_url,
      moderation_type || 'general'
    )

    await logAuditEvent({
      action: 'ZIA_IMAGE_MODERATION',
      resource: 'Image Content',
      user_id,
      result: 'success',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: request.headers.get('origin') || 'unknown',
      request_id: crypto.randomUUID(),
      data: {
        image_url,
        is_safe: moderationResult.is_safe,
        confidence: moderationResult.confidence,
        moderation_type
      }
    })
    return respond.ok(moderationResult)

  } catch (error) {
    console.error('Zia Image Moderation error:', error)
    
    await logAuditEvent({
      action: 'ZIA_IMAGE_MODERATION',
      result: 'error',
      error_message: error instanceof Error ? error.message : 'Unknown error',
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      origin: request.headers.get('origin') || 'unknown',
      request_id: crypto.randomUUID()
    })
    return respond.serverError('Failed to moderate image', 'zia_image_moderation_error')
  }
}