"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Plus } from "lucide-react"
import { appointmentAPI, customerAPI } from "@/lib/api"
import type { Appointment } from "@/lib/types"
import { format } from "date-fns"

export function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const queryClient = useQueryClient()

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentAPI.getAll().then((res) => res.data),
  })

  const { data: customers = [] } = useQuery({
    queryKey: ["customers"],
    queryFn: () => customerAPI.getAll().then((res) => res.data),
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "in_progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType) {
      case "babysitting":
        return "👶"
      case "doula":
        return "🤱"
      case "overnight":
        return "🌙"
      case "consultation":
        return "💬"
      default:
        return "📅"
    }
  }

  const todayAppointments = appointments.filter((apt: Appointment) => {
    const aptDate = new Date(apt.startDateTime)
    return aptDate.toDateString() === selectedDate.toDateString()
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#3B2352]">Appointment Scheduler</h2>
          <p className="text-gray-600">Manage appointments and scheduling</p>
        </div>
        <Button className="bg-[#3B2352] hover:bg-[#3B2352]/90">
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold">{format(selectedDate, "MMMM yyyy")}</h3>
              </div>
              {/* Simple calendar grid would go here */}
              <div className="grid grid-cols-7 gap-1 text-sm">
                {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                  <div key={day} className="text-center font-medium p-2">
                    {day}
                  </div>
                ))}
                {/* Calendar days would be generated here */}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointments List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Appointments for {format(selectedDate, "MMMM d, yyyy")}</CardTitle>
            <CardDescription>{todayAppointments.length} appointments scheduled</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading appointments...</div>
            ) : todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No appointments scheduled for this date</div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((appointment: Appointment) => {
                  const customer = customers.find((c: any) => c.id === appointment.customerId)

                  return (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getServiceTypeIcon(appointment.serviceType)}</span>
                            <h3 className="font-semibold">
                              {appointment.serviceType.charAt(0).toUpperCase() + appointment.serviceType.slice(1)}
                            </h3>
                            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(appointment.startDateTime), "h:mm a")} -
                              {format(new Date(appointment.endDateTime), "h:mm a")}
                            </div>

                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {customer ? `${customer.firstName} ${customer.lastName}` : "Unknown"}
                            </div>

                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {appointment.location.type === "client_home" ? "Client Home" : appointment.location.type}
                            </div>
                          </div>

                          {appointment.notes && <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>}
                        </div>

                        <div className="text-right">
                          <div className="font-semibold text-lg">${appointment.totalAmount}</div>
                          <div className="text-sm text-gray-500">${appointment.rate}/hr</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-[#3B2352]" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold">{todayAppointments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Confirmed</p>
                <p className="text-2xl font-bold">
                  {todayAppointments.filter((apt: Appointment) => apt.status === "confirmed").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <User className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">
                  {todayAppointments.filter((apt: Appointment) => apt.status === "in_progress").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold">
                  ${todayAppointments.reduce((sum: number, apt: Appointment) => sum + apt.totalAmount, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
