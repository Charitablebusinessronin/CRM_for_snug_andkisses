/**
 * Emergency Response System Type Definitions
 * HIPAA-compliant type definitions for emergency response and crisis management
 */

// Emergency Incident Types
export interface EmergencyIncident {
  incidentId: string
  clientId: string
  clientName: string
  caregiverId?: string
  caregiverName?: string
  type: EmergencyType
  severity: EmergencySeverity
  status: EmergencyStatus
  priority: 'critical' | 'high' | 'medium' | 'low'
  location: {
    address: string
    coordinates?: {
      latitude: number
      longitude: number
    }
    accessInstructions?: string
  }
  reportedBy: {
    name: string
    role: 'client' | 'caregiver' | 'family' | 'medical-provider' | 'system'
    contactInfo: string
  }
  reportedAt: string
  description: string
  symptoms?: string[]
  vitalSigns?: VitalSigns
  timeline: EmergencyTimeline[]
  response: EmergencyResponse
  outcome?: EmergencyOutcome
  followUp?: FollowUpAction[]
  documentation: EmergencyDocumentation[]
  metadata: {
    callDuration?: number
    responseTime?: number
    arrivalTime?: number
    resolutionTime?: number
  }
}

export type EmergencyType = 
  | 'medical-emergency'
  | 'postpartum-hemorrhage'
  | 'preeclampsia'
  | 'infection'
  | 'mental-health-crisis'
  | 'baby-distress'
  | 'feeding-emergency'
  | 'allergic-reaction'
  | 'fall-injury'
  | 'domestic-violence'
  | 'substance-abuse'
  | 'neglect-concern'
  | 'safety-threat'
  | 'natural-disaster'
  | 'other'

export type EmergencySeverity = 
  | 'life-threatening'
  | 'severe'
  | 'moderate' 
  | 'mild'
  | 'non-urgent'

export type EmergencyStatus = 
  | 'reported'
  | 'acknowledged'
  | 'dispatched'
  | 'on-scene'
  | 'in-progress'
  | 'transported'
  | 'resolved'
  | 'closed'
  | 'cancelled'

// Emergency Response Protocol
export interface EmergencyProtocol {
  protocolId: string
  name: string
  triggerConditions: TriggerCondition[]
  steps: ProtocolStep[]
  responseTimes: {
    acknowledgment: number // seconds
    dispatch: number // seconds
    arrival: number // minutes
  }
  escalationTriggers: EscalationTrigger[]
  resources: ProtocolResource[]
  documentation: DocumentationRequirement[]
  trainingRequired: string[]
  lastUpdated: string
  version: string
}

export interface TriggerCondition {
  condition: string
  severity: EmergencySeverity
  autoTrigger: boolean
  keywords: string[]
}

export interface ProtocolStep {
  stepId: string
  order: number
  title: string
  description: string
  action: ProtocolAction
  timeLimit?: number // minutes
  required: boolean
  skipConditions?: string[]
  alternatives?: string[]
}

export type ProtocolAction = 
  | 'assess-situation'
  | 'call-911'
  | 'notify-contacts'
  | 'dispatch-caregiver'
  | 'provide-instructions'
  | 'document-incident'
  | 'follow-up'
  | 'escalate'

export interface EscalationTrigger {
  condition: string
  timeThreshold?: number // minutes
  severity: EmergencySeverity
  escalateTo: string
  notification: NotificationMethod[]
}

// Emergency Contacts and Resources
export interface EmergencyContact {
  contactId: string
  clientId?: string
  name: string
  relationship: 'primary' | 'secondary' | 'medical' | 'family' | 'friend' | 'professional'
  role?: string
  phoneNumbers: {
    primary: string
    secondary?: string
    work?: string
  }
  email?: string
  address?: string
  availability: ContactAvailability
  languages: string[]
  specialInstructions?: string
  priority: number
  verified: boolean
  lastUpdated: string
}

export interface ContactAvailability {
  schedule: {
    [key: string]: { // Day of week
      available: boolean
      startTime?: string
      endTime?: string
    }
  }
  timeZone: string
  emergencyOnly: boolean
  preferredContactMethod: 'phone' | 'text' | 'email'
}

export interface EmergencyResource {
  resourceId: string
  type: ResourceType
  name: string
  location: {
    address: string
    coordinates: {
      latitude: number
      longitude: number
    }
    serviceRadius: number // miles
  }
  contact: {
    phone: string
    email?: string
    website?: string
  }
  availability: {
    hours: string
    emergency24h: boolean
  }
  services: string[]
  languages: string[]
  insurance: string[]
  verified: boolean
  rating?: number
  lastUpdated: string
}

export type ResourceType = 
  | 'hospital'
  | 'urgent-care'
  | 'mental-health'
  | 'poison-control'
  | 'crisis-hotline'
  | 'domestic-violence'
  | 'lactation-support'
  | 'pediatric-specialist'
  | 'emergency-transport'
  | 'pharmacy'

// Emergency Response Team
export interface ResponseTeamMember {
  memberId: string
  name: string
  role: ResponseRole
  qualifications: string[]
  location: {
    currentAddress?: string
    serviceArea: string[]
  }
  contact: {
    phone: string
    email: string
    alternatePhone?: string
  }
  availability: {
    status: 'available' | 'busy' | 'off-duty' | 'emergency-only'
    schedule: any // Similar to ContactAvailability
    responseTime: number // minutes
  }
  specialties: string[]
  languages: string[]
  equipment: string[]
  certifications: EmergencyCertification[]
  performance: {
    responseTime: number
    completionRate: number
    clientSatisfaction: number
    totalCalls: number
  }
}

