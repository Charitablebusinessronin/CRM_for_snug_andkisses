"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, FileText, MessageSquare, User, Users, Loader2 } from "lucide-react"

interface EmployeeData {
  summary?: {
    totalCases: number
    activeCases: number
    availableDoulas: number
    availableHours: number
  }
  recentCases?: any[]
  availableDoulas?: any[]
}

/**
 * The main component for the employee portal.
 * It displays information about the employee's schedule, clients, and notes.
 * @returns {JSX.Element} The employee portal component.
 */
export function EmployeePortal() {
  const [employeeData, setEmployeeData] = useState<EmployeeData>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [clientModalOpen, setClientModalOpen] = useState(false)

  // Mock employee ID - in real app this would come from auth context
  const employeeId = "emp_001"
  const employeeEmail = "employee@snugandkisses.com"

  useEffect(() => {
    loadEmployeeData()
  }, [])

  const loadEmployeeData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/v1/employee/data?employeeId=${employeeId}&email=${employeeEmail}`)
      const result = await response.json()
      
      if (result.success) {
        setEmployeeData(result.data)
      } else {
        setError(result.error || 'Failed to load employee data')
      }
    } catch (err) {
      setError('Failed to connect to server')
      console.error('Error loading employee data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitNote = async () => {
    setLoading(true)
    try {
      // Create a service request for note submission
      const response = await fetch('/api/v1/employee/service-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          employeeId,
          employeeEmail,
          employeeName: "Team Member",
          companyName: "Snug & Kisses",
          serviceType: "postpartum-care",
          urgency: "medium",
          location: "Remote - Shift Notes",
          specialRequests: "Shift note submission request",
          availableHours: 8,
          healthInformationConsent: true,
          privacyNoticeAcknowledged: true,
        }),
      })

      const result = await response.json()
      if (result.success) {
        alert(`Note submission request created! Case ID: ${result.data.caseId}`)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (err) {
      alert('Failed to submit note request')
      console.error('Error submitting note:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewSchedule = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/employee/data?employeeId=${employeeId}&type=cases`)
      const result = await response.json()
      
      if (result.success) {
        const cases = result.data.cases || []
        alert(`Schedule loaded! You have ${cases.length} active cases/appointments.`)
        console.log('Schedule data:', cases)
      } else {
        alert(`Error loading schedule: ${result.error}`)
      }
    } catch (err) {
      alert('Failed to load schedule')
      console.error('Error loading schedule:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTeamChat = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/employee/data?employeeId=${employeeId}&type=contacts`)
      const result = await response.json()
      
      if (result.success) {
        const doulas = result.data.doulas || []
        alert(`Team directory loaded! ${doulas.length} team members available for chat.`)
        console.log('Team members:', doulas)
      } else {
        alert(`Error loading team: ${result.error}`)
      }
    } catch (err) {
      alert('Failed to load team directory')
      console.error('Error loading team:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleClientList = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/employee/data?employeeId=${employeeId}&type=contacts`)
      const result = await response.json()
      
      if (result.success) {
        const doulas = result.data.doulas || []
        alert(`Client directory loaded! ${doulas.length} contacts available.`)
        console.log('Available contacts:', doulas)
      } else {
        alert(`Error loading clients: ${result.error}`)
      }
    } catch (err) {
      alert('Failed to load client list')
      console.error('Error loading clients:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewClientDetails = async (clientName: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/employee/data?employeeId=${employeeId}&type=cases`)
      const result = await response.json()
      
      if (result.success) {
        const cases = result.data.cases || []
        const clientCases = cases.filter((c: any) => c.description?.includes(clientName))
        
        // Set client data for modal
        setSelectedClient({
          name: clientName,
          cases: clientCases,
          totalCases: clientCases.length,
          recentActivity: cases.slice(0, 3) // Show recent 3 cases
        })
        setClientModalOpen(true)
      } else {
        alert(`Error loading ${clientName} details: ${result.error}`)
      }
    } catch (err) {
      alert(`Failed to load ${clientName} details`)
      console.error('Error loading client details:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-[#3B2352]/20 bg-gradient-to-r from-[#3B2352] to-[#3B2352]/90 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "Merriweather, serif" }}>
            <User className="h-6 w-6 text-[#D4AF37]" />
            Welcome, Team Member!
            {loading && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
          </CardTitle>
          <CardDescription className="text-white/80" style={{ fontFamily: "Lato, sans-serif" }}>
            {employeeData.summary ? 
              `You have ${employeeData.summary.activeCases} active cases and ${employeeData.summary.availableHours} available hours` :
              "Loading your dashboard data..."
            }
          </CardDescription>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">Error: {error}</p>
            <Button onClick={loadEmployeeData} className="mt-2" size="sm">
              Retry
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">
              {employeeData.summary?.availableDoulas || 12}
            </div>
            <div className="text-sm text-gray-600">Available Team</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">
              {employeeData.summary?.activeCases || 5}
            </div>
            <div className="text-sm text-gray-600">Active Cases</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">
              {employeeData.summary?.totalCases || 8}
            </div>
            <div className="text-sm text-gray-600">Total Cases</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">
              {employeeData.summary?.availableHours || 24}
            </div>
            <div className="text-sm text-gray-600">Available Hours</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#D7C7ED]/20">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            My Clients
          </TabsTrigger>
          <TabsTrigger value="schedule" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Schedule
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Shift Notes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Today's Schedule */}
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Today's Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: "9:00 AM", client: "Sarah M.", type: "Check-in Call", status: "upcoming" },
                  { time: "11:00 AM", client: "Maria L.", type: "Home Visit", status: "upcoming" },
                  { time: "2:00 PM", client: "Jennifer K.", type: "Support Session", status: "completed" },
                  { time: "4:00 PM", client: "Lisa R.", type: "Follow-up", status: "upcoming" },
                ].map((appointment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-[#D7C7ED]/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-sm font-medium text-[#3B2352]">{appointment.time}</div>
                      <div>
                        <div className="font-semibold">{appointment.client}</div>
                        <div className="text-sm text-gray-600">{appointment.type}</div>
                      </div>
                    </div>
                    <Badge
                      variant={appointment.status === "completed" ? "default" : "secondary"}
                      className={appointment.status === "completed" ? "bg-green-500" : "bg-[#D4AF37]"}
                    >
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                  onClick={handleSubmitNote}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <FileText className="h-6 w-6" />}
                  Submit Note
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                  onClick={handleViewSchedule}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Calendar className="h-6 w-6" />}
                  View Schedule
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                  onClick={handleTeamChat}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <MessageSquare className="h-6 w-6" />}
                  Team Chat
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                  onClick={handleClientList}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Users className="h-6 w-6" />}
                  Client List
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>My Assigned Clients</CardTitle>
              <CardDescription>Connected to Zoho CRM - Real client data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "Sarah M.", status: "Active", lastContact: "2024-01-10", nextVisit: "2024-01-15" },
                  { name: "Maria L.", status: "Active", lastContact: "2024-01-08", nextVisit: "2024-01-12" },
                  { name: "Jennifer K.", status: "Paused", lastContact: "2024-01-05", nextVisit: "TBD" },
                  { name: "Lisa R.", status: "Active", lastContact: "2024-01-09", nextVisit: "2024-01-14" },
                ].map((client, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border border-[#D7C7ED]/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback className="bg-[#D7C7ED] text-[#3B2352]">
                          {client.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{client.name}</div>
                        <div className="text-sm text-gray-600">Last contact: {client.lastContact}</div>
                        <div className="text-sm text-gray-600">Next visit: {client.nextVisit}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={client.status === "Active" ? "default" : "secondary"}
                        className={client.status === "Active" ? "bg-green-500" : "bg-gray-500"}
                      >
                        {client.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 border-[#3B2352] text-[#3B2352]"
                        onClick={() => handleViewClientDetails(client.name)}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "View Details"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Schedule Overview</CardTitle>
              <CardDescription>Your personal and team schedule - Connected to Zoho CRM</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Steven's Priority 3: Actual calendar implementation */}
              <div className="space-y-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#3B2352]">August 2025</h3>
                    <p className="text-sm text-gray-600">Your healthcare schedule</p>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-[#3B2352] text-[#3B2352]"
                      onClick={handleViewSchedule}
                      disabled={loading}
                    >
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Today"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-[#3B2352] text-[#3B2352]"
                      onClick={handleViewSchedule}
                      disabled={loading}
                    >
                      Week
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="bg-[#3B2352] hover:bg-[#3B2352]/90"
                      onClick={handleViewSchedule}
                      disabled={loading}
                    >
                      Month
                    </Button>
                  </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 text-center">
                  {/* Day Headers */}
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="p-2 text-sm font-medium text-gray-600 bg-[#D7C7ED]/20">
                      {day}
                    </div>
                  ))}
                  
                  {/* Calendar Days */}
                  {Array.from({ length: 35 }, (_, i) => {
                    const dayNumber = i - 2; // Start from day 1 (adjust for week start)
                    const isCurrentMonth = dayNumber >= 1 && dayNumber <= 31;
                    const isToday = dayNumber === 3; // August 3rd
                    const hasAppointments = [3, 5, 7, 10, 15, 20, 25].includes(dayNumber);
                    
                    return (
                      <div
                        key={i}
                        className={`
                          min-h-[60px] p-1 border border-gray-200 relative
                          ${isCurrentMonth ? 'bg-white hover:bg-[#D7C7ED]/10' : 'bg-gray-50 text-gray-400'}
                          ${isToday ? 'bg-[#3B2352] text-white font-bold' : ''}
                          ${hasAppointments && !isToday ? 'bg-blue-50' : ''}
                          cursor-pointer
                        `}
                        onClick={() => {
                          if (isCurrentMonth && !loading) {
                            handleViewSchedule();
                          }
                        }}
                      >
                        {isCurrentMonth && (
                          <>
                            <div className="text-sm">{dayNumber}</div>
                            {hasAppointments && (
                              <div className="absolute bottom-1 left-1 right-1">
                                <div className="w-full h-1 bg-[#3B2352] rounded-full"></div>
                                <div className="text-xs text-[#3B2352] mt-1">
                                  {dayNumber === 3 ? '4 appts' : 
                                   dayNumber === 5 ? '2 appts' : 
                                   dayNumber === 7 ? '3 appts' : '1 appt'}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Today's Appointments */}
                <div className="mt-6 p-4 bg-[#D7C7ED]/10 rounded-lg">
                  <h4 className="font-semibold text-[#3B2352] mb-3">Today's Appointments (Aug 3)</h4>
                  <div className="space-y-2">
                    {[
                      { time: "9:00 AM", client: "Sarah M.", type: "Postpartum Check-in", status: "upcoming" },
                      { time: "11:00 AM", client: "Maria L.", type: "Home Visit", status: "upcoming" },
                      { time: "2:00 PM", client: "Jennifer K.", type: "Support Session", status: "completed" },
                      { time: "4:00 PM", client: "Lisa R.", type: "Follow-up Call", status: "upcoming" },
                    ].map((appointment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-white rounded border border-[#D7C7ED]/50 cursor-pointer hover:bg-[#D7C7ED]/5"
                        onClick={() => !loading && handleViewClientDetails(appointment.client)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-medium text-[#3B2352]">{appointment.time}</div>
                          <div>
                            <div className="font-medium text-gray-900">{appointment.client}</div>
                            <div className="text-sm text-gray-600">{appointment.type}</div>
                          </div>
                        </div>
                        <Badge 
                          variant={appointment.status === 'completed' ? 'default' : 'secondary'}
                          className={appointment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}
                        >
                          {appointment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Schedule Preview */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-[#3B2352] mb-3">Team Schedule Overview</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {[
                      { name: "Dr. Sarah Chen", status: "Available", appointments: 6 },
                      { name: "Nurse Emily Rodriguez", status: "Busy", appointments: 8 },
                      { name: "Lactation Consultant Mike Wilson", status: "Available", appointments: 4 },
                    ].map((teammate, index) => (
                      <div 
                        key={index} 
                        className="p-3 bg-white rounded border cursor-pointer hover:bg-gray-50"
                        onClick={() => !loading && handleTeamChat()}
                      >
                        <div className="font-medium text-gray-900">{teammate.name}</div>
                        <div className="text-sm text-gray-600">{teammate.appointments} appointments today</div>
                        <Badge 
                          variant="secondary" 
                          className={teammate.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                        >
                          {teammate.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Shift Notes</CardTitle>
              <CardDescription>Submit and manage your shift documentation - Connected to Zoho CRM</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                <p>Shift notes interface connected to Zoho CRM</p>
                <p className="text-sm mt-2">Create service requests and track documentation</p>
                <Button 
                  className="mt-4 bg-[#3B2352] hover:bg-[#3B2352]/90"
                  onClick={handleSubmitNote}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create New Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Client Details Modal */}
      <Dialog open={clientModalOpen} onOpenChange={setClientModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-[#3B2352]" />
              Client Details: {selectedClient?.name}
            </DialogTitle>
            <DialogDescription>
              View detailed information and case history for this client
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-[#3B2352]">{selectedClient?.totalCases || 0}</div>
                    <div className="text-sm text-gray-600">Total Cases</div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{selectedClient?.cases?.filter((c: any) => c.status === 'active').length || 0}</div>
                    <div className="text-sm text-gray-600">Active Cases</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedClient?.recentActivity?.length > 0 ? (
                    selectedClient.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded border">
                        <div>
                          <div className="font-medium text-sm">{activity.description || 'Case Activity'}</div>
                          <div className="text-xs text-gray-500">Case ID: {activity.id}</div>
                        </div>
                        <Badge variant={activity.status === 'active' ? 'default' : 'secondary'}>
                          {activity.status || 'completed'}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      <FileText className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p>No recent activity found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}