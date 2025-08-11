import { NextRequest } from 'next/server'
import { ziaAnalytics } from '@/lib/zia-analytics'
import { logAuditEvent } from '@/lib/hipaa-audit-edge'
import respond from '@/lib/api-respond'

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json()

    switch (action) {
      case 'sentiment_analysis':
        const sentimentResult = await ziaAnalytics.analyzeSentiment(
          data.text,
          data.user_id
        )
        return respond.ok(sentimentResult)

      case 'calculate_lead_score':
        const leadScore = await ziaAnalytics.calculateLeadScore(data.leadData)
        
        await logAuditEvent({
          action: 'CALCULATE_LEAD_SCORE',
          resource: 'Zia Analytics',
          user_id: data.user_id,
          result: 'success',
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent') || 'unknown',
          timestamp: new Date().toISOString(),
          origin: request.headers.get('origin') || 'unknown',
          request_id: crypto.randomUUID(),
          data: {
            lead_score: leadScore,
            service_type: data.leadData.serviceType
          }
        })
        return respond.ok({ lead_score: leadScore })

      case 'extract_keywords':
        const keywordsResult = await ziaAnalytics.extractKeywords(data.text)
        return respond.ok(keywordsResult)

      default:
        return respond.badRequest('Invalid action')
    }

  } catch (error) {
    console.error('Zia Analytics API error:', error)
    return respond.serverError('Internal server error', 'zia_analytics_error')
  }
}