"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, Calendar, Clock, FileText, Heart, AlertTriangle, 
  CheckCircle, MapPin, Phone, Mail, Star, TrendingUp
} from "lucide-react"
import { EmployeeService } from "../services/EmployeeService"
import { ClientManagement } from "./ClientManagement"
import { ShiftScheduling } from "./ShiftScheduling"
import { DocumentationTools } from "./DocumentationTools"
import type { EmployeeStats, Client, Shift, Task } from "../types/EmployeeTypes"

/**
 * Employee Dashboard Component - HIPAA Compliant Healthcare Staff Interface
 * Comprehensive dashboard for healthcare employees managing postpartum care
 */
export function EmployeeDashboard() {
  const [employeeStats, setEmployeeStats] = useState<EmployeeStats | null>(null)
  const [activeClients, setActiveClients] = useState<Client[]>([])
  const [todayShifts, setTodayShifts] = useState<Shift[]>([])
  const [pendingTasks, setPendingTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  const employeeService = new EmployeeService()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [stats, clients, shifts, tasks] = await Promise.all([
        employeeService.getEmployeeStats(),
        employeeService.getActiveClients(),
        employeeService.getTodayShifts(),
        employeeService.getPendingTasks()
      ])
      
      setEmployeeStats(stats)
      setActiveClients(clients)
      setTodayShifts(shifts)
      setPendingTasks(tasks)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getShiftStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaskPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-8 w-8 animate-pulse text-[#3B2352] mx-auto mb-4" />
          <p className="text-[#3B2352] font-medium">Loading your dashboard...</p>
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
                Employee Dashboard
              </h1>
              <p className="text-gray-600">Welcome back, {employeeStats?.employeeName}</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="secondary" className="bg-[#D7C7ED] text-[#3B2352]">
              {employeeStats?.role || 'Healthcare Provider'}
            </Badge>
            <Button variant="outline" size="sm" onClick={loadDashboardData}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Refresh
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
                  <p className="text-sm font-medium text-gray-600">Active Clients</p>
                  <p className="text-2xl font-bold text-[#3B2352]">
                    {employeeStats?.activeClients || 0}
                  </p>
                  <p className="text-sm text-green-600">+2 this week</p>
                </div>
                <Users className="h-8 w-8 text-[#3B2352]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D7C7ED]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Shifts</p>
                  <p className="text-2xl font-bold text-[#3B2352]">
                    {todayShifts.length}
                  </p>
                  <p className="text-sm text-blue-600">
                    {todayShifts.filter(s => s.status === 'completed').length} completed
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
                  <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                  <p className="text-2xl font-bold text-[#3B2352]">
                    {pendingTasks.length}
                  </p>
                  <p className="text-sm text-orange-600">
                    {pendingTasks.filter(t => t.priority === 'urgent').length} urgent
                  </p>
                </div>
                <FileText className="h-8 w-8 text-[#3B2352]" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#D7C7ED]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Care Rating</p>
                  <p className="text-2xl font-bold text-[#3B2352]">
                    {employeeStats?.careRating || '4.9'}/5.0
                  </p>
                  <p className="text-sm text-green-600">Excellent</p>
                </div>
                <Star className="h-8 w-8 text-[#D4AF37]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="clients">Clients</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Today's Schedule */}
              <Card className="border-[#3B2352]/20">
                <CardHeader>
                  <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                    Today's Schedule
                  </CardTitle>
                  <CardDescription>
                    Your appointments and shifts for today
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {todayShifts.length > 0 ? (
                    <div className="space-y-3">
                      {todayShifts.map((shift) => (
                        <div key={shift.id} className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-[#3B2352]" />
                              <span className="font-medium text-[#3B2352]">
                                {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                              </span>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={getShiftStatusColor(shift.status)}
                            >
                              {shift.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 mb-1">{shift.clientName}</p>
                          <div className="flex items-center text-xs text-gray-500">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span>{shift.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No shifts scheduled for today</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Priority Tasks */}
              <Card className="border-[#3B2352]/20">
                <CardHeader>
                  <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                    Priority Tasks
                  </CardTitle>
                  <CardDescription>
                    Urgent and high-priority items requiring attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingTasks.length > 0 ? (
                    <div className="space-y-3">
                      {pendingTasks
                        .filter(task => ['urgent', 'high'].includes(task.priority))
                        .slice(0, 5)
                        .map((task) => (
                        <div key={task.id} className="p-3 border rounded-lg bg-gray-50">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                {task.type === 'documentation' ? (
                                  <FileText className="h-4 w-4 text-[#3B2352]" />
                                ) : task.type === 'follow-up' ? (
                                  <Phone className="h-4 w-4 text-[#3B2352]" />
                                ) : (
                                  <AlertTriangle className="h-4 w-4 text-[#3B2352]" />
                                )}
                                <span className="font-medium text-[#3B2352] text-sm">
                                  {task.title}
                                </span>
                              </div>
                              <p className="text-xs text-gray-600 mb-2">
                                Client: {task.clientName}
                              </p>
                              <p className="text-xs text-gray-500">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge 
                              variant="secondary" 
                              className={getTaskPriorityColor(task.priority)}
                            >
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
                      <p className="text-gray-600">All caught up!</p>
                      <p className="text-sm text-gray-500">No urgent tasks pending</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Client Activity */}
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                  Recent Client Activity
                </CardTitle>
                <CardDescription>
                  Latest updates from your active clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeClients.slice(0, 5).map((client) => (
                    <div key={client.id} className="flex items-center space-x-4 p-3 border rounded-lg bg-gray-50">
                      <div className="w-10 h-10 bg-[#D7C7ED] rounded-full flex items-center justify-center">
                        <Heart className="h-5 w-5 text-[#3B2352]" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-[#3B2352]">{client.name}</p>
                        <p className="text-sm text-gray-600">
                          Last visit: {new Date(client.lastVisit).toLocaleDateString()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {client.currentServices.length} active services
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge 
                          variant="secondary" 
                          className={
                            client.status === 'active' 
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }
                        >
                          {client.status}
                        </Badge>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          <span>{client.satisfactionRating}/5</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="clients">
            <ClientManagement onClientUpdated={loadDashboardData} />
          </TabsContent>

          <TabsContent value="schedule">
            <ShiftScheduling 
              shifts={todayShifts}
              onScheduleUpdated={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="documentation">
            <DocumentationTools 
              clients={activeClients}
              onDocumentationUpdated={loadDashboardData}
            />
          </TabsContent>

          <TabsContent value="reports">
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                  Performance Reports
                </CardTitle>
                <CardDescription>
                  View your performance metrics and care quality reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-[#D7C7ED]" />
                  <h3 className="text-xl font-semibold text-[#3B2352] mb-2">
                    Performance Analytics
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Detailed performance reports and analytics coming soon
                  </p>
                  <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
                    Coming Soon - Analytics Dashboard
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