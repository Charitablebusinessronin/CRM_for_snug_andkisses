"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Heart,
  User,
  Phone,
  Mail,
  MapPin,
  Baby,
  Shield,
  CreditCard,
  CheckCircle
} from "lucide-react"
import { format } from "date-fns"

interface PersonalInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: Date | undefined
  address: {
    street: string
    city: string
    state: string
    zipCode: string
  }
}

interface MedicalInfo {
  dueDate: Date | undefined
  currentWeek: number | undefined
  pregnancyType: 'first' | 'second' | 'third_plus' | 'postpartum'
  medicalConditions: string[]
  allergies: string
  currentProvider: string
  hospital: string
  specialNeeds: string
}

interface ServicePreferences {
  primaryService: 'postpartum_care' | 'birth_doula' | 'lactation_support' | 'newborn_care'
  additionalServices: string[]
  providerGender: 'male' | 'female' | 'no_preference'
  languagePreferences: string[]
  availabilityPreferences: string[]
  specialRequirements: string
}

interface EmergencyContact {
  name: string
  relationship: string
  phone: string
  email: string
  isPartner: boolean
}

interface InsuranceInfo {
  hasInsurance: boolean
  provider: string
  policyNumber: string
  groupNumber: string
  cardFrontImage?: string
  cardBackImage?: string
}

interface ClientRegistrationData {
  personalInfo: PersonalInfo
  medicalInfo: MedicalInfo
  servicePreferences: ServicePreferences
  emergencyContacts: EmergencyContact[]
  insuranceInfo: InsuranceInfo
  consentToTreatment: boolean
  hipaaConsent: boolean
  marketingConsent: boolean
  termsAccepted: boolean
}

