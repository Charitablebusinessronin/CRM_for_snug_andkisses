/**
 * Employee Portal Type Definitions
 * HIPAA-compliant type definitions for employee portal functionality
 */

// Employee Statistics
export interface EmployeeStats {
  employeeId: string
  employeeName: string
  role: string
  activeClients: number
  completedShifts: number
  pendingTasks: number
  careRating: number
  weeklyHours: number
  monthlyVisits: number
  specializations: string[]
}

// Client Information
export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  babyAge: string
  status: 'active' | 'inactive' | 'pending' | 'discharged'
  priority: 'low' | 'medium' | 'high'
  lastVisit: string
  satisfactionRating: number
  emergencyContact: string
  currentServices: ServicePlan[]
  notes?: ClientNote[]
}

// Service Plans
export interface ServicePlan {
  name: string
  description: string
  startDate: string
  frequency: string
  endDate?: string
  status?: 'active' | 'completed' | 'cancelled'
}

// Client Notes
export interface ClientNote {
  id: string
  content: string
  type: 'assessment' | 'intervention' | 'general' | 'concern' | 'progress'
  authorName: string
  createdAt: string
  isPrivate: boolean
  tags?: string[]
}

// Shift Information
export interface Shift {
  id: string
  clientId: string
  clientName: string
  startTime: string
  endTime: string
  date?: string
  location: string
  type: 'postpartum-visit' | 'lactation-support' | 'night-care' | 'emergency' | 'follow-up'
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  notes?: string
  documentation?: ShiftDocumentation
}

// Shift Documentation
export interface ShiftDocumentation {
  assessment: string
  interventions: string[]
  outcomes: string
  recommendations: string
  vitals?: {
    bloodPressure?: string
    temperature?: number
    heartRate?: number
    weight?: number
  }
  medications?: {
    name: string
    dosage: string
    frequency: string
    administered: boolean
  }[]
  followUpRequired: boolean
  nextVisitDate?: string
}

// Task Management
export interface Task {
  id: string
  title: string
  description: string
  clientId?: string
  clientName?: string
  type: 'documentation' | 'follow-up' | 'care-planning' | 'assessment' | 'administrative'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  estimatedDuration: number // in minutes
  completedAt?: string
  completedBy?: string
  completionNotes?: string
}

// Care Assessment
export interface CareAssessment {
  id: string
  clientId: string
  assessmentDate: string
  assessorName: string
  physicalHealth: {
    overallStatus: 'excellent' | 'good' | 'fair' | 'poor'
    incisionHealing?: 'excellent' | 'good' | 'concerning'
    breastfeedingStatus?: 'successful' | 'needs-support' | 'not-breastfeeding'
    painLevel: number // 1-10 scale
    sleepQuality: 'excellent' | 'good' | 'fair' | 'poor'
    energyLevel: 'high' | 'moderate' | 'low' | 'very-low'
  }
  mentalHealth: {
    mood: 'excellent' | 'good' | 'fair' | 'concerning'
    anxietyLevel: number // 1-10 scale
    depressionScreening: 'negative' | 'mild' | 'moderate' | 'severe'
    supportSystem: 'excellent' | 'adequate' | 'limited' | 'poor'
    bonding: 'excellent' | 'good' | 'developing' | 'concerning'
  }
  babyHealth: {
    feedingStatus: 'excellent' | 'good' | 'needs-improvement'
    weightGain: 'on-track' | 'slow' | 'concerning'
    sleepPattern: 'good' | 'irregular' | 'concerning'
    jaundice: 'none' | 'mild' | 'moderate' | 'severe'
    umbilicalCord: 'healing-well' | 'needs-attention'
  }
  recommendations: string[]
  followUpDate: string
  referralsNeeded: string[]
}

// Employee Performance
export interface PerformanceMetrics {
  employeeId: string
  period: {
    startDate: string
    endDate: string
  }
  clientSatisfaction: {
    averageRating: number
    totalReviews: number
    breakdown: {
      5: number
      4: number
      3: number
      2: number
      1: number
    }
  }
  productivity: {
    shiftsCompleted: number
    shiftsScheduled: number
    completionRate: number
    averageVisitDuration: number
  }
  quality: {
    documentationScore: number
    assessmentAccuracy: number
    clientOutcomes: number
  }
  professional: {
    punctualityScore: number
    communicationScore: number
    teamworkScore: number
  }
}

// Availability Management
export interface EmployeeAvailability {
  employeeId: string
  weekStartDate: string
  availability: {
    [key: string]: { // Day of week (monday, tuesday, etc.)
      available: boolean
      shifts: {
        startTime: string
        endTime: string
        maxClients: number
      }[]
    }
  }
  timeOff: {
    startDate: string
    endDate: string
    reason: string
    approved: boolean
  }[]
  preferredClientTypes: string[]
  maxDailyClients: number
  maxWeeklyHours: number
}

// Training and Certification
export interface EmployeeTraining {
  employeeId: string
  certifications: {
    name: string
    issuer: string
    issueDate: string
    expirationDate: string
    status: 'active' | 'expired' | 'pending-renewal'
    certificateNumber: string
  }[]
  trainings: {
    name: string
    provider: string
    completedDate: string
    hours: number
    category: 'required' | 'continuing-education' | 'specialization'
    certificate?: string
  }[]
  requiredTrainings: {
    name: string
    dueDate: string
    priority: 'high' | 'medium' | 'low'
  }[]
}

// Communication
export interface Message {
  id: string
  senderId: string
  senderName: string
  recipientId: string
  subject: string
  content: string
  timestamp: string
  type: 'general' | 'urgent' | 'client-related' | 'administrative'
  read: boolean
  clientId?: string // If message is about a specific client
  attachments?: {
    name: string
    type: string
    size: number
    url: string
  }[]
}

// Care Team
export interface CareTeamMember {
  id: string
  name: string
  role: string
  specializations: string[]
  email: string
  phone: string
  availability: 'available' | 'busy' | 'offline'
  location: string
  rating: number
  activeClients: number
}

// Emergency Protocol
export interface EmergencyContact {
  id: string
  name: string
  role: string
  phone: string
  alternatePhone?: string
  email: string
  priority: number // 1 is highest priority
  availability: '24/7' | 'business-hours' | 'on-call'
  specialties: string[]
}

// Quality Metrics
export interface QualityMetric {
  id: string
  name: string
  description: string
  targetValue: number
  currentValue: number
  unit: string
  trend: 'improving' | 'stable' | 'declining'
  lastUpdated: string
  category: 'client-satisfaction' | 'clinical-outcomes' | 'efficiency' | 'safety'
}