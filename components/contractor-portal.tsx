"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, DollarSign, FileText, Heart, MessageSquare, Upload, User } from "lucide-react"
import { JobBoard } from "./job-board"
import { ShiftNotes } from "./shift-notes"
import { ContractorProfile } from "./contractor-profile"

/**
 * The main component for the contractor portal.
 * It displays information about the contractor's jobs, shifts, and profile.
 * @returns {JSX.Element} The contractor portal component.
 */
export function ContractorPortal() {
  const [activeJobs] = useState([
    {
      id: 1,
      type: "Postpartum",
      client: "Sarah M.",
      date: "2024-01-15",
      time: "9:00 AM - 5:00 PM",
      location: "Downtown",
      rate: "$25/hr",
      status: "confirmed",
    },
    {
      id: 2,
      type: "Birth Support",
      client: "Maria L.",
      date: "2024-01-18",
      time: "On-call",
      location: "Midtown",
      rate: "$35/hr",
      status: "pending",
    },
  ])

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <Card className="border-[#3B2352]/20 bg-gradient-to-r from-[#3B2352] to-[#3B2352]/90 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ fontFamily: "Merriweather, serif" }}>
            <Heart className="h-6 w-6 text-[#D4AF37]" />
            Welcome back, Jessica!
          </CardTitle>
          <CardDescription className="text-white/80" style={{ fontFamily: "Lato, sans-serif" }}>
            You have 3 upcoming shifts and 2 new job opportunities
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">12</div>
            <div className="text-sm text-gray-600">This Month</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">48</div>
            <div className="text-sm text-gray-600">Hours Logged</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">$1,200</div>
            <div className="text-sm text-gray-600">Earnings</div>
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

      {/* Main Content Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-[#D7C7ED]/20">
          <TabsTrigger value="dashboard" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="jobs" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Job Board
          </TabsTrigger>
          <TabsTrigger value="shifts" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Shift Notes
          </TabsTrigger>
          <TabsTrigger value="profile" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Profile
          </TabsTrigger>
          <TabsTrigger value="messages" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Messages
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Upcoming Shifts */}
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Upcoming Shifts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border border-[#D7C7ED]/50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="outline"
                        className={`${
                          job.type === "Postpartum"
                            ? "border-[#D7C7ED] text-[#3B2352]"
                            : "border-[#3B2352] text-[#3B2352]"
                        }`}
                      >
                        {job.type}
                      </Badge>
                      <div>
                        <div className="font-semibold">{job.client}</div>
                        <div className="text-sm text-gray-600">
                          {job.date} • {job.time}
                        </div>
                        <div className="text-sm text-gray-600">
                          {job.location} • {job.rate}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={job.status === "confirmed" ? "default" : "secondary"}
                      className={job.status === "confirmed" ? "bg-[#D4AF37] text-white" : ""}
                    >
                      {job.status}
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
                  Submit Shift Note
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                >
                  <Upload className="h-6 w-6" />
                  Upload Document
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                >
                  <Calendar className="h-6 w-6" />
                  Update Availability
                </Button>
                <Button
                  variant="outline"
                  className="h-20 flex-col gap-2 border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                >
                  <User className="h-6 w-6" />
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <JobBoard />
        </TabsContent>

        <TabsContent value="shifts">
          <ShiftNotes />
        </TabsContent>

        <TabsContent value="profile">
          <ContractorProfile />
        </TabsContent>

        <TabsContent value="messages">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Messages</CardTitle>
              <CardDescription>Communication with admin and clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                <p>Message system would be integrated here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
