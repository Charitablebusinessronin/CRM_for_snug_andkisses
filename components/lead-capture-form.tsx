"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Baby, Heart, Phone, Mail, Calendar, MapPin, Loader2, CheckCircle } from "lucide-react"

/**
 * Lead Capture Form for Snug & Kisses CRM
 * Phase 1: Integrates with Zoho Forms → CRM → Campaigns workflow
 * HIPAA-compliant postpartum care service lead capture
 */
export function LeadCaptureForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dueDate: '',
    currentWeek: '',
    serviceType: '',
    location: '',
    previousDoula: '',
    heardAbout: '',
    urgency: '',
    notes: '',
    marketingConsent: false,
    hipaaConsent: false
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  // Handle form input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Submit to Zoho Forms API with automatic CRM integration
  const handleSubmitLead = async () => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')
    
    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.hipaaConsent) {
        throw new Error('Please fill in all required fields and accept HIPAA consent')
      }

      // Submit to Zoho Forms integration endpoint
      const response = await fetch('/api/v1/zoho/forms/lead-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // Zoho Forms field mapping
          'Single_Line': formData.firstName,
          'Single_Line1': formData.lastName,
          'Email': formData.email,
          'Phone_Number': formData.phone,
          'Date': formData.dueDate,
          'Number': formData.currentWeek,
          'Dropdown': formData.serviceType,
          'Single_Line2': formData.location,
          'Radio': formData.previousDoula,
          'Dropdown1': formData.heardAbout,
          'Dropdown2': formData.urgency,
          'Multi_Line': formData.notes,
          'Checkbox': formData.marketingConsent,
          'Checkbox1': formData.hipaaConsent,
          // Workflow triggers
          'automation_trigger': 'lead_capture_phase_1',
          'client_journey_stage': 'initial_inquiry',
          'zoho_crm_integration': true,
          'zoho_campaigns_trigger': true
        })
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        setSubmitMessage(`Lead captured successfully! Reference ID: ${result.zoho_form_id}. You'll receive a confirmation email within 5 minutes.`)
        
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dueDate: '',
          currentWeek: '',
          serviceType: '',
          location: '',
          previousDoula: '',
          heardAbout: '',
          urgency: '',
          notes: '',
          marketingConsent: false,
          hipaaConsent: false
        })
      } else {
        throw new Error(result.error || 'Failed to submit lead')
      }
      
    } catch (error) {
      console.error('Error submitting lead:', error)
      setSubmitStatus('error')
      setSubmitMessage(error instanceof Error ? error.message : 'Failed to submit lead. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="border-[#3B2352]/20 max-w-4xl mx-auto">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Baby className="h-6 w-6 text-[#3B2352]" />
          <Heart className="h-5 w-5 text-[#D4AF37]" />
        </div>
        <CardTitle style={{ fontFamily: "Merriweather, serif" }} className="text-2xl text-[#3B2352]">
          Connect with Our Postpartum Care Team
        </CardTitle>
        <CardDescription className="text-lg">
          Get personalized doula support for your postpartum journey. We'll match you with the perfect care provider.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="flex items-center gap-1">
              First Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="firstName"
              placeholder="Your first name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="border-[#D7C7ED] focus:border-[#3B2352]"
            />
          </div>
          <div>
            <Label htmlFor="lastName" className="flex items-center gap-1">
              Last Name <span className="text-red-500">*</span>
            </Label>
            <Input 
              id="lastName"
              placeholder="Your last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="border-[#D7C7ED] focus:border-[#3B2352]"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address <span className="text-red-500">*</span>
            </Label>
            <Input 
              type="email"
              id="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="border-[#D7C7ED] focus:border-[#3B2352]"
            />
          </div>
          <div>
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <Input 
              type="tel"
              id="phone"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="border-[#D7C7ED] focus:border-[#3B2352]"
            />
          </div>
        </div>

        {/* Pregnancy Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dueDate" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Due Date / Birth Date
            </Label>
            <Input 
              type="date"
              id="dueDate"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="border-[#D7C7ED] focus:border-[#3B2352]"
            />
          </div>
          <div>
            <Label htmlFor="currentWeek">Current Week of Pregnancy (if pregnant)</Label>
            <Input 
              type="number"
              id="currentWeek"
              placeholder="e.g., 32"
              min="1"
              max="42"
              value={formData.currentWeek}
              onChange={(e) => handleInputChange('currentWeek', e.target.value)}
              className="border-[#D7C7ED] focus:border-[#3B2352]"
            />
          </div>
        </div>

        {/* Service Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="serviceType">Type of Support Needed</Label>
            <Select value={formData.serviceType} onValueChange={(value) => handleInputChange('serviceType', value)}>
              <SelectTrigger className="border-[#D7C7ED] focus:border-[#3B2352]">
                <SelectValue placeholder="Select service type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postpartum">Postpartum Doula Support</SelectItem>
                <SelectItem value="birth">Birth Doula Support</SelectItem>
                <SelectItem value="both">Both Birth & Postpartum</SelectItem>
                <SelectItem value="overnight">Overnight Care</SelectItem>
                <SelectItem value="consultation">Consultation Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location/City
            </Label>
            <Input 
              id="location"
              placeholder="City, State"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              className="border-[#D7C7ED] focus:border-[#3B2352]"
            />
          </div>
        </div>

        {/* Experience & Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="previousDoula">Have you worked with a doula before?</Label>
            <Select value={formData.previousDoula} onValueChange={(value) => handleInputChange('previousDoula', value)}>
              <SelectTrigger className="border-[#D7C7ED] focus:border-[#3B2352]">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="yes">Yes, with another doula</SelectItem>
                <SelectItem value="no">No, this is my first time</SelectItem>
                <SelectItem value="snug">Yes, with Snug & Kisses before</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="heardAbout">How did you hear about us?</Label>
            <Select value={formData.heardAbout} onValueChange={(value) => handleInputChange('heardAbout', value)}>
              <SelectTrigger className="border-[#D7C7ED] focus:border-[#3B2352]">
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="google">Google Search</SelectItem>
                <SelectItem value="referral">Friend/Family Referral</SelectItem>
                <SelectItem value="doctor">Healthcare Provider</SelectItem>
                <SelectItem value="social">Social Media</SelectItem>
                <SelectItem value="previous">Previous Client</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Urgency & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="urgency">How soon do you need support?</Label>
            <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
              <SelectTrigger className="border-[#D7C7ED] focus:border-[#3B2352]">
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediately (within 24 hours)</SelectItem>
                <SelectItem value="week">Within a week</SelectItem>
                <SelectItem value="month">Within a month</SelectItem>
                <SelectItem value="planning">Just planning ahead</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Additional Notes or Questions</Label>
          <Textarea
            id="notes"
            placeholder="Tell us about your specific needs, preferences, or any questions you have..."
            className="min-h-[100px] border-[#D7C7ED] focus:border-[#3B2352]"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />
        </div>

        {/* Consent Checkboxes */}
        <div className="space-y-4 p-4 bg-[#F8F6FA] rounded-lg">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="marketingConsent"
              checked={formData.marketingConsent}
              onCheckedChange={(checked) => handleInputChange('marketingConsent', checked as boolean)}
              className="border-[#3B2352] data-[state=checked]:bg-[#3B2352]"
            />
            <Label htmlFor="marketingConsent" className="text-sm leading-relaxed">
              I would like to receive helpful tips, updates, and promotional emails about postpartum care services. 
              You can unsubscribe at any time.
            </Label>
          </div>
          
          <div className="flex items-start space-x-3">
            <Checkbox
              id="hipaaConsent"
              checked={formData.hipaaConsent}
              onCheckedChange={(checked) => handleInputChange('hipaaConsent', checked as boolean)}
              className="border-[#3B2352] data-[state=checked]:bg-[#3B2352]"
            />
            <Label htmlFor="hipaaConsent" className="text-sm leading-relaxed">
              <span className="text-red-500">*</span> I understand and consent to the collection of my health information 
              for the purpose of providing doula services. This information will be kept confidential and used only 
              for matching me with appropriate care providers. <span className="font-semibold">Required by HIPAA compliance.</span>
            </Label>
          </div>
        </div>

        {/* Status Messages */}
        {submitStatus === 'success' && (
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
            <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm">{submitMessage}</p>
          </div>
        )}
        
        {submitStatus === 'error' && (
          <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
            <p className="text-sm">{submitMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button 
          className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white py-3 text-lg"
          onClick={handleSubmitLead}
          disabled={isSubmitting || !formData.hipaaConsent}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Submitting to Zoho CRM...
            </>
          ) : (
            <>
              <Heart className="h-5 w-5 mr-2" />
              Start My Postpartum Care Journey
            </>
          )}
        </Button>
        
        <p className="text-center text-sm text-gray-600">
          Your information is secure and HIPAA-compliant. We'll respond within 24 hours.
        </p>
      </CardContent>
    </Card>
  )
}