export type ResponseRole = 
  | 'dispatcher'
  | 'field-coordinator'
  | 'emergency-caregiver'
  | 'mental-health-specialist'
  | 'medical-liaison'
  | 'family-advocate'
  | 'supervisor'

export interface EmergencyCertification {
  name: string
  issuer: string
  number: string
  issueDate: string
  expirationDate: string
  status: 'active' | 'expired' | 'suspended'
}

// Emergency Communication
export interface EmergencyNotification {
  notificationId: string
  incidentId: string
  recipientId: string
  recipientName: string
  method: NotificationMethod
  status: NotificationStatus
  sentAt: string
  deliveredAt?: string
  readAt?: string
  content: {
    subject: string
    message: string
    priority: 'urgent' | 'high' | 'normal'
  }
  retryAttempts: number
  failureReason?: string
}

export type NotificationMethod = 
  | 'phone-call'
  | 'sms'
  | 'email'
  | 'push-notification'
  | 'pager'
  | 'two-way-radio'

export type NotificationStatus = 
  | 'queued'
  | 'sending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed'
  | 'cancelled'

// Emergency Response Actions
export interface EmergencyResponse {
  responseId: string
  protocolUsed: string
  responders: ResponseTeamMember[]
  actions: ResponseAction[]
  communications: EmergencyNotification[]
  resources: EmergencyResource[]
  timeline: EmergencyTimeline[]
  cost?: ResponseCost
}

export interface ResponseAction {
  actionId: string
  type: ProtocolAction
  performedBy: string
  performedAt: string
  duration?: number // minutes
  status: 'pending' | 'in-progress' | 'completed' | 'failed'
  details: string
  outcome?: string
  complications?: string[]
}

export interface EmergencyTimeline {
  timestamp: string
  event: string
  performedBy: string
  details: string
  severity?: EmergencySeverity
}

// Vital Signs and Medical Data
export interface VitalSigns {
  recordedAt: string
  recordedBy: string
  bloodPressure?: {
    systolic: number
    diastolic: number
    unit: 'mmHg'
  }
  heartRate?: {
    bpm: number
    rhythm: 'regular' | 'irregular'
  }
  temperature?: {
    value: number
    unit: 'F' | 'C'
    location: 'oral' | 'rectal' | 'axillary' | 'temporal'
  }
  respiratoryRate?: {
    rate: number
    quality: 'normal' | 'labored' | 'shallow'
  }
  oxygenSaturation?: {
    percentage: number
    onAir: boolean
  }
  painLevel?: {
    scale: number // 0-10
    location?: string
  }
  consciousness: 'alert' | 'lethargic' | 'stuporous' | 'comatose'
  notes?: string
}

// Emergency Documentation
export interface EmergencyDocumentation {
  documentId: string
  type: 'incident-report' | 'medical-assessment' | 'action-log' | 'communication-log' | 'photos' | 'audio'
  title: string
  content?: string
  attachments?: DocumentAttachment[]
  createdBy: string
  createdAt: string
  verified: boolean
  confidential: boolean
  retention: {
    years: number
    disposition: 'archive' | 'destroy'
  }
}

export interface DocumentAttachment {
  attachmentId: string
  filename: string
  fileType: string
  size: number
  url: string
  description?: string
  encrypted: boolean
}

// Emergency Outcomes and Follow-up
export interface EmergencyOutcome {
  status: 'resolved' | 'ongoing' | 'transferred' | 'deceased'
  disposition: 'home' | 'hospital' | 'urgent-care' | 'mental-health-facility' | 'other'
  condition: 'stable' | 'improved' | 'unchanged' | 'deteriorated'
  diagnosis?: string[]
  treatment: string[]
  medications?: EmergencyMedication[]
  restrictions?: string[]
  followUpRequired: boolean
  followUpDate?: string
  dischargeInstructions?: string
  familyNotified: boolean
  reportingRequired: string[] // Agencies that need to be notified
}

export interface EmergencyMedication {
  name: string
  dosage: string
  frequency: string
  route: string
  startDate: string
  duration?: string
  prescribedBy: string
  indication: string
}

export interface FollowUpAction {
  actionId: string
  type: 'medical-appointment' | 'home-visit' | 'phone-check' | 'lab-work' | 'therapy' | 'case-review'
  scheduledFor: string
  assignedTo: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'overdue'
  priority: 'high' | 'medium' | 'low'
  instructions: string
  outcome?: string
  completedAt?: string
}

// Analytics and Reporting
export interface EmergencyAnalytics {
  period: {
    startDate: string
    endDate: string
  }
  metrics: {
    totalIncidents: number
    averageResponseTime: number
    resolutionRate: number
    escalationRate: number
    falseAlarms: number
    criticalIncidents: number
  }
  breakdown: {
    byType: Record<EmergencyType, number>
    bySeverity: Record<EmergencySeverity, number>
    byTime: Record<string, number>
    byLocation: Record<string, number>
  }
  trends: {
    monthlyIncidents: number[]
    responseTimeImprovement: number
    customerSatisfaction: number
  }
  recommendations: string[]
}

// Real-time Monitoring
export interface MonitoringAlert {
  alertId: string
  clientId: string
  type: 'vital-signs' | 'medication' | 'appointment' | 'check-in' | 'device' | 'behavioral'
  severity: EmergencySeverity
  triggeredAt: string
  condition: string
  value?: any
  threshold?: any
  autoResolved: boolean
  resolvedAt?: string
  falseAlarm: boolean
  escalated: boolean
}

export interface ResponseCost {
  personnel: number
  transportation: number
  medical: number
  equipment: number
  total: number
  billable: boolean
  insuranceClaimed: boolean
}