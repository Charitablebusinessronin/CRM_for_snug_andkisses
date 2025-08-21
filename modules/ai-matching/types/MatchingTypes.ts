/**
 * AI Caregiver Matching System Type Definitions
 * HIPAA-compliant type definitions for AI-powered caregiver matching
 */

// Client Requirements and Preferences
export interface ClientRequirements {
  clientId: string
  location: {
    address: string
    coordinates: {
      latitude: number
      longitude: number
    }
    radius: number // in miles
  }
  careNeeds: {
    primary: CareType[]
    secondary?: CareType[]
    specialized?: SpecializedCare[]
    medicalRequirements?: MedicalRequirement[]
  }
  schedule: {
    startDate: string
    endDate?: string
    frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'as-needed'
    timeSlots: TimeSlot[]
    flexibility: 'strict' | 'flexible' | 'very-flexible'
  }
  preferences: {
    genderPreference?: 'male' | 'female' | 'no-preference'
    languagePreferences: string[]
    experienceLevel: 'entry' | 'intermediate' | 'experienced' | 'expert'
    personalityTraits?: string[]
    culturalConsiderations?: string[]
  }
  budget: {
    hourlyRateRange: {
      min: number
      max: number
    }
    totalBudget?: number
    insuranceCoverage?: InsuranceCoverage
  }
  urgency: 'immediate' | 'within-24h' | 'within-week' | 'flexible'
  specialInstructions?: string
}

// Caregiver Profile and Capabilities
export interface CaregiverProfile {
  caregiverId: string
  personalInfo: {
    firstName: string
    lastName: string
    profileImage?: string
    bio: string
    yearsOfExperience: number
    age?: number
    gender: 'male' | 'female' | 'other'
    languages: string[]
  }
  location: {
    baseLocation: {
      address: string
      coordinates: {
        latitude: number
        longitude: number
      }
    }
    serviceRadius: number // in miles
    transportationMethod: 'own-vehicle' | 'public-transport' | 'client-pickup'
  }
  qualifications: {
    certifications: Certification[]
    education: Education[]
    specialTraining: SpecialTraining[]
    licenses: License[]
  }
  expertise: {
    primarySpecialties: CareType[]
    secondarySkills: CareType[]
    specializedCare: SpecializedCare[]
    medicalCapabilities: MedicalCapability[]
  }
  availability: {
    schedule: AvailabilitySchedule
    blackoutDates: string[]
    maxHoursPerWeek: number
    preferredShiftLength: {
      min: number
      max: number
    }
  }
  pricing: {
    baseHourlyRate: number
    specializedRates: Record<string, number>
    emergencyRate?: number
    minimumBooking: number // hours
  }
  performance: {
    overallRating: number
    totalReviews: number
    completionRate: number
    responseTime: number // minutes
    reliabilityScore: number
    clientSatisfactionScore: number
  }
  preferences: {
    preferredClientTypes: string[]
    workingStyle: WorkingStyle
    communicationStyle: string[]
    unavailableDates: string[]
  }
  status: 'active' | 'inactive' | 'on-leave' | 'busy' | 'available'
}

// Matching Algorithm Configuration
export interface MatchingAlgorithm {
  algorithmId: string
  name: string
  version: string
  weights: {
    locationProximity: number
    qualificationMatch: number
    availabilityAlignment: number
    experienceLevel: number
    clientPreferences: number
    caregiverPerformance: number
    pricingCompatibility: number
    specializedSkills: number
    culturalFit: number
    languageMatch: number
  }
  filters: {
    maxDistance: number
    minRating: number
    maxResponseTime: number
    requiredCertifications: string[]
    excludeUnavailable: boolean
  }
  biasCorrection: {
    genderBias: number
    ageBias: number
    experienceBias: number
    locationBias: number
  }
}

// Match Result and Scoring
export interface MatchResult {
  matchId: string
  clientId: string
  caregiverId: string
  overallScore: number
  confidence: number
  matchedAt: string
  expiresAt: string
  breakdown: {
    locationScore: number
    qualificationScore: number
    availabilityScore: number
    preferenceScore: number
    performanceScore: number
    pricingScore: number
    specializedScore: number
  }
  explanation: {
    strengths: string[]
    concerns: string[]
    recommendations: string[]
  }
  estimatedCost: {
    hourlyRate: number
    totalEstimate: number
    additionalFees?: AdditionalFee[]
  }
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'booked'
}

