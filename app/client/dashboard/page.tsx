"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ClientQuickActions } from "@/components/client/client-quick-actions"
import Link from "next/link"
import { 
  Calendar, 
  Heart, 
  Baby, 
  Users, 
  Phone, 
  Mail, 
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  CreditCard,
  FileText,
  MessageSquare,
  Home,
  LogOut
} from "lucide-react"

interface ServiceRequest {
  id: string
  type: string
  status: 'pending' | 'approved' | 'in-progress' | 'completed'
  hoursAllocated: number
  hoursUsed: number
  startDate: string
  provider?: {
    name: string
    avatar?: string
  }
}

interface HourTransaction {
  id: string
  date: string
  hours: number
  type: 'used' | 'purchased'
  description: string
  provider?: string
}

interface WorkflowPhase {
  id: number
  name: string
  status: 'completed' | 'current' | 'pending'
  description: string
  dueDate?: string
}

export default function ClientDashboard() {
  const [client, setClient] = useState({
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 123-4567",
    memberSince: "2024-01-15",
    hourBalance: 24.5
  })

  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([
    {
      id: "1",
      type: "Postpartum Care",
      status: "in-progress",
      hoursAllocated: 40,
      hoursUsed: 15.5,
      startDate: "2024-02-01",
      provider: {
        name: "Maria Rodriguez",
        avatar: "/api/placeholder/avatar/1"
      }
    },
    {
      id: "2", 
      type: "Lactation Support",
      status: "completed",
      hoursAllocated: 6,
      hoursUsed: 6,
      startDate: "2024-01-20",
      provider: {
        name: "Jennifer Smith",
        avatar: "/api/placeholder/avatar/2"
      }
    }
  ])

  const [hourTransactions, setHourTransactions] = useState<HourTransaction[]>([
    {
      id: "1",
      date: "2024-02-05",
      hours: -4,
      type: "used",
      description: "Postpartum care session",
      provider: "Maria Rodriguez"
    },
    {
      id: "2", 
      date: "2024-02-01",
      hours: 40,
      type: "purchased",
      description: "Initial hour package purchase"
    },
    {
      id: "3",
      date: "2024-01-25",
      hours: -2,
      type: "used", 
      description: "Lactation consultation",
      provider: "Jennifer Smith"
    }
  ])

  const [workflowPhases, setWorkflowPhases] = useState<WorkflowPhase[]>([
    {
      id: 1,
      name: "Initial Inquiry",
      status: "completed",
      description: "Service request submitted and reviewed"
    },
    {
      id: 2,
      name: "Consultation Scheduled",
      status: "completed", 
      description: "Initial consultation appointment confirmed"
    },
    {
      id: 3,
      name: "Provider Matching",
      status: "completed",
      description: "Matched with qualified care provider"
    },
    {
      id: 4,
      name: "Contract Signing",
      status: "current",
      description: "Review and sign service agreements",
      dueDate: "2024-02-10"
    },
    {
      id: 5,
      name: "Service Delivery",
      status: "pending",
      description: "Begin receiving care services"
    }
  ])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': case 'current': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'approved': return 'bg-purple-100 text-purple-800 border-purple-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const currentPhase = workflowPhases.find(phase => phase.status === 'current')
  const completedPhases = workflowPhases.filter(phase => phase.status === 'completed').length
  const workflowProgress = (completedPhases / workflowPhases.length) * 100

  return (
    // Updated with official Snug & Kisses brand colors
    <div className="min-h-screen bg-gradient-to-br from-[#D7C7ED]/20 via-[#D7C7ED]/10 to-white">
      {/* Warm, Nurturing Navigation Header */}
      <div className="bg-white/95 backdrop-blur border-b border-[#D7C7ED]/30 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Heart className="h-8 w-8 text-[#3B2352]" />
            <div>
              <h1 className="text-2xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                Snug & Kisses
              </h1>
              <p className="text-sm text-[#D7C7ED] font-medium" style={{ fontFamily: "Lato, sans-serif" }}>
                Professional Doula Care
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white transition-all duration-200">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
            <Button variant="outline" className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white transition-all duration-200">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Warm Welcome Header */}
        <div className="text-center mb-8 p-8 bg-white/70 backdrop-blur rounded-2xl border border-[#D7C7ED]/50 shadow-lg">
          <h2 className="text-4xl font-bold text-[#3B2352] mb-4" style={{ fontFamily: "Merriweather, serif" }}>
            Welcome back, {client.name}
          </h2>
          <p className="text-xl text-[#3B2352] font-medium" style={{ fontFamily: "Lato, sans-serif" }}>
            Your personalized care journey
          </p>
          <p className="text-sm text-gray-600 mt-2" style={{ fontFamily: "Dancing Script, cursive", fontSize: "16px" }}>
            "We're here to support you with gentle, professional care every step of the way"
          </p>
        </div>

        {/* Quick Actions Section */}
        <div className="mb-8">
          <ClientQuickActions 
            clientId="demo_client_123"
            workflowPhase={currentPhase?.id || 4}
            hasActiveServices={serviceRequests.some(req => req.status === 'in-progress')}
            upcomingAppointments={2}
            unreadMessages={3}
            connectionStatus="connected"
          />
        </div>

        {/* Overview Cards with Official Brand Colors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#D7C7ED]/10 to-[#D7C7ED]/5 border-[#D7C7ED]/30 hover:shadow-xl hover:border-[#3B2352]/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#3B2352] font-medium mb-1" style={{ fontFamily: "Nunito Sans, sans-serif" }}>Hour Balance</p>
                  <p className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                    {client.hourBalance}
                  </p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: "Lato, sans-serif" }}>hours remaining</p>
                </div>
                <div className="p-3 bg-[#D4AF37]/10 rounded-full">
                  <Clock className="h-8 w-8 text-[#D4AF37]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#D7C7ED]/10 to-[#D7C7ED]/5 border-[#D7C7ED]/30 hover:shadow-xl hover:border-[#3B2352]/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#3B2352] font-medium mb-1" style={{ fontFamily: "Nunito Sans, sans-serif" }}>Active Services</p>
                  <p className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                    {serviceRequests.filter(req => req.status === 'in-progress').length}
                  </p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: "Lato, sans-serif" }}>ongoing care</p>
                </div>
                <div className="p-3 bg-[#D4AF37]/10 rounded-full">
                  <Baby className="h-8 w-8 text-[#D4AF37]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#D7C7ED]/10 to-[#D7C7ED]/5 border-[#D7C7ED]/30 hover:shadow-xl hover:border-[#3B2352]/30 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#3B2352] font-medium mb-1" style={{ fontFamily: "Nunito Sans, sans-serif" }}>Current Phase</p>
                  <p className="text-lg font-semibold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                    {currentPhase?.name}
                  </p>
                  <p className="text-xs text-gray-500" style={{ fontFamily: "Lato, sans-serif" }}>{Math.round(workflowProgress)}% complete</p>
                </div>
                <div className="p-3 bg-[#D4AF37]/10 rounded-full">
                  <CheckCircle className="h-8 w-8 text-[#D4AF37]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="services" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white/70 backdrop-blur border border-[#D7C7ED]/30 rounded-xl p-1">
            <TabsTrigger value="services" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200" style={{ fontFamily: "Nunito Sans, sans-serif" }}>Services</TabsTrigger>
            <TabsTrigger value="hours" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200" style={{ fontFamily: "Nunito Sans, sans-serif" }}>Hours</TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200" style={{ fontFamily: "Nunito Sans, sans-serif" }}>Progress</TabsTrigger>
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200" style={{ fontFamily: "Nunito Sans, sans-serif" }}>Profile</TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white data-[state=active]:shadow-sm rounded-lg transition-all duration-200" style={{ fontFamily: "Nunito Sans, sans-serif" }}>Support</TabsTrigger>
          </TabsList>

          {/* Services Tab */}
          <TabsContent value="services">
            <Card className="border-[#D7C7ED]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                  <Users className="h-5 w-5" />
                  My Services
                </CardTitle>
                <CardDescription style={{ fontFamily: "Lato, sans-serif" }}>
                  Track your active and completed service requests
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {serviceRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                            {request.type}
                          </h3>
                          <p className="text-sm text-gray-600">Started {new Date(request.startDate).toLocaleDateString()}</p>
                        </div>
                        <Badge className={getStatusColor(request.status)}>
                          {request.status}
                        </Badge>
                      </div>
                      
                      {request.provider && (
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={request.provider.avatar} />
                            <AvatarFallback>{request.provider.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{request.provider.name}</span>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Hours Used</span>
                          <span>{request.hoursUsed} / {request.hoursAllocated}</span>
                        </div>
                        <Progress 
                          value={(request.hoursUsed / request.hoursAllocated) * 100} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Hours Tab */}
          <TabsContent value="hours">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-[#D7C7ED]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                    <Clock className="h-5 w-5" />
                    Hour Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div>
                      <p className="text-4xl font-bold text-[#3B2352]">{client.hourBalance}</p>
                      <p className="text-gray-600">hours remaining</p>
                    </div>
                    <Button className="w-full bg-gradient-to-r from-[#3B2352] to-[#D7C7ED] hover:from-[#3B2352]/90 hover:to-[#D7C7ED]/90 text-white transition-all duration-300" style={{ fontFamily: "Nunito Sans, sans-serif" }}>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Purchase More Hours
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#D7C7ED]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {hourTransactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div>
                          <p className="text-sm font-medium">{transaction.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                            {transaction.provider && ` • ${transaction.provider}`}
                          </p>
                        </div>
                        <div className={`text-sm font-semibold ${transaction.hours > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {transaction.hours > 0 ? '+' : ''}{transaction.hours}h
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress">
            <Card className="border-[#D7C7ED]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                  <CheckCircle className="h-5 w-5" />
                  Service Journey Progress
                </CardTitle>
                <CardDescription style={{ fontFamily: "Lato, sans-serif" }}>
                  Track your progress through our care coordination process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <Progress value={workflowProgress} className="flex-1" />
                    <span className="text-sm font-medium">{Math.round(workflowProgress)}% Complete</span>
                  </div>
                  
                  <div className="space-y-4">
                    {workflowPhases.map((phase, index) => (
                      <div key={phase.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            phase.status === 'completed' ? 'bg-green-100 text-green-600' :
                            phase.status === 'current' ? 'bg-blue-100 text-blue-600' :
                            'bg-gray-100 text-gray-400'
                          }`}>
                            {phase.status === 'completed' ? <CheckCircle className="h-4 w-4" /> :
                             phase.status === 'current' ? <AlertCircle className="h-4 w-4" /> :
                             <span className="text-xs font-semibold">{index + 1}</span>}
                          </div>
                          {index < workflowPhases.length - 1 && (
                            <div className={`w-0.5 h-8 ${
                              phase.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                            }`} />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <h3 className="font-semibold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                            {phase.name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">{phase.description}</p>
                          {phase.dueDate && (
                            <p className="text-xs text-[#D4AF37] mt-2">Due: {new Date(phase.dueDate).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card className="border-[#D7C7ED]/30 bg-white/80 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                  <User className="h-5 w-5" />
                  My Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-[#3B2352] mb-4" style={{ fontFamily: "Merriweather, serif" }}>
                      Personal Information
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm font-medium text-gray-700">Full Name</label>
                        <p className="text-gray-900">{client.name}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Email</label>
                        <p className="text-gray-900">{client.email}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Phone</label>
                        <p className="text-gray-900">{client.phone}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">Member Since</label>
                        <p className="text-gray-900">{new Date(client.memberSince).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#3B2352] mb-4" style={{ fontFamily: "Merriweather, serif" }}>
                      Account Settings
                    </h3>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="h-4 w-4 mr-2" />
                        Download Care Records
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Preferences
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Privacy Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-[#D7C7ED]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                    <MessageSquare className="h-5 w-5" />
                    Get Help
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="outline" className="w-full justify-start">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support: (555) 123-4567
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Mail className="h-4 w-4 mr-2" />
                    Email: care@snugandkisses.com
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Live Chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-[#D7C7ED]/30 bg-white/80 backdrop-blur">
                <CardHeader>
                  <CardTitle className="text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                    Emergency Contact
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                      <h3 className="font-semibold text-red-800 mb-2">24/7 Emergency Line</h3>
                      <p className="text-2xl font-bold text-red-700">(555) 999-HELP</p>
                      <p className="text-sm text-red-600 mt-2">
                        For immediate postpartum or birth support emergencies
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}