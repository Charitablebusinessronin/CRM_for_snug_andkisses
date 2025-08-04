"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, DollarSign, Heart, MessageSquare, Star, User, Baby, Shield } from "lucide-react"

/**
 * The main component for the client portal.
 * It displays information about the client's services, appointments, and doulas.
 * @returns {JSX.Element} The client portal component.
 */
export function ClientPortal() {
  const [clientStage] = useState("active") // prospect, intake, active, paused

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-[#3B2352]/20 bg-gradient-to-r from-[#3B2352] to-[#3B2352]/90 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "Merriweather, serif" }}>
            <Heart className="h-6 w-6 text-[#D4AF37]" />
            Welcome, Sarah!
          </CardTitle>
          <CardDescription className="text-white/80" style={{ fontFamily: "Lato, sans-serif" }}>
            Your next appointment is tomorrow at 10:00 AM with Jessica
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Service Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">24</div>
            <div className="text-sm text-gray-600">Hours Remaining</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">8</div>
            <div className="text-sm text-gray-600">Sessions Used</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">4.9</div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <MessageSquare className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">2</div>
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
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Your Assigned Doula</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg?height=64&width=64" />
                  <AvatarFallback className="bg-[#D7C7ED] text-[#3B2352]">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-[#3B2352]">Jessica Davis</h3>
                  <p className="text-gray-600">Certified Postpartum Doula</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 text-[#D4AF37] fill-current" />
                    <span className="text-sm">4.9/5 (23 reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  <Button variant="outline" className="border-[#3B2352] text-[#3B2352] mb-2">
                    Message
                  </Button>
                  <div className="text-sm text-gray-600">Next visit: Tomorrow 10 AM</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Service Progress */}
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Service Progress</CardTitle>
              <CardDescription>Your postpartum care journey</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Hours Used</span>
                  <span>16 of 40 hours</span>
                </div>
                <Progress value={40} className="h-2" />
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
              <div className="space-y-4">
                {[
                  {
                    date: "2024-01-10",
                    activity: "Session completed with Jessica",
                    duration: "4 hours",
                    notes: "Great progress with feeding routine",
                  },
                  {
                    date: "2024-01-08",
                    activity: "Check-in call",
                    duration: "30 minutes",
                    notes: "Discussed sleep schedule adjustments",
                  },
                  {
                    date: "2024-01-05",
                    activity: "Session completed with Jessica",
                    duration: "6 hours",
                    notes: "Overnight support, baby slept well",
                  },
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-4 p-3 border border-[#D7C7ED]/50 rounded-lg">
                    <div className="w-2 h-2 bg-[#3B2352] rounded-full mt-2" />
                    <div className="flex-1">
                      <div className="font-medium">{item.activity}</div>
                      <div className="text-sm text-gray-600">
                        {item.date} • {item.duration}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">{item.notes}</div>
                    </div>
                  </div>
                ))}
              </div>
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
              <div className="text-center py-8 text-gray-500">
                <User className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                <p>Doula selection interface would be implemented here</p>
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
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                <p>Calendar scheduling interface would be integrated here</p>
              </div>
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
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                <p>Billing and payment interface would be implemented here</p>
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
                <Button className="w-full justify-start bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Contact Support Team
                </Button>
                <Button variant="outline" className="w-full justify-start border-[#3B2352] text-[#3B2352]">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Support Call
                </Button>
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