// Matching Request and Response
export interface MatchingRequest {
  requestId: string
  clientRequirements: ClientRequirements
  algorithmConfig?: Partial<MatchingAlgorithm>
  maxResults: number
  priority: 'standard' | 'high' | 'urgent'
  requestedAt: string
  requestedBy: string
  context?: {
    emergencyContact?: string
    medicalNotes?: string
    previousCaregivers?: string[]
    familyDynamics?: string
  }
}

export interface MatchingResponse {
  requestId: string
  matches: MatchResult[]
  processedAt: string
  processingTimeMs: number
  algorithmUsed: string
  totalCandidatesEvaluated: number
  metadata: {
    searchRadius: number
    availableCaregivers: number
    qualifiedCaregivers: number
    reasons: string[]
  }
}

// Supporting Types
export type CareType = 
  | 'postpartum-care'
  | 'newborn-care'
  | 'lactation-support'
  | 'night-doula'
  | 'baby-care'
  | 'maternal-support'
  | 'breastfeeding-support'
  | 'sleep-training'
  | 'infant-massage'
  | 'postpartum-recovery'

export type SpecializedCare =
  | 'high-risk-pregnancy'
  | 'premature-baby'
  | 'multiples-care'
  | 'c-section-recovery'
  | 'mental-health-support'
  | 'special-needs'
  | 'bereavement-support'

export interface MedicalRequirement {
  type: string
  level: 'basic' | 'intermediate' | 'advanced'
  description: string
  required: boolean
}

export interface MedicalCapability {
  skill: string
  level: 'basic' | 'intermediate' | 'advanced' | 'expert'
  certificationDate: string
  verified: boolean
}

export interface TimeSlot {
  dayOfWeek: number // 0-6, Sunday = 0
  startTime: string // HH:MM format
  endTime: string // HH:MM format
  flexibility: number // minutes
}

export interface AvailabilitySchedule {
  [key: string]: { // Day of week (monday, tuesday, etc.)
    available: boolean
    timeSlots: TimeSlot[]
    notes?: string
  }
}

export interface InsuranceCoverage {
  provider: string
  policyNumber: string
  coverageType: 'full' | 'partial' | 'none'
  copay?: number
  deductible?: number
  maxCoverage?: number
}

export interface Certification {
  name: string
  issuer: string
  number: string
  issueDate: string
  expirationDate: string
  verificationStatus: 'verified' | 'pending' | 'expired'
  attachmentUrl?: string
}

export interface Education {
  institution: string
  degree: string
  field: string
  graduationDate: string
  gpa?: number
}

export interface SpecialTraining {
  name: string
  provider: string
  hours: number
  completionDate: string
  certificate?: string
}

export interface License {
  type: string
  number: string
  state: string
  issueDate: string
  expirationDate: string
  status: 'active' | 'inactive' | 'suspended' | 'expired'
}

export interface WorkingStyle {
  approach: 'hands-on' | 'supportive' | 'educational' | 'collaborative'
  communication: 'frequent' | 'regular' | 'as-needed'
  flexibility: 'high' | 'moderate' | 'low'
  clientInvolvement: 'high' | 'moderate' | 'minimal'
}

export interface AdditionalFee {
  type: string
  amount: number
  description: string
  required: boolean
}

// Machine Learning Model Types
export interface MLModel {
  modelId: string
  name: string
  version: string
  trainingData: {
    samples: number
    lastTrainedAt: string
    accuracy: number
    precision: number
    recall: number
    f1Score: number
  }
  features: string[]
  hyperparameters: Record<string, any>
  status: 'active' | 'training' | 'deprecated'
}

// Feedback and Learning System
export interface MatchFeedback {
  matchId: string
  clientId: string
  caregiverId: string
  rating: number
  feedback: {
    qualityOfCare: number
    punctuality: number
    communication: number
    professionalism: number
    culturalSensitivity: number
    overallSatisfaction: number
  }
  comments?: string
  wouldRecommend: boolean
  improvements: string[]
  submittedAt: string
  verified: boolean
}

// Analytics and Reporting
export interface MatchingAnalytics {
  period: {
    startDate: string
    endDate: string
  }
  metrics: {
    totalRequests: number
    successfulMatches: number
    averageMatchTime: number
    averageScore: number
    clientSatisfaction: number
    caregiverUtilization: number
  }
  trends: {
    demandByRegion: Record<string, number>
    popularServices: Record<string, number>
    seasonalPatterns: Record<string, number>
    pricingTrends: Record<string, number>
  }
  recommendations: string[]
}