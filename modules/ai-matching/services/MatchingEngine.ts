import { HIPAAAuditService } from '../../hipaa-compliance/services/HIPAAAuditService'
import type { 
  MatchingRequest, MatchingResponse, MatchResult, CaregiverProfile, 
  MatchingAlgorithm, MLModel, MatchFeedback
} from '../types/MatchingTypes'

/**
 * AI Caregiver Matching Engine - HIPAA Compliant Healthcare Matching
 * Advanced AI-powered system for matching clients with qualified caregivers
 */
export class MatchingEngine {
  private auditService: HIPAAAuditService
  private baseUrl: string
  private currentAlgorithm: MatchingAlgorithm
  private activeModel: MLModel | null = null

  constructor() {
    this.auditService = new HIPAAAuditService()
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'
    this.currentAlgorithm = this.getDefaultAlgorithm()
  }

  /**
   * Main matching function - finds best caregivers for client requirements
   */
  async findMatches(request: MatchingRequest): Promise<MatchingResponse> {
    const startTime = Date.now()
    
    try {
      await this.auditService.logEvent({
        eventType: 'AI_MATCHING_REQUEST',
        userEmail: 'system@snugkisses.com',
        resourceType: 'matching_request',
        resourceId: request.requestId,
        timestamp: new Date().toISOString(),
        complianceLogged: true,
        details: `AI matching requested for client ${request.clientRequirements.clientId}`,
        sensitivityLevel: 'MEDIUM'
      })

      // Get available caregivers in the area
      const candidates = await this.getCandidateCaregivers(request.clientRequirements)
      
      // Score each candidate
      const scoredMatches = await this.scoreCandidates(request, candidates)
      
      // Apply algorithm weights and filters
      const filteredMatches = await this.applyFiltersAndWeights(scoredMatches, request)
      
      // Sort by score and take top results
      const topMatches = filteredMatches
        .sort((a, b) => b.overallScore - a.overallScore)
        .slice(0, request.maxResults)

      // Generate explanations
      const finalMatches = await this.generateExplanations(topMatches, request)

      const response: MatchingResponse = {
        requestId: request.requestId,
        matches: finalMatches,
        processedAt: new Date().toISOString(),
        processingTimeMs: Date.now() - startTime,
        algorithmUsed: this.currentAlgorithm.name,
        totalCandidatesEvaluated: candidates.length,
        metadata: {
          searchRadius: request.clientRequirements.location.radius,
          availableCaregivers: candidates.length,
          qualifiedCaregivers: scoredMatches.length,
          reasons: this.generateSearchReasons(request, candidates.length, finalMatches.length)
        }
      }

      await this.auditService.logEvent({
        eventType: 'AI_MATCHING_COMPLETED',
        userEmail: 'system@snugkisses.com',
        resourceType: 'matching_response',
        resourceId: request.requestId,
        timestamp: new Date().toISOString(),
        complianceLogged: true,
        details: `AI matching completed with ${finalMatches.length} results in ${Date.now() - startTime}ms`,
        sensitivityLevel: 'LOW'
      })

      return response

    } catch (error) {
      await this.auditService.logEvent({
        eventType: 'AI_MATCHING_ERROR',
        userEmail: 'system@snugkisses.com',
        resourceType: 'matching_error',
        resourceId: request.requestId,
        timestamp: new Date().toISOString(),
        complianceLogged: true,
        details: `AI matching failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        sensitivityLevel: 'HIGH'
      })
      
      throw new Error('Unable to complete caregiver matching request')
    }
  }

  /**
   * Get candidate caregivers based on location and basic requirements
   */
  private async getCandidateCaregivers(requirements: any): Promise<CaregiverProfile[]> {
    // TODO: Replace with actual API call to caregiver database
    const mockCaregivers: CaregiverProfile[] = [
      {
        caregiverId: 'caregiver_001',
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          bio: 'Registered nurse with 8 years of postpartum care experience.',
          yearsOfExperience: 8,
          gender: 'female',
          languages: ['English', 'Spanish']
        },
        location: {
          baseLocation: {
            address: '123 Oak Street, Portland, OR',
            coordinates: { latitude: 45.5152, longitude: -122.6784 }
          },
          serviceRadius: 25,
          transportationMethod: 'own-vehicle'
        },
        qualifications: {
          certifications: [
            {
              name: 'Registered Nurse',
              issuer: 'Oregon State Board of Nursing',
              number: 'RN123456',
              issueDate: '2016-05-15',
              expirationDate: '2026-05-15',
              verificationStatus: 'verified'
            }
          ],
          education: [
            {
              institution: 'Oregon Health & Science University',
              degree: 'Bachelor of Science in Nursing',
              field: 'Nursing',
              graduationDate: '2016-05-15'
            }
          ],
          specialTraining: [],
          licenses: []
        },
        expertise: {
          primarySpecialties: ['postpartum-care', 'newborn-care', 'lactation-support'],
          secondarySkills: ['baby-care', 'maternal-support'],
          specializedCare: ['c-section-recovery'],
          medicalCapabilities: [
            {
              skill: 'Medication Administration',
              level: 'advanced',
              certificationDate: '2016-05-15',
              verified: true
            }
          ]
        },
        availability: {
          schedule: {
            monday: { available: true, timeSlots: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00', flexibility: 30 }] },
            tuesday: { available: true, timeSlots: [{ dayOfWeek: 2, startTime: '09:00', endTime: '17:00', flexibility: 30 }] },
            wednesday: { available: true, timeSlots: [{ dayOfWeek: 3, startTime: '09:00', endTime: '17:00', flexibility: 30 }] },
            thursday: { available: true, timeSlots: [{ dayOfWeek: 4, startTime: '09:00', endTime: '17:00', flexibility: 30 }] },
            friday: { available: true, timeSlots: [{ dayOfWeek: 5, startTime: '09:00', endTime: '17:00', flexibility: 30 }] },
            saturday: { available: false, timeSlots: [] },
            sunday: { available: false, timeSlots: [] }
          },
          blackoutDates: [],
          maxHoursPerWeek: 40,
          preferredShiftLength: { min: 4, max: 8 }
        },
        pricing: {
          baseHourlyRate: 75,
          specializedRates: { 'c-section-recovery': 85 },
          minimumBooking: 4
        },
        performance: {
          overallRating: 4.9,
          totalReviews: 127,
          completionRate: 98.5,
          responseTime: 15,
          reliabilityScore: 96,
          clientSatisfactionScore: 4.8
        },
        preferences: {
          preferredClientTypes: ['first-time-mothers', 'c-section-recovery'],
          workingStyle: {
            approach: 'supportive',
            communication: 'frequent',
            flexibility: 'high',
            clientInvolvement: 'high'
          },
          communicationStyle: ['text', 'phone', 'email'],
          unavailableDates: []
        },
        status: 'available'
      },
      {
        caregiverId: 'caregiver_002',
        personalInfo: {
          firstName: 'Maria',
          lastName: 'Rodriguez',
          bio: 'Certified postpartum doula specializing in lactation support and newborn care.',
          yearsOfExperience: 5,
          gender: 'female',
          languages: ['English', 'Spanish']
        },
        location: {
          baseLocation: {
            address: '456 Pine Avenue, Portland, OR',
            coordinates: { latitude: 45.5272, longitude: -122.6851 }
          },
          serviceRadius: 20,
          transportationMethod: 'own-vehicle'
        },
        qualifications: {
          certifications: [
            {
              name: 'Certified Postpartum Doula',
              issuer: 'DONA International',
              number: 'CPD789012',
              issueDate: '2019-03-20',
              expirationDate: '2025-03-20',
              verificationStatus: 'verified'
            }
          ],
          education: [],
          specialTraining: [
            {
              name: 'Lactation Support Specialist',
              provider: 'International Childbirth Education Association',
              hours: 40,
              completionDate: '2020-01-15'
            }
          ],
          licenses: []
        },
        expertise: {
          primarySpecialties: ['lactation-support', 'postpartum-care', 'newborn-care'],
          secondarySkills: ['baby-care', 'sleep-training'],
          specializedCare: ['breastfeeding-support'],
          medicalCapabilities: []
        },
        availability: {
          schedule: {
            monday: { available: true, timeSlots: [{ dayOfWeek: 1, startTime: '08:00', endTime: '20:00', flexibility: 60 }] },
            tuesday: { available: true, timeSlots: [{ dayOfWeek: 2, startTime: '08:00', endTime: '20:00', flexibility: 60 }] },
            wednesday: { available: true, timeSlots: [{ dayOfWeek: 3, startTime: '08:00', endTime: '20:00', flexibility: 60 }] },
            thursday: { available: true, timeSlots: [{ dayOfWeek: 4, startTime: '08:00', endTime: '20:00', flexibility: 60 }] },
            friday: { available: true, timeSlots: [{ dayOfWeek: 5, startTime: '08:00', endTime: '20:00', flexibility: 60 }] },
            saturday: { available: true, timeSlots: [{ dayOfWeek: 6, startTime: '10:00', endTime: '18:00', flexibility: 30 }] },
            sunday: { available: true, timeSlots: [{ dayOfWeek: 0, startTime: '10:00', endTime: '18:00', flexibility: 30 }] }
          },
          blackoutDates: [],
          maxHoursPerWeek: 50,
          preferredShiftLength: { min: 3, max: 6 }
        },
        pricing: {
          baseHourlyRate: 65,
          specializedRates: { 'lactation-support': 75 },
          minimumBooking: 3
        },
        performance: {
          overallRating: 4.7,
          totalReviews: 89,
          completionRate: 97.2,
          responseTime: 12,
          reliabilityScore: 94,
          clientSatisfactionScore: 4.6
        },
        preferences: {
          preferredClientTypes: ['breastfeeding-support', 'new-parents'],
          workingStyle: {
            approach: 'educational',
            communication: 'regular',
            flexibility: 'high',
            clientInvolvement: 'high'
          },
          communicationStyle: ['text', 'video-call'],
          unavailableDates: []
        },
        status: 'available'
      }
    ]

    // Filter by basic location proximity (mock implementation)
    return mockCaregivers.filter(caregiver => {
      const distance = this.calculateDistance(
        requirements.location.coordinates,
        caregiver.location.baseLocation.coordinates
      )
      return distance <= caregiver.location.serviceRadius
    })
  }

  /**
   * Score each candidate against client requirements
   */
  private async scoreCandidates(request: MatchingRequest, candidates: CaregiverProfile[]): Promise<MatchResult[]> {
    const results: MatchResult[] = []

    for (const caregiver of candidates) {
      const scores = await this.calculateMatchScore(request.clientRequirements, caregiver)
      
      const match: MatchResult = {
        matchId: `match_${request.requestId}_${caregiver.caregiverId}`,
        clientId: request.clientRequirements.clientId,
        caregiverId: caregiver.caregiverId,
        overallScore: scores.overall,
        confidence: scores.confidence,
        matchedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        breakdown: scores.breakdown,
        explanation: {
          strengths: [],
          concerns: [],
          recommendations: []
        },
        estimatedCost: {
          hourlyRate: caregiver.pricing.baseHourlyRate,
          totalEstimate: caregiver.pricing.baseHourlyRate * 40 // Estimate 40 hours
        },
        status: 'pending'
      }

      results.push(match)
    }

    return results
  }

  /**
   * Calculate detailed match score between client requirements and caregiver
   */
  private async calculateMatchScore(requirements: any, caregiver: CaregiverProfile): Promise<{
    overall: number
    confidence: number
    breakdown: any
  }> {
    const weights = this.currentAlgorithm.weights

    // Location score (0-100)
    const locationScore = this.calculateLocationScore(requirements.location, caregiver.location)
    
    // Qualification match score (0-100)
    const qualificationScore = this.calculateQualificationScore(requirements.careNeeds, caregiver.expertise)
    
    // Availability alignment score (0-100)
    const availabilityScore = this.calculateAvailabilityScore(requirements.schedule, caregiver.availability)
    
    // Experience level score (0-100)
    const experienceScore = this.calculateExperienceScore(requirements.preferences.experienceLevel, caregiver.personalInfo.yearsOfExperience)
    
    // Performance score (0-100)
    const performanceScore = this.calculatePerformanceScore(caregiver.performance)
    
    // Pricing compatibility score (0-100)
    const pricingScore = this.calculatePricingScore(requirements.budget, caregiver.pricing)
    
    // Language match score (0-100)
    const languageScore = this.calculateLanguageScore(requirements.preferences.languagePreferences, caregiver.personalInfo.languages)

    // Calculate weighted overall score
    const overallScore = (
      locationScore * weights.locationProximity +
      qualificationScore * weights.qualificationMatch +
      availabilityScore * weights.availabilityAlignment +
      experienceScore * weights.experienceLevel +
      performanceScore * weights.caregiverPerformance +
      pricingScore * weights.pricingCompatibility +
      languageScore * weights.languageMatch
    ) / 100

    const confidence = this.calculateConfidence([
      locationScore, qualificationScore, availabilityScore, 
      experienceScore, performanceScore, pricingScore, languageScore
    ])

    return {
      overall: Math.round(overallScore * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      breakdown: {
        locationScore: Math.round(locationScore),
        qualificationScore: Math.round(qualificationScore),
        availabilityScore: Math.round(availabilityScore),
        preferenceScore: Math.round((experienceScore + languageScore) / 2),
        performanceScore: Math.round(performanceScore),
        pricingScore: Math.round(pricingScore),
        specializedScore: Math.round(qualificationScore)
      }
    }
  }

  /**
   * Calculate location proximity score
   */
  private calculateLocationScore(clientLocation: any, caregiverLocation: any): number {
    const distance = this.calculateDistance(
      clientLocation.coordinates,
      caregiverLocation.baseLocation.coordinates
    )

    const maxDistance = Math.min(clientLocation.radius, caregiverLocation.serviceRadius)
    
    if (distance > maxDistance) return 0
    
    // Score inversely proportional to distance
    return Math.max(0, 100 - (distance / maxDistance) * 50)
  }

  /**
   * Calculate qualification match score
   */
  private calculateQualificationScore(careNeeds: any, expertise: any): number {
    let score = 0
    let totalNeeds = 0

    // Check primary care needs
    if (careNeeds.primary) {
      for (const need of careNeeds.primary) {
        totalNeeds++
        if (expertise.primarySpecialties.includes(need)) {
          score += 30 // High weight for primary match
        } else if (expertise.secondarySkills.includes(need)) {
          score += 20 // Medium weight for secondary match
        }
      }
    }

    // Check specialized care needs
    if (careNeeds.specialized) {
      for (const need of careNeeds.specialized) {
        totalNeeds++
        if (expertise.specializedCare.includes(need)) {
          score += 40 // Very high weight for specialized match
        }
      }
    }

    return totalNeeds > 0 ? Math.min(100, score / totalNeeds * 2) : 50
  }

  /**
   * Calculate availability alignment score
   */
  private calculateAvailabilityScore(clientSchedule: any, caregiverAvailability: any): number {
    // Simplified scoring - in production this would be more complex
    let matchingSlots = 0
    let totalRequiredSlots = clientSchedule.timeSlots?.length || 1

    if (clientSchedule.timeSlots) {
      for (const slot of clientSchedule.timeSlots) {
        const dayName = this.getDayName(slot.dayOfWeek)
        const caregiverDay = caregiverAvailability.schedule[dayName]
        
        if (caregiverDay?.available) {
          // Check if times overlap
          for (const cgSlot of caregiverDay.timeSlots) {
            if (this.timeSlotsOverlap(slot, cgSlot)) {
              matchingSlots++
              break
            }
          }
        }
      }
    }

    return totalRequiredSlots > 0 ? (matchingSlots / totalRequiredSlots) * 100 : 0
  }

  /**
   * Calculate experience level score
   */
  private calculateExperienceScore(requiredLevel: string, yearsOfExperience: number): number {
    const experienceLevels = {
      'entry': { min: 0, max: 2 },
      'intermediate': { min: 2, max: 5 },
      'experienced': { min: 5, max: 10 },
      'expert': { min: 10, max: Infinity }
    }

    const range = experienceLevels[requiredLevel as keyof typeof experienceLevels]
    if (!range) return 50

    if (yearsOfExperience >= range.min && yearsOfExperience <= range.max) {
      return 100
    } else if (yearsOfExperience > range.max) {
      return Math.max(70, 100 - (yearsOfExperience - range.max) * 5) // Slight penalty for overqualification
    } else {
      return Math.max(0, 70 - (range.min - yearsOfExperience) * 20) // Penalty for underqualification
    }
  }

  /**
   * Calculate performance score based on caregiver metrics
   */
  private calculatePerformanceScore(performance: any): number {
    const ratingScore = (performance.overallRating / 5) * 30
    const completionScore = (performance.completionRate / 100) * 25
    const reliabilityScore = (performance.reliabilityScore / 100) * 25
    const satisfactionScore = (performance.clientSatisfactionScore / 5) * 20

    return ratingScore + completionScore + reliabilityScore + satisfactionScore
  }

  /**
   * Calculate pricing compatibility score
   */
  private calculatePricingScore(budget: any, pricing: any): number {
    if (!budget.hourlyRateRange) return 50

    const { min, max } = budget.hourlyRateRange
    const rate = pricing.baseHourlyRate

    if (rate >= min && rate <= max) {
      return 100
    } else if (rate < min) {
      return Math.max(60, 100 - (min - rate) / min * 40)
    } else {
      return Math.max(0, 100 - (rate - max) / max * 60)
    }
  }

  /**
   * Calculate language match score
   */
  private calculateLanguageScore(preferredLanguages: string[], caregiverLanguages: string[]): number {
    if (!preferredLanguages || preferredLanguages.length === 0) return 100

    const matches = preferredLanguages.filter(lang => 
      caregiverLanguages.some(cgLang => cgLang.toLowerCase() === lang.toLowerCase())
    )

    return (matches.length / preferredLanguages.length) * 100
  }

  /**
   * Apply algorithm filters and weights to matches
   */
  private async applyFiltersAndWeights(matches: MatchResult[], request: MatchingRequest): Promise<MatchResult[]> {
    return matches.filter(match => {
      // Apply minimum score filter
      if (match.overallScore < 0.3) return false
      
      // Apply confidence filter
      if (match.confidence < 0.5) return false
      
      return true
    })
  }

  /**
   * Generate explanations for each match
   */
  private async generateExplanations(matches: MatchResult[], request: MatchingRequest): Promise<MatchResult[]> {
    return matches.map(match => {
      const strengths = []
      const concerns = []
      const recommendations = []

      // Analyze scores and generate explanations
      if (match.breakdown.qualificationScore >= 80) {
        strengths.push("Excellent qualification match for your care needs")
      } else if (match.breakdown.qualificationScore < 60) {
        concerns.push("Limited experience in some of your required care areas")
      }

      if (match.breakdown.locationScore >= 90) {
        strengths.push("Very convenient location with short travel time")
      } else if (match.breakdown.locationScore < 50) {
        concerns.push("May require longer travel time to reach you")
      }

      if (match.breakdown.performanceScore >= 85) {
        strengths.push("Outstanding performance history and client reviews")
      }

      if (match.breakdown.availabilityScore < 70) {
        recommendations.push("Consider flexible scheduling to improve availability match")
      }

      return {
        ...match,
        explanation: { strengths, concerns, recommendations }
      }
    })
  }

  /**
   * Helper methods
   */
  private calculateDistance(coord1: any, coord2: any): number {
    // Haversine formula for calculating distance between two points
    const R = 3959 // Earth's radius in miles
    const dLat = this.toRadians(coord2.latitude - coord1.latitude)
    const dLon = this.toRadians(coord2.longitude - coord1.longitude)
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(this.toRadians(coord1.latitude)) * Math.cos(this.toRadians(coord2.latitude)) *
              Math.sin(dLon/2) * Math.sin(dLon/2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI/180)
  }

  private calculateConfidence(scores: number[]): number {
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    const stdDev = Math.sqrt(variance)
    
    // Confidence inversely related to standard deviation
    return Math.max(0.3, Math.min(1.0, (100 - stdDev) / 100))
  }

  private getDayName(dayOfWeek: number): string {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[dayOfWeek] || 'monday'
  }

  private timeSlotsOverlap(slot1: any, slot2: any): boolean {
    const start1 = this.timeToMinutes(slot1.startTime)
    const end1 = this.timeToMinutes(slot1.endTime)
    const start2 = this.timeToMinutes(slot2.startTime)
    const end2 = this.timeToMinutes(slot2.endTime)
    
    return start1 < end2 && start2 < end1
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number)
    return hours * 60 + minutes
  }

  private generateSearchReasons(request: MatchingRequest, totalCaregivers: number, matches: number): string[] {
    const reasons = []
    
    if (matches === 0) {
      reasons.push("No caregivers available in the specified location and time frame")
    } else if (matches < 3) {
      reasons.push("Limited availability due to specific requirements")
    } else {
      reasons.push("Good selection of qualified caregivers found")
    }
    
    if (totalCaregivers < 5) {
      reasons.push("Consider expanding search radius for more options")
    }
    
    return reasons
  }

  private getDefaultAlgorithm(): MatchingAlgorithm {
    return {
      algorithmId: 'default_v1',
      name: 'Snug & Kisses Matching Algorithm v1.0',
      version: '1.0.0',
      weights: {
        locationProximity: 0.20,
        qualificationMatch: 0.25,
        availabilityAlignment: 0.20,
        experienceLevel: 0.10,
        clientPreferences: 0.10,
        caregiverPerformance: 0.10,
        pricingCompatibility: 0.05,
        specializedSkills: 0.15,
        culturalFit: 0.05,
        languageMatch: 0.05
      },
      filters: {
        maxDistance: 50,
        minRating: 4.0,
        maxResponseTime: 30,
        requiredCertifications: [],
        excludeUnavailable: true
      },
      biasCorrection: {
        genderBias: 0.02,
        ageBias: 0.01,
        experienceBias: 0.03,
        locationBias: 0.02
      }
    }
  }

  /**
   * Record match feedback for machine learning improvement
   */
  async recordMatchFeedback(feedback: MatchFeedback): Promise<void> {
    try {
      await this.auditService.logEvent({
        eventType: 'MATCH_FEEDBACK',
        userEmail: 'system@snugkisses.com',
        resourceType: 'match_feedback',
        resourceId: feedback.matchId,
        timestamp: new Date().toISOString(),
        complianceLogged: true,
        details: `Match feedback recorded with rating ${feedback.rating}`,
        sensitivityLevel: 'LOW'
      })

      // TODO: In production, this would feed into ML training pipeline
      console.log('Match feedback recorded:', feedback)

    } catch (error) {
      console.error('Failed to record match feedback:', error)
      throw new Error('Unable to record match feedback')
    }
  }
}