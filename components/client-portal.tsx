"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Calendar, Clock, DollarSign, Heart, MessageSquare, Star, User, Baby, Shield, Phone, Mail, Calendar as CalendarIcon, AlertCircle } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { runQuickAction } from "@/lib/actions"
import UnifiedActionButton from "@/components/UnifiedActionButton"
import { useRouter } from "next/navigation"

const USE_UNIFIED = process.env.NEXT_PUBLIC_USE_UNIFIED_BUTTONS === 'true'

function ActionBtn({ title, onClick, variant }: { title: string; onClick?: () => void; variant?: 'primary' | 'secondary' }) {
  return (
    <UnifiedActionButton
      title={title}
      onClick={onClick || (() => {})}
      variant={variant || 'primary'}
    />
  )
}

interface ClientData {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  serviceHours: {
    total: number
    used: number
    remaining: number
  }
  currentDoula?: {
    id: string
    name: string
    specialization: string
    rating: number
    reviewCount: number
    nextVisit?: string
  }
  recentActivities: Array<{
    id: string
    date: string
    type: string
    duration: string
    notes: string
  }>
  upcomingAppointments: Array<{
    id: string
    date: string
    time: string
    doula: string
    type: string
  }>
  messages: Array<{
    id: string
    from: string
    message: string
    timestamp: string
    unread: boolean
  }>
}

