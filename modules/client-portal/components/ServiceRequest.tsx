"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Heart, Baby, Home, Clock, DollarSign, CheckCircle, 
  AlertCircle, User, Calendar, MapPin, Star
} from "lucide-react"
import { ClientDataService } from "../services/ClientDataService"
import type { ServiceRequestData, ServiceType } from "../types/ClientTypes"

interface ServiceRequestProps {
  clientId: string
  onServiceRequested: () => void
}

/**
 * Service Request Component - HIPAA Compliant Healthcare Service Booking
 * Allows clients to request various postpartum care services
 */
export function ServiceRequest({ clientId, onServiceRequested }: ServiceRequestProps) {
  const [serviceType, setServiceType] = useState<string>("")
  const [urgency, setUrgency] = useState<string>("")
  const [preferredDate, setPreferredDate] = useState<string>("")
  const [preferredTime, setPreferredTime] = useState<string>("")
  const [duration, setDuration] = useState<string>("")
  const [location, setLocation] = useState<string>("home")
  const [address, setAddress] = useState<string>("")
  const [specialRequests, setSpecialRequests] = useState<string>("")
  const [insuranceVerification, setInsuranceVerification] = useState(false)
  const [activeRequests, setActiveRequests] = useState<ServiceRequestData[]>([])
  const [loading, setLoading] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)

  const clientDataService = new ClientDataService()

  const serviceTypes: ServiceType[] = [
    {
      id: 'postpartum-doula',
      name: 'Postpartum Doula Support',
      description: 'Comprehensive newborn and family support',
      duration: '2-8 hours',
      cost: '$35-50/hour',
      category: 'Support Care'
    },
    {
      id: 'lactation-consultant',
      name: 'Lactation Consultation',
      description: 'Breastfeeding support and education',
      duration: '1-2 hours',
      cost: '$75-150/session',
      category: 'Medical Care'
    },
    {
      id: 'postpartum-massage',
      name: 'Postpartum Massage Therapy',
      description: 'Therapeutic massage for recovery',
      duration: '60-90 minutes',
      cost: '$80-120/session',
      category: 'Wellness'
    },
    {
      id: 'meal-preparation',
      name: 'Meal Preparation Service',
      description: 'Nutritious meal planning and preparation',
      duration: '2-4 hours',
      cost: '$40-60/hour',
      category: 'Home Support'
    },
    {
      id: 'night-nanny',
      name: 'Night Nanny Services',
      description: 'Overnight newborn care support',
      duration: '8-12 hours',
      cost: '$25-40/hour',
      category: 'Support Care'
    },
    {
      id: 'mental-health-support',
      name: 'Mental Health Counseling',
      description: 'Postpartum mental health support',
      duration: '45-60 minutes',
      cost: '$100-200/session',
      category: 'Medical Care'
    }
  ]

  const urgencyLevels = [
    { id: 'routine', name: 'Routine', description: 'Within 1-2 weeks' },
    { id: 'preferred', name: 'Preferred', description: 'Within 3-5 days' },
    { id: 'urgent', name: 'Urgent', description: 'Within 24-48 hours' },
    { id: 'emergency', name: 'Emergency', description: 'Immediate assistance needed' }
  ]

  useEffect(() => {
    loadActiveRequests()
  }, [clientId])

  const loadActiveRequests = async () => {
    try {
      const requests = await clientDataService.getActiveServiceRequests()
      setActiveRequests(requests)
    } catch (error) {
      console.error('Failed to load service requests:', error)
    }
  }

  const handleSubmitRequest = async () => {
    if (!serviceType || !urgency || !preferredDate) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const requestData: ServiceRequestData = {
        id: Date.now().toString(),
        clientId,
        serviceType,
        urgency,
        preferredDate,
        preferredTime,
        duration,
        location,
        address: location === 'home' ? address : '',
        specialRequests: specialRequests.trim(),
        insuranceVerification,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        estimatedCost: getServiceTypeInfo(serviceType)?.cost || 'TBD'
      }

      await clientDataService.submitServiceRequest(requestData)
      
      setRequestSuccess(true)
      onServiceRequested()
      
      // Reset form
      setServiceType("")
      setUrgency("")
      setPreferredDate("")
      setPreferredTime("")
      setDuration("")
      setAddress("")
      setSpecialRequests("")
      setInsuranceVerification(false)
      
      setTimeout(() => setRequestSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to submit service request:', error)
      alert('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getServiceTypeInfo = (typeId: string) => {
    return serviceTypes.find(type => type.id === typeId)
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'routine': return 'bg-blue-100 text-blue-800'
      case 'preferred': return 'bg-green-100 text-green-800'
      case 'urgent': return 'bg-yellow-100 text-yellow-800'
      case 'emergency': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {requestSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">
                Service request submitted successfully! We'll contact you within 24 hours.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Request Form */}
        <Card className="border-[#3B2352]/20">
          <CardHeader>
            <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
              Request Care Services
            </CardTitle>
            <CardDescription>
              Request specialized postpartum care services from our certified providers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Service Type */}
            <div className="space-y-2">
              <Label>Service Type *</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service needed" />
                </SelectTrigger>
                <SelectContent>
                  {serviceTypes.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{service.name}</span>
                        <span className="text-xs text-gray-500">
                          {service.duration} • {service.cost} • {service.category}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {serviceType && (
                <div className="p-3 bg-gray-50 rounded-lg text-sm">
                  <p className="text-gray-700">
                    {getServiceTypeInfo(serviceType)?.description}
                  </p>
                </div>
              )}
            </div>

            {/* Urgency Level */}
            <div className="space-y-2">
              <Label>Urgency Level *</Label>
              <Select value={urgency} onValueChange={setUrgency}>
                <SelectTrigger>
                  <SelectValue placeholder="How soon do you need this service?" />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level.id} value={level.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{level.name}</span>
                        <span className="text-xs text-gray-500">{level.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Preferred Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preferred Date *</Label>
                <Input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div className="space-y-2">
                <Label>Preferred Time</Label>
                <Select value={preferredTime} onValueChange={setPreferredTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Time preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (8AM - 12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                    <SelectItem value="evening">Evening (5PM - 9PM)</SelectItem>
                    <SelectItem value="overnight">Overnight (9PM - 8AM)</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-2">
              <Label>Session Duration</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue placeholder="How long do you need the service?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1-2-hours">1-2 hours</SelectItem>
                  <SelectItem value="2-4-hours">2-4 hours</SelectItem>
                  <SelectItem value="4-6-hours">4-6 hours</SelectItem>
                  <SelectItem value="6-8-hours">6-8 hours</SelectItem>
                  <SelectItem value="8-12-hours">8-12 hours (overnight)</SelectItem>
                  <SelectItem value="multiple-sessions">Multiple sessions</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label>Service Location</Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home">In-Home Visit</SelectItem>
                  <SelectItem value="virtual">Virtual/Telehealth</SelectItem>
                  <SelectItem value="clinic">At Provider's Clinic</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address (if home service) */}
            {location === 'home' && (
              <div className="space-y-2">
                <Label>Home Address</Label>
                <Textarea
                  placeholder="Please provide your complete address for home visits..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                />
              </div>
            )}

            {/* Special Requests */}
            <div className="space-y-2">
              <Label>Special Requests or Notes</Label>
              <Textarea
                placeholder="Any specific needs, preferences, or concerns we should know about..."
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </div>

            {/* Insurance Verification */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="insurance"
                checked={insuranceVerification}
                onCheckedChange={setInsuranceVerification}
              />
              <Label htmlFor="insurance" className="text-sm">
                I would like insurance verification assistance
              </Label>
            </div>

            <Button
              onClick={handleSubmitRequest}
              disabled={!serviceType || !urgency || !preferredDate || loading}
              className="w-full bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
            >
              {loading ? "Submitting..." : "Submit Service Request"}
            </Button>
          </CardContent>
        </Card>

        {/* Active Requests */}
        <Card className="border-[#3B2352]/20">
          <CardHeader>
            <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
              Your Service Requests
            </CardTitle>
            <CardDescription>
              Track the status of your submitted service requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeRequests.length > 0 ? (
              <div className="space-y-4">
                {activeRequests.map((request) => (
                  <div key={request.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <Heart className="h-5 w-5 text-[#3B2352] mt-1" />
                        <div>
                          <h4 className="font-semibold text-[#3B2352]">
                            {getServiceTypeInfo(request.serviceType)?.name}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {new Date(request.preferredDate).toLocaleDateString()}
                                {request.preferredTime && ` • ${request.preferredTime}`}
                              </span>
                            </div>
                            {request.location === 'home' && request.address && (
                              <div className="flex items-center space-x-1">
                                <Home className="h-4 w-4" />
                                <span className="truncate">{request.address}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>{request.estimatedCost}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        <Badge
                          variant="secondary"
                          className={getStatusColor(request.status)}
                        >
                          {request.status}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={getUrgencyColor(request.urgency)}
                        >
                          {request.urgency}
                        </Badge>
                      </div>
                    </div>
                    
                    {request.specialRequests && (
                      <div className="text-sm text-gray-600 bg-white p-2 rounded border-l-4 border-[#D7C7ED]">
                        <p className="font-medium">Special Requests:</p>
                        <p>{request.specialRequests}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No active service requests</p>
                <p className="text-sm text-gray-500">Submit your first request above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}