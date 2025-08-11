/**
 * Zia Analytics Integration for Snug & Kisses CRM
 * Provides sentiment analysis, text analytics, and AI-powered insights
 */

import { logAuditEvent } from './hipaa-audit-edge'

interface ZiaTextAnalyticsRequest {
  text: string
  feature: 'sentiment' | 'keywords' | 'summary' | 'classification'
  language?: string
}

interface ZiaSentimentResult {
  sentiment: 'positive' | 'negative' | 'neutral'
  confidence: number
  score: number
  keywords?: string[]
}

interface ZiaKeywordsResult {
  keywords: Array<{
    keyword: string
    relevance: number
  }>
}

interface ZiaImageModerationRequest {
  image_url: string
  moderation_type: 'adult_content' | 'violence' | 'medical' | 'general'
}

interface ZiaImageModerationResult {
  is_safe: boolean
  confidence: number
  categories: Array<{
    category: string
    probability: number
  }>
}

interface ZiaOCRRequest {
  image_url: string
  document_type?: 'business_card' | 'invoice' | 'receipt' | 'form' | 'general'
  language?: string
}

interface ZiaOCRResult {
  text: string
  confidence: number
  document_type_detected?: string
  structured_data?: {
    [key: string]: string
  }
  bounding_boxes?: Array<{
    text: string
    coordinates: number[]
  }>
}

class ZiaAnalyticsService {
  private accessToken: string | null = null
  private tokenExpiry = 0
  private baseUrl = 'https://www.zohoapis.com/zia/v1'

  constructor() {
    // Initialize with Zoho credentials
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    try {
      const response = await fetch('https://accounts.zoho.com/oauth/v2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
          client_id: process.env.ZOHO_CLIENT_ID!,
          client_secret: process.env.ZOHO_CLIENT_SECRET!,
          grant_type: 'refresh_token',
        }),
      })

      const data = await response.json()
      this.accessToken = data.access_token
      this.tokenExpiry = Date.now() + data.expires_in * 1000 - 60000

      return this.accessToken
    } catch (error) {
      throw new Error('Failed to get Zia access token')
    }
  }

  private async makeZiaRequest(endpoint: string, data: any): Promise<any> {
    const token = await this.getAccessToken()
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-oauthtoken ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`Zia API error: ${response.statusText}`)
    }

    return response.json()
  }

  /**
   * Analyze text sentiment for lead scoring
   */
  async analyzeSentiment(text: string, userId?: string): Promise<ZiaSentimentResult> {
    try {
      const result = await this.makeZiaRequest('/textanalytics', {
        text,
        feature: 'sentiment',
        language: 'en'
      })

      await logAuditEvent({
        action: 'ZIA_SENTIMENT_ANALYSIS',
        resource: 'Text Analytics',
        user_id: userId,
        result: 'success',
        ip_address: 'server',
        user_agent: 'server',
        timestamp: new Date().toISOString(),
        origin: 'server',
        request_id: crypto.randomUUID(),
        data: {
          text_length: text.length,
          sentiment: result.sentiment,
          confidence: result.confidence
        }
      })

      return {
        sentiment: result.sentiment,
        confidence: result.confidence,
        score: result.score,
        keywords: result.keywords
      }
    } catch (error) {
      await logAuditEvent({
        action: 'ZIA_SENTIMENT_ANALYSIS',
        resource: 'Text Analytics',
        user_id: userId,
        result: 'error',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        ip_address: 'server',
        user_agent: 'server',
        timestamp: new Date().toISOString(),
        origin: 'server',
        request_id: crypto.randomUUID()
      })
      throw error
    }
  }

  /**
   * Extract keywords from text
   */
  async extractKeywords(text: string): Promise<ZiaKeywordsResult> {
    const result = await this.makeZiaRequest('/textanalytics', {
      text,
      feature: 'keywords',
      language: 'en'
    })

    return {
      keywords: result.keywords.map((kw: any) => ({
        keyword: kw.keyword,
        relevance: kw.relevance
      }))
    }
  }

  /**
   * Moderate image content
   */
  async moderateImage(imageUrl: string, moderationType: string = 'general'): Promise<ZiaImageModerationResult> {
    const result = await this.makeZiaRequest('/imagemoderation', {
      image_url: imageUrl,
      moderation_type: moderationType
    })

    return {
      is_safe: result.is_safe,
      confidence: result.confidence,
      categories: result.categories || []
    }
  }

  /**
   * Enhanced OCR with document type detection
   */
  async performOCRWithDocumentDetection(imageUrl: string, documentType?: string): Promise<ZiaOCRResult> {
    const result = await this.makeZiaRequest('/ocr', {
      image_url: imageUrl,
      document_type: documentType || 'general',
      language: 'en',
      extract_structured_data: true
    })

    return {
      text: result.text,
      confidence: result.confidence,
      document_type_detected: result.document_type_detected,
      structured_data: result.structured_data,
      bounding_boxes: result.bounding_boxes
    }
  }

  /**
   * Calculate lead score based on sentiment analysis
   */
  async calculateLeadScore(leadData: {
    message?: string
    notes?: string
    source?: string
    serviceType?: string
  }): Promise<number> {
    let score = 50 // Base score

    // Analyze message sentiment
    if (leadData.message) {
      const sentiment = await this.analyzeSentiment(leadData.message)
      
      switch (sentiment.sentiment) {
        case 'positive':
          score += 25 * sentiment.confidence
          break
        case 'negative':
          score -= 15 * sentiment.confidence
          break
        case 'neutral':
          score += 5
          break
      }
    }

    // Analyze notes sentiment
    if (leadData.notes) {
      const sentiment = await this.analyzeSentiment(leadData.notes)
      
      switch (sentiment.sentiment) {
        case 'positive':
          score += 15 * sentiment.confidence
          break
        case 'negative':
          score -= 10 * sentiment.confidence
          break
      }
    }

    // Adjust based on source
    switch (leadData.source?.toLowerCase()) {
      case 'referral':
        score += 20
        break
      case 'website':
        score += 10
        break
      case 'social media':
        score += 5
        break
    }

    // Adjust based on service type
    if (leadData.serviceType?.toLowerCase().includes('premium')) {
      score += 15
    }

    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(score)))
  }
}

// Singleton instance
const ziaAnalytics = new ZiaAnalyticsService()

export { ziaAnalytics, type ZiaSentimentResult, type ZiaImageModerationResult, type ZiaOCRResult }
export default ziaAnalytics