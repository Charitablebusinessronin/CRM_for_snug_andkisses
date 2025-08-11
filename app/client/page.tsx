"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Calendar, Heart, Baby, Users, Phone, Mail, MapPin, Clock } from "lucide-react"

export default function ClientPortal() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dueDate: "",
    currentWeek: "",
    serviceType: "",
    location: "",
    urgency: "",
    message: "",
    consentToContact: false,
    privacyPolicyAccepted: false
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      // Submit to both contact API and Zoho Forms lead capture
      const [contactResponse, leadCaptureResponse] = await Promise.all([
        fetch("/api/v1/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }),
        fetch("/api/v1/zoho/forms/lead-capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Single_Line: formData.firstName,
            Single_Line1: formData.lastName,
            Email: formData.email,
            Phone_Number: formData.phone,
            Date: formData.dueDate,
            Number: formData.currentWeek,
            Dropdown: formData.serviceType,
            Single_Line2: formData.location,
            Dropdown2: formData.urgency,
            Multi_Line: formData.message,
            Checkbox: true, // Marketing consent
            Checkbox1: formData.consentToContact, // HIPAA consent
            automation_trigger: "client_portal_submission",
            client_journey_stage: "initial_inquiry",
            zoho_crm_integration: true,
            zoho_campaigns_trigger: true
          })
        })
      ])

      if (contactResponse.ok || leadCaptureResponse.ok) {
        setSubmitStatus("success")
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          dueDate: "",
          currentWeek: "",
          serviceType: "",
          location: "",
          urgency: "",
          message: "",
          consentToContact: false,
          privacyPolicyAccepted: false
        })
      } else {
        throw new Error("Failed to submit service request")
      }
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6FF] to-[#E8E3FF] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-[#3B2352]" />
            <h1 className="text-4xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
              Snug & Kisses
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">Professional Doula & Postpartum Care Services</p>
          <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
            HIPAA Compliant • Licensed & Insured
          </Badge>
        </div>

        {/* Service Request Form */}
        <Card className="border-[#3B2352]/20 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-[#3B2352] to-[#4A2C5A] text-white">
            <CardTitle className="flex items-center gap-2" style={{ fontFamily: "Merriweather, serif" }}>
              <Baby className="h-6 w-6" />
              Request Healthcare Services
            </CardTitle>
            <CardDescription className="text-gray-200">
              Complete this form to request our professional doula and postpartum care services. 
              We'll respond within 24 hours to schedule your consultation.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {submitStatus === "success" && (
              <Alert className="mb-6 border-green-500 bg-green-50">
                <Heart className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  <strong>Thank you!</strong> Your service request has been submitted successfully. 
                  We'll contact you within 24 hours to schedule your consultation.
                </AlertDescription>
              </Alert>
            )}

            {submitStatus === "error" && (
              <Alert className="mb-6 border-red-500 bg-red-50">
                <AlertDescription className="text-red-800">
                  <strong>Error:</strong> {errorMessage}. Please try again or call us directly at (555) 123-4567.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-[#3B2352] font-medium">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    className="border-[#D7C7ED]/50 focus:border-[#3B2352]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-[#3B2352] font-medium">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    className="border-[#D7C7ED]/50 focus:border-[#3B2352]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email" className="text-[#3B2352] font-medium flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-[#D7C7ED]/50 focus:border-[#3B2352]"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-[#3B2352] font-medium flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="border-[#D7C7ED]/50 focus:border-[#3B2352]"
                    required
                  />
                </div>
              </div>

              {/* Pregnancy Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dueDate" className="text-[#3B2352] font-medium flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Due Date
                  </Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange("dueDate", e.target.value)}
                    className="border-[#D7C7ED]/50 focus:border-[#3B2352]"
                  />
                </div>
                <div>
                  <Label htmlFor="currentWeek" className="text-[#3B2352] font-medium">
                    Current Week of Pregnancy
                  </Label>
                  <Input
                    id="currentWeek"
                    type="number"
                    min="1"
                    max="42"
                    value={formData.currentWeek}
                    onChange={(e) => handleInputChange("currentWeek", e.target.value)}
                    className="border-[#D7C7ED]/50 focus:border-[#3B2352]"
                    placeholder="e.g., 32"
                  />
                </div>
              </div>

              {/* Service Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="serviceType" className="text-[#3B2352] font-medium flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Service Type *
                  </Label>
                  <Select value={formData.serviceType} onValueChange={(value) => handleInputChange("serviceType", value)}>
                    <SelectTrigger className="border-[#D7C7ED]/50 focus:border-[#3B2352]">
                      <SelectValue placeholder="Select service needed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postpartum-care">Postpartum Care</SelectItem>
                      <SelectItem value="birth-doula">Birth Doula Services</SelectItem>
                      <SelectItem value="lactation-support">Lactation Support</SelectItem>
                      <SelectItem value="newborn-care">Newborn Care Specialist</SelectItem>
                      <SelectItem value="overnight-care">Overnight Care</SelectItem>
                      <SelectItem value="consultation">Initial Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="urgency" className="text-[#3B2352] font-medium flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Urgency Level
                  </Label>
                  <Select value={formData.urgency} onValueChange={(value) => handleInputChange("urgency", value)}>
                    <SelectTrigger className="border-[#D7C7ED]/50 focus:border-[#3B2352]">
                      <SelectValue placeholder="How soon do you need care?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate (within 24 hours)</SelectItem>
                      <SelectItem value="this-week">This week</SelectItem>
                      <SelectItem value="next-week">Next week</SelectItem>
                      <SelectItem value="this-month">This month</SelectItem>
                      <SelectItem value="planning-ahead">Planning ahead</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-[#3B2352] font-medium flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Location/City
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="border-[#D7C7ED]/50 focus:border-[#3B2352]"
                  placeholder="City, State"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-[#3B2352] font-medium">
                  Additional Information
                </Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="border-[#D7C7ED]/50 focus:border-[#3B2352] min-h-[100px]"
                  placeholder="Tell us about your specific needs, preferences, or any questions you have..."
                />
              </div>

              {/* HIPAA Compliance */}
              <div className="space-y-4 p-4 bg-[#F8F6FF] rounded-lg border border-[#D7C7ED]/50">
                <h3 className="font-semibold text-[#3B2352]">Privacy & Consent (Required)</h3>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="consentToContact"
                    checked={formData.consentToContact}
                    onCheckedChange={(checked) => handleInputChange("consentToContact", checked as boolean)}
                    className="border-[#3B2352] data-[state=checked]:bg-[#3B2352]"
                  />
                  <Label htmlFor="consentToContact" className="text-sm leading-relaxed">
                    I consent to being contacted by Snug & Kisses regarding my healthcare service request. 
                    I understand this may include phone calls, text messages, and emails containing protected health information (PHI).
                  </Label>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="privacyPolicyAccepted"
                    checked={formData.privacyPolicyAccepted}
                    onCheckedChange={(checked) => handleInputChange("privacyPolicyAccepted", checked as boolean)}
                    className="border-[#3B2352] data-[state=checked]:bg-[#3B2352]"
                  />
                  <Label htmlFor="privacyPolicyAccepted" className="text-sm leading-relaxed">
                    I have read and agree to the <a href="/privacy-policy" className="text-[#3B2352] underline">Privacy Policy</a> and 
                    <a href="/hipaa-notice" className="text-[#3B2352] underline ml-1">HIPAA Notice of Privacy Practices</a>.
                  </Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !formData.consentToContact || !formData.privacyPolicyAccepted}
                className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white py-3 text-lg"
              >
                {isSubmitting ? "Submitting Request..." : "Submit Service Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mt-6 border-[#D4AF37]/30">
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-[#3B2352] mb-4">Need Immediate Assistance?</h3>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-[#3B2352]" />
                  <span className="text-lg font-medium">(555) 123-4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-[#3B2352]" />
                  <span>care@snugandkisses.com</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-4">
                Available 24/7 for urgent postpartum and birth support needs
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}