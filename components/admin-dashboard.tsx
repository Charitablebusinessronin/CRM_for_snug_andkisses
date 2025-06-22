"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Users, Calendar, DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle, UserPlus } from "lucide-react"

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">45</div>
            <div className="text-sm text-gray-600">Active Contractors</div>
            <div className="text-xs text-green-600 mt-1">+3 this week</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">128</div>
            <div className="text-sm text-gray-600">Active Clients</div>
            <div className="text-xs text-green-600 mt-1">+8 this week</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">1,247</div>
            <div className="text-sm text-gray-600">Hours This Month</div>
            <div className="text-xs text-green-600 mt-1">+12% vs last month</div>
          </CardContent>
        </Card>
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <DollarSign className="h-8 w-8 text-[#D4AF37] mx-auto mb-2" />
            <div className="text-2xl font-bold text-[#3B2352]">$31,200</div>
            <div className="text-sm text-gray-600">Revenue This Month</div>
            <div className="text-xs text-green-600 mt-1">+18% vs last month</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Admin Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-[#D7C7ED]/20">
          <TabsTrigger value="overview" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Overview
          </TabsTrigger>
          <TabsTrigger value="contractors" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Contractors
          </TabsTrigger>
          <TabsTrigger value="clients" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Clients
          </TabsTrigger>
          <TabsTrigger value="scheduling" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Scheduling
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Alerts & Actions */}
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Alerts & Actions Required</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { type: "urgent", message: "3 contractor applications need review", action: "Review Applications" },
                  { type: "warning", message: "2 contracts expiring this month", action: "Send Renewals" },
                  { type: "info", message: "5 shift notes pending approval", action: "Review Notes" },
                  { type: "success", message: "12 new client inquiries this week", action: "Process Inquiries" },
                ].map((alert, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-[#D7C7ED]/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {alert.type === "urgent" && <AlertCircle className="h-5 w-5 text-red-500" />}
                      {alert.type === "warning" && <AlertCircle className="h-5 w-5 text-[#D4AF37]" />}
                      {alert.type === "warning" && <AlertCircle className="h-5 w-5 text-[#D4AF37]" />}
                      {alert.type === "info" && <AlertCircle className="h-5 w-5 text-blue-500" />}
                      {alert.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                      <span>{alert.message}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
                    >
                      {alert.action}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Recent Contractor Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Jessica Davis", action: "Submitted shift note", time: "2 hours ago" },
                    { name: "Maria Rodriguez", action: "Updated availability", time: "4 hours ago" },
                    { name: "Sarah Johnson", action: "Completed orientation", time: "1 day ago" },
                    { name: "Emily Chen", action: "Applied for position", time: "2 days ago" },
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 p-2">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-[#D7C7ED] text-[#3B2352] text-xs">
                          {activity.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.name}</div>
                        <div className="text-xs text-gray-600">{activity.action}</div>
                      </div>
                      <div className="text-xs text-gray-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Client Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Client Satisfaction</span>
                      <span>4.8/5</span>
                    </div>
                    <Progress value={96} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Service Completion Rate</span>
                      <span>94%</span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Retention Rate</span>
                      <span>87%</span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contractors">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Contractor Management</CardTitle>
              <CardDescription>Manage doulas, sitters, and applications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                <p>Contractor management interface would be implemented here</p>
                <p className="text-sm mt-2">Including applicant tracking, onboarding status, and performance metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Client Management</CardTitle>
              <CardDescription>Manage client relationships and service delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                <p>Client management interface would be implemented here</p>
                <p className="text-sm mt-2">Including intake tracking, service progress, and billing management</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduling">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Schedule Management</CardTitle>
              <CardDescription>Coordinate appointments and availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                <p>Master scheduling interface would be implemented here</p>
                <p className="text-sm mt-2">Including calendar views, conflict resolution, and automated matching</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Analytics & Reports</CardTitle>
              <CardDescription>Business intelligence and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-[#D7C7ED]" />
                <p>Analytics dashboard would be implemented here</p>
                <p className="text-sm mt-2">Including KPI tracking, financial reports, and operational metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
