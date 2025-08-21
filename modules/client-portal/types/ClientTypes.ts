/**
 * Client Portal Types
 * Types for client-facing healthcare portal functionality
 */

import { BaseEntity, HealthcareEntity } from '../../shared/types/CommonTypes'

export interface Client extends HealthcareEntity {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  address: Address
  emergencyContact: EmergencyContact
  insuranceInfo?: InsuranceInfo
  caregivers: string[] // Caregiver IDs
  serviceHistory: ServiceRecord[]
  preferences: ClientPreferences
  status: ClientStatus
}

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email?: string
}

export interface InsuranceInfo {
  provider: string
  policyNumber: string
  groupNumber?: string
  coverageType: string
  effectiveDate: string
  expirationDate?: string
}

export interface ServiceRecord extends BaseEntity {
  clientId: string
  caregiverId: string
  serviceType: ServiceType
  scheduledDate: string
  duration: number // minutes
  status: ServiceStatus
  notes?: string
  rating?: number
  cost?: number
}

export interface ClientPreferences {
  communicationMethod: 'email' | 'phone' | 'sms' | 'portal'
  languagePreference: string
  timezone: string
  caregiverGender?: 'male' | 'female' | 'no_preference'
  specialRequests?: string
  notifications: NotificationPreferences
}

export interface NotificationPreferences {
  appointmentReminders: boolean
  serviceUpdates: boolean
  billingNotifications: boolean
  healthTips: boolean
  emergencyAlerts: boolean
}

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

export enum ServiceType {
  PERSONAL_CARE = 'personal_care',
  COMPANION_CARE = 'companion_care',
  MEDICATION_MANAGEMENT = 'medication_management',
  MEAL_PREPARATION = 'meal_preparation',
  LIGHT_HOUSEKEEPING = 'light_housekeeping',
  TRANSPORTATION = 'transportation',
  RESPITE_CARE = 'respite_care'
}

export enum ServiceStatus {
  SCHEDULED = 'scheduled',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface AppointmentRequest {
  clientId: string
  serviceType: ServiceType
  preferredDate: string
  preferredTime: string
  duration: number
  specialInstructions?: string
  urgency: 'low' | 'medium' | 'high' | 'emergency'
}

export interface ClientPortalDashboard {
  upcomingAppointments: ServiceRecord[]
  recentServices: ServiceRecord[]
  notifications: ClientNotification[]
  quickActions: QuickAction[]
  healthMetrics?: HealthMetric[]
}

export interface ClientNotification extends BaseEntity {
  clientId: string
  type: 'appointment' | 'service' | 'billing' | 'health' | 'emergency'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  read: boolean
  actionRequired?: boolean
  actionUrl?: string
}

export interface QuickAction {
  id: string
  label: string
  description: string
  icon: string
  url: string
  enabled: boolean
}

export interface HealthMetric {
  type: string
  value: number
  unit: string
  recordedAt: string
  trend?: 'up' | 'down' | 'stable'
  targetRange?: { min: number; max: number }
}