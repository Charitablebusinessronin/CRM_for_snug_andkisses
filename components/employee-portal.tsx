"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Calendar, FileText, MessageSquare, User, Users } from "lucide-react"

/**
 * The main component for the employee portal.
 * It displays information about the employee's schedule, clients, and notes.
 * @returns {JSX.Element} The employee portal component.
 */
export function EmployeePortal() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-[#3B2352]/20 bg-gradient-to-r from-[#3B2352] to-[#3B2352]/90 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "Merriweather, serif" }}>
            <User className="h-6 w-6 text-[#D4AF37]" />
            Welcome, Team Member!
          </CardTitle>
          <CardDescription className="text-white/80" style={{ fontFamily: "Lato, sans-serif" }}>
            You have 3 client check-ins scheduled today
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">12</div>
            <div className="text-sm text-gray-600">Assigned Clients</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">5</div>
            <div className="text-sm text-gray-600">Today's Schedule</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">8</div>
            <div className="text-sm text-gray-600">Pending Notes</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">3</div>
            <div className="text-sm text-gray-600">New Messages</div>
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
                >
                  <FileText className="h-6 w-6" />
                  Submit Note
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                >
                  <Calendar className="h-6 w-6" />
                  View Schedule
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                >
                  <MessageSquare className="h-6 w-6" />
                  Team Chat
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                >
                  <Users className="h-6 w-6" />
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
              <CardDescription>Read-only access to client information</CardDescription>
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
                      <Button variant="outline" size="sm" className="mt-2 border-[#3B2352] text-[#3B2352]">
                        View Details
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
              <CardDescription>Your personal and team schedule</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                <p>Calendar interface would be integrated here</p>
                <p className="text-sm mt-2">Including personal schedule and team master view</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Shift Notes</CardTitle>
              <CardDescription>Submit and manage your shift documentation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                <p>Shift notes interface would be implemented here</p>
                <p className="text-sm mt-2">Similar to contractor portal but with employee-specific permissions</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
