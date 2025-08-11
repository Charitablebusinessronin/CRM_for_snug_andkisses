"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Baby,
  Heart,
  Users,
  CheckCircle,
  AlertTriangle
} from "lucide-react"
import { format } from "date-fns"

interface ServiceRequestData {
  serviceType: string
  urgency: string
  preferredDate: Date | undefined
  preferredTime: string
  location: string
  hours: number
  specialRequirements: string
  budget: string
}

export function ServiceRequestWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<ServiceRequestData>({
    serviceType: "",
    urgency: "",
    preferredDate: undefined,
    preferredTime: "",
    location: "",
    hours: 0,
    specialRequirements: "",
    budget: ""
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const [requestId, setRequestId] = useState<string>('')

  const totalSteps = 4
  const progress = (currentStep / totalSteps) * 100

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

  const handleInputChange = (field: keyof ServiceRequestData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/client/service-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      const result = await response.json()
      
      if (response.ok) {
        setSubmitStatus('success')
        setRequestId(result.serviceRequest.id)
        // Auto-redirect after showing success message
        setTimeout(() => {
          window.location.href = '/client/dashboard'
        }, 3000)
      } else {
        setError(result.error || 'Failed to submit service request')
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Failed to submit service request:', error)
      setError('An unexpected error occurred. Please try again.')
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success state
  if (submitStatus === 'success') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="border-green-200 shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-green-800 mb-2">Service Request Submitted!</h2>
              <p className="text-green-700">Your request has been received and is being processed.</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-green-800 mb-2">
                <strong>Request ID:</strong> {requestId}
              </p>
              <p className="text-sm text-green-700">
                We'll contact you within 24 hours to schedule your consultation and match you with the perfect care provider.
              </p>
            </div>
            
            <div className="text-left text-sm text-green-700 mb-6">
              <h4 className="font-semibold mb-2">What happens next?</h4>
              <ul className="space-y-1">
                <li>✓ Care coordinator will review your request</li>
                <li>✓ Initial consultation will be scheduled</li>
                <li>✓ Provider matching process will begin</li>
                <li>✓ You'll receive updates via email and SMS</li>
              </ul>
            </div>
            
            <Button 
              onClick={() => window.location.href = '/client/dashboard'}
              className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-[#3B2352]/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#3B2352] to-[#4A2C5A] text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Baby className="h-6 w-6" />
              Request Care Services
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
          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Step 1: Service Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#3B2352] mb-4">
                  What type of care do you need?
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { value: "postpartum-care", label: "Postpartum Care", icon: Heart, desc: "24/7 newborn and mother support" },
                    { value: "birth-doula", label: "Birth Doula", icon: Baby, desc: "Labor and delivery support" },
                    { value: "lactation-support", label: "Lactation Support", icon: Heart, desc: "Breastfeeding consultation" },
                    { value: "newborn-care", label: "Newborn Care", icon: Baby, desc: "Specialized infant care" },
                    { value: "overnight-care", label: "Overnight Care", icon: Clock, desc: "Night support for rest" },
                    { value: "consultation", label: "Consultation", icon: Users, desc: "Initial assessment meeting" }
                  ].map((service) => (
                    <Card 
                      key={service.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        formData.serviceType === service.value 
                          ? 'border-[#3B2352] bg-[#3B2352]/5' 
                          : 'border-gray-200'
                      }`}
                      onClick={() => handleInputChange('serviceType', service.value)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <service.icon className={`h-6 w-6 mt-1 ${
                            formData.serviceType === service.value 
                              ? 'text-[#3B2352]' 
                              : 'text-gray-400'
                          }`} />
                          <div>
                            <h4 className="font-semibold">{service.label}</h4>
                            <p className="text-sm text-gray-600">{service.desc}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Scheduling */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#3B2352] mb-4">
                  When do you need care?
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="urgency" className="text-[#3B2352] font-medium">
                      Urgency Level
                    </Label>
                    <Select value={formData.urgency} onValueChange={(value) => handleInputChange('urgency', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="How soon?" />
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

                  <div>
                    <Label className="text-[#3B2352] font-medium">
                      Preferred Start Date
                    </Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.preferredDate ? format(formData.preferredDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.preferredDate}
                          onSelect={(date) => handleInputChange('preferredDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label htmlFor="preferredTime" className="text-[#3B2352] font-medium">
                    Preferred Time
                  </Label>
                  <Select value={formData.preferredTime} onValueChange={(value) => handleInputChange('preferredTime', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="What time works best?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="morning">Morning (6AM - 12PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12PM - 6PM)</SelectItem>
                      <SelectItem value="evening">Evening (6PM - 10PM)</SelectItem>
                      <SelectItem value="overnight">Overnight (10PM - 6AM)</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#3B2352] mb-4">
                  Care Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="location" className="text-[#3B2352] font-medium flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="City, State"
                    />
                  </div>

                  <div>
                    <Label htmlFor="hours" className="text-[#3B2352] font-medium flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Estimated Hours Needed
                    </Label>
                    <Input
                      id="hours"
                      type="number"
                      min="1"
                      value={formData.hours || ''}
                      onChange={(e) => handleInputChange('hours', parseInt(e.target.value) || 0)}
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="budget" className="text-[#3B2352] font-medium">
                    Budget Range (Optional)
                  </Label>
                  <Select value={formData.budget} onValueChange={(value) => handleInputChange('budget', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-1000">Under $1,000</SelectItem>
                      <SelectItem value="1000-2500">$1,000 - $2,500</SelectItem>
                      <SelectItem value="2500-5000">$2,500 - $5,000</SelectItem>
                      <SelectItem value="5000-plus">$5,000+</SelectItem>
                      <SelectItem value="discuss">Prefer to discuss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="specialRequirements" className="text-[#3B2352] font-medium">
                    Special Requirements or Preferences
                  </Label>
                  <Textarea
                    id="specialRequirements"
                    value={formData.specialRequirements}
                    onChange={(e) => handleInputChange('specialRequirements', e.target.value)}
                    placeholder="Any specific needs, preferences, or medical considerations..."
                    rows={4}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-[#3B2352] mb-4">
                  Review Your Request
                </h3>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold text-[#3B2352] mb-2">Service Details</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Service Type:</span>
                        <p className="capitalize">{formData.serviceType?.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Urgency:</span>
                        <p className="capitalize">{formData.urgency?.replace('-', ' ')}</p>
                      </div>
                      <div>
                        <span className="font-medium">Preferred Date:</span>
                        <p>{formData.preferredDate ? format(formData.preferredDate, "PPP") : 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Preferred Time:</span>
                        <p className="capitalize">{formData.preferredTime || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>
                        <p>{formData.location || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Estimated Hours:</span>
                        <p>{formData.hours ? `${formData.hours} hours` : 'Not specified'}</p>
                      </div>
                    </div>
                    {formData.specialRequirements && (
                      <div className="mt-4">
                        <span className="font-medium">Special Requirements:</span>
                        <p className="text-sm mt-1">{formData.specialRequirements}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t">
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
                disabled={
                  (currentStep === 1 && !formData.serviceType) ||
                  (currentStep === 2 && !formData.urgency)
                }
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-[#3B2352] hover:bg-[#3B2352]/90"
              >
                {isSubmitting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  'Submit Request'
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}