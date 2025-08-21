"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Calendar as CalendarIcon, Clock, MapPin, User, 
  Heart, Baby, CheckCircle, AlertCircle
} from "lucide-react"
import { AppointmentService } from "../services/AppointmentService"
import type { Appointment, AppointmentType, CareProvider } from "../types/ClientTypes"

interface AppointmentBookingProps {
  clientId: string
  onAppointmentBooked: () => void
}

/**
 * Appointment Booking Component - HIPAA Compliant Healthcare Scheduling
 * Allows clients to book postpartum care appointments with available providers
 */
export function AppointmentBooking({ clientId, onAppointmentBooked }: AppointmentBookingProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [appointmentType, setAppointmentType] = useState<string>("")
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [notes, setNotes] = useState<string>("")
  const [availableProviders, setAvailableProviders] = useState<CareProvider[]>([])
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  const appointmentService = new AppointmentService()

  const appointmentTypes: AppointmentType[] = [
    {
      id: 'postpartum-checkup',
      name: 'Postpartum Checkup',
      duration: 60,
      description: 'Comprehensive health assessment for new mothers'
    },
    {
      id: 'lactation-support',
      name: 'Lactation Support',
      duration: 45,
      description: 'Breastfeeding guidance and troubleshooting'
    },
    {
      id: 'newborn-care',
      name: 'Newborn Care Consultation',
      duration: 30,
      description: 'Baby care guidance and support'
    },
    {
      id: 'mental-health',
      name: 'Mental Health Support',
      duration: 50,
      description: 'Postpartum mental health counseling'
    },
    {
      id: 'doula-service',
      name: 'Doula Support',
      duration: 120,
      description: 'Comprehensive postpartum doula assistance'
    }
  ]

  useEffect(() => {
    loadUpcomingAppointments()
  }, [clientId])

  useEffect(() => {
    if (selectedDate && appointmentType) {
      loadAvailableProviders()
      loadAvailableSlots()
    }
  }, [selectedDate, appointmentType])

  const loadUpcomingAppointments = async () => {
    try {
      const appointments = await appointmentService.getClientAppointments(clientId)
      setUpcomingAppointments(appointments)
    } catch (error) {
      console.error('Failed to load appointments:', error)
    }
  }

  const loadAvailableProviders = async () => {
    if (!selectedDate || !appointmentType) return
    
    try {
      const providers = await appointmentService.getAvailableProviders(
        selectedDate.toISOString(),
        appointmentType
      )
      setAvailableProviders(providers)
    } catch (error) {
      console.error('Failed to load providers:', error)
    }
  }

  const loadAvailableSlots = async () => {
    if (!selectedDate || !appointmentType) return
    
    try {
      const slots = await appointmentService.getAvailableTimeSlots(
        selectedDate.toISOString(),
        appointmentType
      )
      setAvailableSlots(slots)
    } catch (error) {
      console.error('Failed to load time slots:', error)
    }
  }

  const handleBookAppointment = async () => {
    if (!selectedDate || !selectedTime || !appointmentType || !selectedProvider) {
      alert('Please fill in all required fields')
      return
    }

    try {
      setLoading(true)
      
      const appointmentData = {
        clientId,
        providerId: selectedProvider,
        appointmentType,
        date: selectedDate.toISOString(),
        time: selectedTime,
        notes: notes.trim(),
        status: 'confirmed' as const
      }

      await appointmentService.bookAppointment(appointmentData)
      
      setBookingSuccess(true)
      onAppointmentBooked()
      
      // Reset form
      setSelectedTime("")
      setAppointmentType("")
      setSelectedProvider("")
      setNotes("")
      
      setTimeout(() => setBookingSuccess(false), 3000)
    } catch (error) {
      console.error('Failed to book appointment:', error)
      alert('Failed to book appointment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentTypeInfo = (typeId: string) => {
    return appointmentTypes.find(type => type.id === typeId)
  }

  const formatAppointmentDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="space-y-6">
      {bookingSuccess && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <p className="text-green-800 font-medium">
                Appointment booked successfully! You'll receive a confirmation email shortly.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Booking Form */}
        <Card className="border-[#3B2352]/20">
          <CardHeader>
            <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
              Book New Appointment
            </CardTitle>
            <CardDescription>
              Schedule your postpartum care appointment with our certified providers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Appointment Type */}
            <div className="space-y-2">
              <Label>Appointment Type</Label>
              <Select value={appointmentType} onValueChange={setAppointmentType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select appointment type" />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.name}</span>
                        <span className="text-xs text-gray-500">
                          {type.duration} min • {type.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0}
                className="rounded-md border"
              />
            </div>

            {/* Time Selection */}
            {availableSlots.length > 0 && (
              <div className="space-y-2">
                <Label>Available Times</Label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(slot)}
                      className={selectedTime === slot ? "bg-[#3B2352] text-white" : ""}
                    >
                      {slot}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Provider Selection */}
            {availableProviders.length > 0 && (
              <div className="space-y-2">
                <Label>Select Provider</Label>
                <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your care provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders.map((provider) => (
                      <SelectItem key={provider.id} value={provider.id}>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">{provider.name}</span>
                            <span className="text-xs text-gray-500">
                              {provider.specialties.join(', ')} • {provider.rating}/5 ★
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2">
              <Label>Additional Notes (Optional)</Label>
              <Textarea
                placeholder="Any specific concerns or requests for your appointment..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleBookAppointment}
              disabled={!selectedDate || !selectedTime || !appointmentType || !selectedProvider || loading}
              className="w-full bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
            >
              {loading ? "Booking..." : "Book Appointment"}
            </Button>
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="border-[#3B2352]/20">
          <CardHeader>
            <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
              Your Upcoming Appointments
            </CardTitle>
            <CardDescription>
              Manage your scheduled postpartum care appointments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingAppointments.length > 0 ? (
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <Heart className="h-5 w-5 text-[#3B2352] mt-1" />
                        <div>
                          <h4 className="font-semibold text-[#3B2352]">
                            {getAppointmentTypeInfo(appointment.type)?.name}
                          </h4>
                          <div className="text-sm text-gray-600 space-y-1">
                            <div className="flex items-center space-x-1">
                              <CalendarIcon className="h-4 w-4" />
                              <span>{formatAppointmentDate(appointment.date)}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{appointment.time}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <User className="h-4 w-4" />
                              <span>{appointment.providerName}</span>
                            </div>
                            {appointment.location && (
                              <div className="flex items-center space-x-1">
                                <MapPin className="h-4 w-4" />
                                <span>{appointment.location}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className={
                          appointment.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : appointment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No upcoming appointments</p>
                <p className="text-sm text-gray-500">Book your first appointment above</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}