export function ClientPortal() {
  const [clientData, setClientData] = useState<ClientData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClientData()
  }, [])

  const fetchClientData = async () => {
    try {
      // ADD PROPER SESSION HANDLING
      const response = await fetch('/api/v1/client/dashboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Ensure cookies are sent
      })
      
      console.log('Dashboard API response status:', response.status)
      
      if (response.status === 401) {
        // Redirect to login if not authenticated
        setError('Please log in to access your dashboard')
        return
      }
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Failed to fetch client data: ${response.status}`)
      }
      
      const data = await response.json()
      console.log('Dashboard data received:', data)
      setClientData(data.client)
    } catch (err) {
      console.error('Client dashboard error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async (message: string) => {
    // Try unified quick action first
    try {
      const res = await runQuickAction<any>({ action: 'messageTeam', params: { message } })
      if (res.ok) {
        toast({ title: 'Message Sent', description: 'Your message has been delivered to the care team.' })
        fetchClientData()
        return (res.json as any)?.data
      }
    } catch {}

    // Fallback to v1 endpoint
    try {
      const response = await fetch('/api/v1/client/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })
      if (response.ok) {
        toast({ title: 'Message Sent', description: 'Your message has been delivered to the care team.' })
        fetchClientData() // Refresh data
        return await response.json()
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      toast({ title: 'Error', description: 'Failed to send message.' })
    }
  }

  const scheduleAppointment = async (doulaId: string, datetime: string, type: string) => {
    // Try unified quick action first
    try {
      const res = await runQuickAction<any>({ action: 'create-appointment', params: { doulaId, datetime, type } })
      if (res.ok) {
        const data: any = (res.json as any)?.data
        const url = data?.bookingUrl || data?.appointmentUrl
        if (url) {
          try { window.open(url, '_blank', 'noopener,noreferrer') } catch {}
        }
        toast({ title: 'Appointment Requested', description: 'We will confirm your appointment shortly.' })
        fetchClientData()
        return data
      }
    } catch {}

    // Fallback to v1 endpoint
    try {
      const response = await fetch('/api/v1/client/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doulaId, datetime, type })
      })
      if (response.ok) {
        toast({ title: 'Appointment Requested', description: 'We will confirm your appointment shortly.' })
        fetchClientData() // Refresh data
        return await response.json()
      }
    } catch (err) {
      console.error('Failed to schedule appointment:', err)
      toast({ title: 'Error', description: 'Failed to schedule appointment.' })
    }
  }

  if (loading) {
    return <div className="p-6 text-center">Loading your dashboard...</div>
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!clientData) {
    return <div className="p-6 text-center">No client data available</div>
  }

  const nextAppointment = clientData.upcomingAppointments[0]
  const unreadMessageCount = clientData.messages.filter(m => m.unread).length

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-[#3B2352]/20 bg-gradient-to-r from-[#3B2352] to-[#3B2352]/90 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "Merriweather, serif" }}>
            <Heart className="h-6 w-6 text-[#D4AF37]" />
            Welcome, {clientData.firstName}!
          </CardTitle>
          <CardDescription className="text-white/80" style={{ fontFamily: "Lato, sans-serif" }}>
            {nextAppointment 
              ? `Your next appointment is ${nextAppointment.date} at ${nextAppointment.time} with ${nextAppointment.doula}`
              : "No upcoming appointments scheduled"
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Service Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">{clientData.serviceHours.remaining}</div>
            <div className="text-sm text-gray-600">Hours Remaining</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">{clientData.serviceHours.used}</div>
            <div className="text-sm text-gray-600">Sessions Used</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">{clientData.currentDoula?.rating || 'N/A'}</div>
            <div className="text-sm text-gray-600">Doula Rating</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">{unreadMessageCount}</div>
            <div className="text-sm text-gray-600">New Messages</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-[#D7C7ED]/20">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="doulas" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            My Doulas
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Billing
          </TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Support
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Current Doula */}
          {clientData.currentDoula ? (
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Your Assigned Doula</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-[#D7C7ED] text-[#3B2352]">
                      {clientData.currentDoula.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#3B2352]">{clientData.currentDoula.name}</h3>
                    <p className="text-gray-600">{clientData.currentDoula.specialization}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 text-[#D4AF37] fill-current" />
                      <span className="text-sm">{clientData.currentDoula.rating}/5 ({clientData.currentDoula.reviewCount} reviews)</span>
                    </div>
                  </div>
                  <div className="text-right space-y-2">
                    {USE_UNIFIED ? (
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <ActionBtn
                          title="Message"
                          onClick={() => sendMessage(`Hello ${clientData.currentDoula?.name}, I'd like to schedule a consultation.`)}
                          variant="secondary"
                        />
                      </div>
                    ) : (
                      <Button 
                        variant="outline" 
                        className="border-[#3B2352] text-[#3B2352] block w-full"
                        onClick={() => sendMessage(`Hello ${clientData.currentDoula?.name}, I'd like to schedule a consultation.`)}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="border-[#3B2352] text-[#3B2352] block w-full"
                      onClick={() => scheduleAppointment(clientData.currentDoula!.id, new Date().toISOString(), 'consultation')}
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      Schedule
                    </Button>
                    {clientData.currentDoula.nextVisit && (
                      <div className="text-sm text-gray-600">Next visit: {clientData.currentDoula.nextVisit}</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle style={{ fontFamily: "Merriweather, serif" }}>No Doula Assigned</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">You don't have an assigned doula yet. Browse available doulas and make a selection.</p>
                <Button className="bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">
                  Browse Available Doulas
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Service Progress */}
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Service Progress</CardTitle>
              <CardDescription>Your care journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Hours Used</span>
                  <span>{clientData.serviceHours.used} of {clientData.serviceHours.total} hours</span>
                </div>
                <Progress value={(clientData.serviceHours.used / clientData.serviceHours.total) * 100} className="h-2" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="text-center p-4 bg-[#D7C7ED]/10 rounded-lg">
                  <Baby className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
                  <div className="font-semibold">Newborn Care</div>
                  <div className="text-sm text-gray-600">8 sessions</div>
                </div>
                <div className="text-center p-4 bg-[#D7C7ED]/10 rounded-lg">
                  <Heart className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
                  <div className="font-semibold">Emotional Support</div>
                  <div className="text-sm text-gray-600">Ongoing</div>
                </div>
                <div className="text-center p-4 bg-[#D7C7ED]/10 rounded-lg">
                  <Shield className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
                  <div className="font-semibold">Family Guidance</div>
                  <div className="text-sm text-gray-600">Weekly check-ins</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {clientData.recentActivities.length > 0 ? (
                <div className="space-y-4">
                  {clientData.recentActivities.map((item) => (
                    <div key={item.id} className="flex items-start gap-4 p-3 border border-[#D7C7ED]/50 rounded-lg">
                      <div className="w-2 h-2 bg-[#3B2352] rounded-full mt-2" />
                      <div className="flex-1">
                        <div className="font-medium">{item.type}</div>
                        <div className="text-sm text-gray-600">
                          {item.date} • {item.duration}
                        </div>
                        <div className="text-sm text-gray-700 mt-1">{item.notes}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent activity to display</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="doulas">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Available Doulas</CardTitle>
              <CardDescription>Browse and select your preferred doula</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Browse our certified doulas and find the perfect match for your needs.</p>
                <Button className="bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">
                  Browse Available Doulas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Schedule Management</CardTitle>
              <CardDescription>View and manage your appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {clientData.upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {clientData.upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{appointment.type}</h4>
                          <p className="text-sm text-gray-600">With {appointment.doula}</p>
                          <p className="text-sm text-gray-600">{appointment.date} at {appointment.time}</p>
                        </div>
                        <div className="space-x-2">
                          <Button variant="outline" size="sm">Reschedule</Button>
                          <Button variant="outline" size="sm">Cancel</Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">No upcoming appointments scheduled.</p>
                  {USE_UNIFIED ? (
                    <div className="flex items-center justify-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      <ActionBtn
                        title="Schedule Appointment"
                        onClick={() => {}}
                        variant="primary"
                      />
                    </div>
                  ) : (
                    <Button className="bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">
                      Schedule Appointment
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Billing & Payments</CardTitle>
              <CardDescription>Manage your service hours and payments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Service Package Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-[#3B2352]">{clientData.serviceHours.total}</div>
                      <div className="text-sm text-gray-600">Total Hours</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#3B2352]">{clientData.serviceHours.used}</div>
                      <div className="text-sm text-gray-600">Used</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-[#3B2352]">{clientData.serviceHours.remaining}</div>
                      <div className="text-sm text-gray-600">Remaining</div>
                    </div>
                  </div>
                </Card>
                <div className="flex gap-2">
                  <Button className="bg-[#3B2352] hover:bg-[#3B2352]/90 text-white flex-1">
                    View Invoice History
                  </Button>
                  <Button variant="outline" className="border-[#3B2352] text-[#3B2352] flex-1">
                    Purchase Additional Hours
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="support">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Support & Resources</CardTitle>
              <CardDescription>Get help and access resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Card className="p-4">
                  <h4 className="font-medium mb-2">Emergency Contact</h4>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4" />
                    <span>24/7 Support: (555) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Mail className="h-4 w-4" />
                    <span>support@snugandkisses.com</span>
                  </div>
                </Card>
                {USE_UNIFIED ? (
                  <div className="w-full flex items-center justify-start gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <ActionBtn
                      title="Contact Support Team"
                      onClick={() => sendMessage('I need support with my current care plan.')}
                      variant="primary"
                    />
                  </div>
                ) : (
                  <Button 
                    className="w-full justify-start bg-[#3B2352] hover:bg-[#3B2352]/90 text-white"
                    onClick={() => sendMessage('I need support with my current care plan.')}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contact Support Team
                  </Button>
                )}
                {USE_UNIFIED ? (
                  <div className="w-full flex items-center justify-start gap-2">
                    <Phone className="h-4 w-4" />
                    <ActionBtn
                      title="Schedule Support Call"
                      onClick={() => scheduleAppointment('support', new Date().toISOString(), 'support_call')}
                      variant="secondary"
                    />
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full justify-start border-[#3B2352] text-[#3B2352]"
                    onClick={() => scheduleAppointment('support', new Date().toISOString(), 'support_call')}
                  >
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Schedule Support Call
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start border-[#3B2352] text-[#3B2352]">
                  <Heart className="h-4 w-4 mr-2" />
                  Access Resource Library
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