export default function ClientRegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ClientRegistrationData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: undefined,
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: ""
      }
    },
    medicalInfo: {
      dueDate: undefined,
      currentWeek: undefined,
      pregnancyType: 'first',
      medicalConditions: [],
      allergies: "",
      currentProvider: "",
      hospital: "",
      specialNeeds: ""
    },
    servicePreferences: {
      primaryService: 'postpartum_care',
      additionalServices: [],
      providerGender: 'no_preference',
      languagePreferences: [],
      availabilityPreferences: [],
      specialRequirements: ""
    },
    emergencyContacts: [{
      name: "",
      relationship: "",
      phone: "",
      email: "",
      isPartner: false
    }],
    insuranceInfo: {
      hasInsurance: false,
      provider: "",
      policyNumber: "",
      groupNumber: ""
    },
    consentToTreatment: false,
    hipaaConsent: false,
    marketingConsent: false,
    termsAccepted: false
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")

  const totalSteps = 6
  const progress = (currentStep / totalSteps) * 100

  const updateFormData = (section: keyof ClientRegistrationData, data: any) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }))
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/v1/client/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setSubmitStatus("success")
      } else {
        setSubmitStatus("error")
      }
    } catch (error) {
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep data={formData.personalInfo} onChange={(data) => updateFormData('personalInfo', data)} />
      case 2:
        return <MedicalInfoStep data={formData.medicalInfo} onChange={(data) => updateFormData('medicalInfo', data)} />
      case 3:
        return <ServicePreferencesStep data={formData.servicePreferences} onChange={(data) => updateFormData('servicePreferences', data)} />
      case 4:
        return <EmergencyContactsStep data={formData.emergencyContacts} onChange={(data) => updateFormData('emergencyContacts', data)} />
      case 5:
        return <InsuranceStep data={formData.insuranceInfo} onChange={(data) => updateFormData('insuranceInfo', data)} />
      case 6:
        return <ReviewStep data={formData} onChange={updateFormData} />
      default:
        return null
    }
  }

  if (submitStatus === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6FF] to-[#E8E3FF] flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="text-2xl text-[#3B2352]">Registration Complete!</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p>Thank you for registering with Snug & Kisses. We've sent a verification email to {formData.personalInfo.email}.</p>
            <p className="text-sm text-gray-600">Please check your email and click the verification link to activate your account.</p>
            <Button 
              onClick={() => window.location.href = '/auth/signin'} 
              className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90"
            >
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6FF] to-[#E8E3FF] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-[#3B2352]" />
            <h1 className="text-4xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
              Join Snug & Kisses
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Complete your registration to access personalized care</p>
        </div>

        <Card className="border-[#3B2352]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#3B2352] to-[#4A2C5A] text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <User className="h-6 w-6" />
                Client Registration
              </CardTitle>
              <Badge variant="secondary" className="bg-white/20 text-white">
                Step {currentStep} of {totalSteps}
              </Badge>
            </div>
            <div className="mt-4">
              <Progress value={progress} className="h-2 bg-white/20" />
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {renderStepContent()}
            
            {/* Navigation */}
            <div className="flex justify-between pt-6 border-t mt-6">
              <Button 
                variant="outline" 
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              
              {currentStep < totalSteps ? (
                <Button 
                  onClick={handleNext}
                  className="bg-[#3B2352] hover:bg-[#3B2352]/90"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.consentToTreatment || !formData.hipaaConsent || !formData.termsAccepted}
                  className="bg-[#3B2352] hover:bg-[#3B2352]/90"
                >
                  {isSubmitting ? "Submitting..." : "Complete Registration"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Step Components
function PersonalInfoStep({ data, onChange }: { data: PersonalInfo, onChange: (data: PersonalInfo) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#3B2352] mb-4">Personal Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={data.firstName}
              onChange={(e) => onChange({...data, firstName: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={data.lastName}
              onChange={(e) => onChange({...data, lastName: e.target.value})}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => onChange({...data, email: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={data.phone}
              onChange={(e) => onChange({...data, phone: e.target.value})}
              required
            />
          </div>
        </div>

        <div>
          <Label>Date of Birth *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {data.dateOfBirth ? format(data.dateOfBirth, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={data.dateOfBirth}
                onSelect={(date) => onChange({...data, dateOfBirth: date})}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-[#3B2352]">Address</h4>
          <div>
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={data.address.street}
              onChange={(e) => onChange({
                ...data, 
                address: {...data.address, street: e.target.value}
              })}
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                value={data.address.city}
                onChange={(e) => onChange({
                  ...data, 
                  address: {...data.address, city: e.target.value}
                })}
                required
              />
            </div>
            <div>
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                value={data.address.state}
                onChange={(e) => onChange({
                  ...data, 
                  address: {...data.address, state: e.target.value}
                })}
                required
              />
            </div>
            <div>
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                value={data.address.zipCode}
                onChange={(e) => onChange({
                  ...data, 
                  address: {...data.address, zipCode: e.target.value}
                })}
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MedicalInfoStep({ data, onChange }: { data: MedicalInfo, onChange: (data: MedicalInfo) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#3B2352] mb-4">Medical Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {data.dueDate ? format(data.dueDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={data.dueDate}
                  onSelect={(date) => onChange({...data, dueDate: date})}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="currentWeek">Current Week of Pregnancy</Label>
            <Input
              id="currentWeek"
              type="number"
              min="1"
              max="42"
              value={data.currentWeek || ''}
              onChange={(e) => onChange({...data, currentWeek: parseInt(e.target.value) || undefined})}
              placeholder="e.g., 32"
            />
          </div>
        </div>

        <div>
          <Label>Pregnancy Type</Label>
          <Select value={data.pregnancyType} onValueChange={(value: any) => onChange({...data, pregnancyType: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select pregnancy type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first">First Pregnancy</SelectItem>
              <SelectItem value="second">Second Pregnancy</SelectItem>
              <SelectItem value="third_plus">Third+ Pregnancy</SelectItem>
              <SelectItem value="postpartum">Postpartum (Already Delivered)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="currentProvider">Current Healthcare Provider</Label>
          <Input
            id="currentProvider"
            value={data.currentProvider}
            onChange={(e) => onChange({...data, currentProvider: e.target.value})}
            placeholder="Dr. Smith, ABC Women's Health"
          />
        </div>

        <div>
          <Label htmlFor="hospital">Preferred Hospital/Birth Center</Label>
          <Input
            id="hospital"
            value={data.hospital}
            onChange={(e) => onChange({...data, hospital: e.target.value})}
            placeholder="City General Hospital"
          />
        </div>

        <div>
          <Label htmlFor="allergies">Known Allergies</Label>
          <Textarea
            id="allergies"
            value={data.allergies}
            onChange={(e) => onChange({...data, allergies: e.target.value})}
            placeholder="List any known allergies..."
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="specialNeeds">Special Medical Needs or Conditions</Label>
          <Textarea
            id="specialNeeds"
            value={data.specialNeeds}
            onChange={(e) => onChange({...data, specialNeeds: e.target.value})}
            placeholder="Any medical conditions, complications, or special needs..."
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}

function ServicePreferencesStep({ data, onChange }: { data: ServicePreferences, onChange: (data: ServicePreferences) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#3B2352] mb-4">Service Preferences</h3>
        
        <div>
          <Label>Primary Service Needed *</Label>
          <Select value={data.primaryService} onValueChange={(value: any) => onChange({...data, primaryService: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select primary service" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="postpartum_care">Postpartum Care</SelectItem>
              <SelectItem value="birth_doula">Birth Doula Services</SelectItem>
              <SelectItem value="lactation_support">Lactation Support</SelectItem>
              <SelectItem value="newborn_care">Newborn Care Specialist</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Provider Gender Preference</Label>
          <Select value={data.providerGender} onValueChange={(value: any) => onChange({...data, providerGender: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="female">Female Provider</SelectItem>
              <SelectItem value="male">Male Provider</SelectItem>
              <SelectItem value="no_preference">No Preference</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="specialRequirements">Special Requirements or Requests</Label>
          <Textarea
            id="specialRequirements"
            value={data.specialRequirements}
            onChange={(e) => onChange({...data, specialRequirements: e.target.value})}
            placeholder="Any specific requirements, cultural preferences, or special requests..."
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}

function EmergencyContactsStep({ data, onChange }: { data: EmergencyContact[], onChange: (data: EmergencyContact[]) => void }) {
  const updateContact = (index: number, field: keyof EmergencyContact, value: any) => {
    const updated = [...data]
    updated[index] = {...updated[index], [field]: value}
    onChange(updated)
  }

  const addContact = () => {
    onChange([...data, {
      name: "",
      relationship: "",
      phone: "",
      email: "",
      isPartner: false
    }])
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#3B2352] mb-4">Emergency Contacts</h3>
        
        {data.map((contact, index) => (
          <Card key={index} className="p-4 mb-4">
            <h4 className="font-medium mb-4">Contact {index + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={contact.name}
                  onChange={(e) => updateContact(index, 'name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Relationship *</Label>
                <Input
                  value={contact.relationship}
                  onChange={(e) => updateContact(index, 'relationship', e.target.value)}
                  placeholder="Spouse, Partner, Mother, etc."
                  required
                />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  type="tel"
                  value={contact.phone}
                  onChange={(e) => updateContact(index, 'phone', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={contact.email}
                  onChange={(e) => updateContact(index, 'email', e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`partner-${index}`}
                  checked={contact.isPartner}
                  onCheckedChange={(checked) => updateContact(index, 'isPartner', checked)}
                />
                <Label htmlFor={`partner-${index}`}>This is my birth partner</Label>
              </div>
            </div>
          </Card>
        ))}
        
        <Button 
          type="button" 
          variant="outline" 
          onClick={addContact}
          className="w-full"
        >
          Add Another Contact
        </Button>
      </div>
    </div>
  )
}

function InsuranceStep({ data, onChange }: { data: InsuranceInfo, onChange: (data: InsuranceInfo) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#3B2352] mb-4">Insurance Information</h3>
        
        <div className="flex items-center space-x-2 mb-4">
          <Checkbox
            id="hasInsurance"
            checked={data.hasInsurance}
            onCheckedChange={(checked) => onChange({...data, hasInsurance: checked as boolean})}
          />
          <Label htmlFor="hasInsurance">I have health insurance that may cover services</Label>
        </div>

        {data.hasInsurance && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="provider">Insurance Provider *</Label>
              <Input
                id="provider"
                value={data.provider}
                onChange={(e) => onChange({...data, provider: e.target.value})}
                placeholder="Blue Cross Blue Shield, Aetna, etc."
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="policyNumber">Policy Number *</Label>
                <Input
                  id="policyNumber"
                  value={data.policyNumber}
                  onChange={(e) => onChange({...data, policyNumber: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="groupNumber">Group Number</Label>
                <Input
                  id="groupNumber"
                  value={data.groupNumber}
                  onChange={(e) => onChange({...data, groupNumber: e.target.value})}
                />
              </div>
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Please have your insurance card ready. We'll verify coverage and benefits during your initial consultation.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>
    </div>
  )
}

function ReviewStep({ data, onChange }: { data: ClientRegistrationData, onChange: (section: keyof ClientRegistrationData, data: any) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-[#3B2352] mb-4">Review & Consent</h3>
        
        <div className="space-y-4">
          <Card className="p-4">
            <h4 className="font-semibold mb-2">Personal Information</h4>
            <p>{data.personalInfo.firstName} {data.personalInfo.lastName}</p>
            <p>{data.personalInfo.email} • {data.personalInfo.phone}</p>
          </Card>

          <Card className="p-4">
            <h4 className="font-semibold mb-2">Service Preferences</h4>
            <p>Primary Service: {data.servicePreferences.primaryService.replace('_', ' ')}</p>
            <p>Provider Preference: {data.servicePreferences.providerGender.replace('_', ' ')}</p>
          </Card>

          {/* Consent Checkboxes */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-semibold text-[#3B2352]">Required Consents</h4>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="consentToTreatment"
                checked={data.consentToTreatment}
                onCheckedChange={(checked) => onChange('consentToTreatment', checked)}
              />
              <Label htmlFor="consentToTreatment" className="text-sm leading-relaxed">
                <strong>Consent to Treatment:</strong> I consent to receiving healthcare services from Snug & Kisses and understand that this may include personal care, medical guidance, and other healthcare-related services.
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="hipaaConsent"
                checked={data.hipaaConsent}
                onCheckedChange={(checked) => onChange('hipaaConsent', checked)}
              />
              <Label htmlFor="hipaaConsent" className="text-sm leading-relaxed">
                <strong>HIPAA Authorization:</strong> I authorize Snug & Kisses to use and disclose my protected health information for treatment, payment, and healthcare operations as described in the Notice of Privacy Practices.
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="termsAccepted"
                checked={data.termsAccepted}
                onCheckedChange={(checked) => onChange('termsAccepted', checked)}
              />
              <Label htmlFor="termsAccepted" className="text-sm leading-relaxed">
                <strong>Terms of Service:</strong> I have read and agree to the <a href="/terms" className="text-[#3B2352] underline">Terms of Service</a> and <a href="/privacy" className="text-[#3B2352] underline">Privacy Policy</a>.
              </Label>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketingConsent"
                checked={data.marketingConsent}
                onCheckedChange={(checked) => onChange('marketingConsent', checked)}
              />
              <Label htmlFor="marketingConsent" className="text-sm leading-relaxed">
                <strong>Marketing Communications (Optional):</strong> I would like to receive helpful tips, updates, and information about services via email and text messages.
              </Label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}