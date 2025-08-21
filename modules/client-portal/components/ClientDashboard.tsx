"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Calendar, Clock, FileText, Heart, MessageSquare, 
  Phone, User, Baby, AlertCircle, CheckCircle, 
  DollarSign, MapPin, Star
} from "lucide-react"
import { ClientDataService } from "../services/ClientDataService"
import { AppointmentBooking } from "./AppointmentBooking"
import { ServiceRequest } from "./ServiceRequest"
import { HealthRecords } from "./HealthRecords"
import type { ClientProfile, Appointment, ServiceRequestData } from "../types/ClientTypes"

/**
 * Client Portal Dashboard - HIPAA Compliant Healthcare Interface
 * Provides secure access to postpartum care services and health records
 */
export function ClientDashboard() {
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null)
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [activeRequests, setActiveRequests] = useState<ServiceRequestData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const clientDataService = new ClientDataService()

  useEffect(() => {
    loadClientData()
  }, [])

  const loadClientData = async () => {
    try {
      setLoading(true)
      const [profile, appointments, requests] = await Promise.all([
        clientDataService.getClientProfile(),
        clientDataService.getUpcomingAppointments(),
        clientDataService.getActiveServiceRequests()
      ])
      
      setClientProfile(profile)
      setUpcomingAppointments(appointments)
      setActiveRequests(requests)
    } catch (error) {
      console.error('Failed to load client data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getServiceStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 animate-pulse text-[#3B2352] mx-auto mb-4" />
          <p className="text-[#3B2352] font-medium">Loading your care dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Heart className="h-8 w-8 text-[#3B2352]" />
            <div>
              <h1 className="text-2xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                Welcome, {clientProfile?.firstName}
              </h1>
              <p className="text-gray-600">Your postpartum care portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-[#D7C7ED] text-[#3B2352]">
              Care Plan Active
            </Badge>
            <Button
              variant="outline"
              size="sm"
              className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
            >
              <Phone className="h-4 w-4 mr-2" />
              Emergency Contact
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="border-[#D7C7ED]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Next Appointment</p>
                  <p className="text-lg font-bold text-[#3B2352]">
                    {upcomingAppointments[0]?.date || "Not scheduled"}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-[#3B2352]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D7C7ED]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Services</p>
                  <p className="text-lg font-bold text-[#3B2352]">{activeRequests.length}</p>
                </div>
                <Heart className="h-8 w-8 text-[#3B2352]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D7C7ED]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Care Rating</p>
                  <p className="text-lg font-bold text-[#3B2352]">
                    {clientProfile?.careRating || "5.0"}/5.0
                  </p>
                </div>
                <Star className="h-8 w-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D7C7ED]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Baby's Age</p>
                  <p className="text-lg font-bold text-[#3B2352]">
                    {clientProfile?.babyAge || "2 weeks"}
                  </p>
                </div>
                <Baby className="h-8 w-8 text-[#3B2352]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="health">Health Records</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-[#3B2352]/20">
                <CardHeader>
                  <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        type: 'appointment',
                        title: 'Postpartum check completed',
                        time: '2 hours ago',
                        status: 'completed'
                      },
                      {
                        type: 'service',
                        title: 'Lactation support scheduled',
                        time: '1 day ago',
                        status: 'active'
                      },
                      {
                        type: 'message',
                        title: 'New message from care team',
                        time: '2 days ago',
                        status: 'unread'
                      }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                        <div className={`w-3 h-3 rounded-full ${
                          activity.status === 'completed' ? 'bg-green-500' :
                          activity.status === 'active' ? 'bg-blue-500' : 'bg-yellow-500'
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.title}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#3B2352]/20">
                <CardHeader>
                  <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white h-16 flex-col"
                      onClick={() => setActiveTab("appointments")}
                    >
                      <Calendar className="h-6 w-6 mb-1" />
                      Book Appointment
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white h-16 flex-col"
                      onClick={() => setActiveTab("services")}
                    >
                      <Heart className="h-6 w-6 mb-1" />
                      Request Service
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white h-16 flex-col"
                      onClick={() => setActiveTab("messages")}
                    >
                      <MessageSquare className="h-6 w-6 mb-1" />
                      Message Team
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white h-16 flex-col"
                      onClick={() => setActiveTab("health")}
                    >
                      <FileText className="h-6 w-6 mb-1" />
                      View Records
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <AppointmentBooking 
              clientId={clientProfile?.id || ""} 
              onAppointmentBooked={loadClientData}
            />
          </TabsContent>

          <TabsContent value="services">
            <ServiceRequest 
              clientId={clientProfile?.id || ""} 
              onServiceRequested={loadClientData}
            />
          </TabsContent>

          <TabsContent value="health">
            <HealthRecords clientId={clientProfile?.id || ""} />
          </TabsContent>

          <TabsContent value="messages">
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                  Care Team Messages
                </CardTitle>
                <CardDescription>
                  Secure communication with your postpartum care team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 text-[#D7C7ED]" />
                  <h3 className="text-xl font-semibold text-[#3B2352] mb-2">
                    Messaging System
                  </h3>
                  <p className="text-gray-600 mb-4">
                    HIPAA-compliant messaging coming soon
                  </p>
                  <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
                    Coming Soon - Secure Messaging
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}