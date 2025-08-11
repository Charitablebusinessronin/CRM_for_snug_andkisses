import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email-verification'

interface ClientRegistrationData {
  personalInfo: {
    firstName: string
    lastName: string
    email: string
    phone: string
    dateOfBirth: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
  }
  medicalInfo: {
    dueDate?: string
    currentWeek?: number
    pregnancyType: 'first' | 'second' | 'third_plus' | 'postpartum'
    medicalConditions: string[]
    allergies: string
    currentProvider: string
    hospital: string
    specialNeeds: string
  }
  servicePreferences: {
    primaryService: 'postpartum_care' | 'birth_doula' | 'lactation_support' | 'newborn_care'
    additionalServices: string[]
    providerGender: 'male' | 'female' | 'no_preference'
    languagePreferences: string[]
    availabilityPreferences: string[]
    specialRequirements: string
  }
  emergencyContacts: Array<{
    name: string
    relationship: string
    phone: string
    email: string
    isPartner: boolean
  }>
  insuranceInfo: {
    hasInsurance: boolean
    provider: string
    policyNumber: string
    groupNumber: string
  }
  consentToTreatment: boolean
  hipaaConsent: boolean
  marketingConsent: boolean
  termsAccepted: boolean
}

export async function POST(request: NextRequest) {
  try {
    const registrationData: ClientRegistrationData = await request.json()

    // Validate required fields
    const { personalInfo, consentToTreatment, hipaaConsent, termsAccepted } = registrationData

    if (!personalInfo.firstName || !personalInfo.lastName || !personalInfo.email) {
      return NextResponse.json(
        { error: 'Personal information is required' },
        { status: 400 }
      )
    }

    if (!consentToTreatment || !hipaaConsent || !termsAccepted) {
      return NextResponse.json(
        { error: 'Required consents must be accepted' },
        { status: 400 }
      )
    }

    // Check if email already exists
    // In a real implementation, you would check your database here
    const existingUser = await checkExistingUser(personalInfo.email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      )
    }

    // Generate verification token
    const verificationToken = generateVerificationToken()

    // Create client registration record
    const registrationId = await createClientRegistration({
      ...registrationData,
      verificationToken,
      registrationStatus: 'pending',
      createdAt: new Date().toISOString()
    })

    // Send verification email
    await sendVerificationEmail(personalInfo.email, verificationToken, {
      firstName: personalInfo.firstName,
      lastName: personalInfo.lastName
    })

    // Initialize workflow (Phase 1: Lead Captured)
    await initializeClientWorkflow(registrationId, registrationData.servicePreferences.primaryService)

    // Create audit log entry for HIPAA compliance
    await createAuditLog({
      action: 'CLIENT_REGISTRATION',
      resourceId: registrationId,
      resourceType: 'client_registration',
      userId: null, // Not logged in yet
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      data: {
        email: personalInfo.email,
        primaryService: registrationData.servicePreferences.primaryService,
        hasInsurance: registrationData.insuranceInfo.hasInsurance
      },
      result: 'success'
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      registrationId,
      nextSteps: [
        'Check your email for verification link',
        'Click the verification link to activate your account',
        'Complete your profile setup',
        'Schedule your initial consultation'
      ]
    })

  } catch (error) {
    console.error('Client registration error:', error)

    // Create audit log for failed registration
    await createAuditLog({
      action: 'CLIENT_REGISTRATION_FAILED',
      resourceId: 'unknown',
      resourceType: 'client_registration',
      userId: null,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      result: 'error'
    })

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    )
  }
}

// Helper functions (these would connect to your actual database)
async function checkExistingUser(email: string) {
  // Mock implementation - replace with actual database query
  return null
}

async function createClientRegistration(data: any) {
  // Mock implementation - replace with actual database insertion
  const registrationId = `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  
  // In a real implementation, you would save to database:
  /*
  const registration = await db.clientRegistrations.create({
    data: {
      id: registrationId,
      email: data.personalInfo.email,
      first_name: data.personalInfo.firstName,
      last_name: data.personalInfo.lastName,
      phone: data.personalInfo.phone,
      date_of_birth: data.personalInfo.dateOfBirth,
      address: data.personalInfo.address,
      medical_info: data.medicalInfo,
      service_preferences: data.servicePreferences,
      emergency_contacts: data.emergencyContacts,
      insurance_info: data.insuranceInfo,
      consent_to_treatment: data.consentToTreatment,
      hipaa_consent: data.hipaaConsent,
      marketing_consent: data.marketingConsent,
      terms_accepted: data.termsAccepted,
      verification_token: data.verificationToken,
      registration_status: data.registrationStatus,
      created_at: data.createdAt
    }
  })
  */
  
  return registrationId
}

async function initializeClientWorkflow(registrationId: string, primaryService: string) {
  // Mock implementation - replace with actual workflow initialization
  const workflowData = {
    registrationId,
    primaryService,
    currentPhase: 1,
    status: 'active',
    startedAt: new Date().toISOString()
  }
  
  // Trigger Phase 1 actions: send welcome email, create CRM lead, notify team
  await executeWorkflowPhase(workflowData, 1)
  
  return workflowData
}

async function executeWorkflowPhase(workflowData: any, phase: number) {
  // Mock implementation - replace with actual workflow execution
  switch (phase) {
    case 1: // Lead Captured
      // Send welcome email
      // Create CRM lead
      // Notify team
      break
    default:
      break
  }
}

async function createAuditLog(logData: any) {
  // Mock implementation - replace with actual audit log creation
  console.log('Audit Log:', logData)
  
  // In a real implementation:
  /*
  await db.auditLogs.create({
    data: logData
  })
  */
}