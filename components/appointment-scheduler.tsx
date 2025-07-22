"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Plus } from "lucide-react"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

// A fetcher function to get appointments
const getAppointments = async () => {
  const res = await fetch('/api/v1/appointments');
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || 'Network response was not ok');
  }
  const data = await res.json();
  return data.data;
};

const createAppointment = async (newAppointment: any) => {
    const res = await fetch('/api/v1/appointments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAppointment),
    });
    if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create appointment');
    }
    return res.json();
};

export function AppointmentScheduler() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: getAppointments,
  });

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success("Appointment created successfully!");
      setIsDialogOpen(false);
    },
    onError: (error: any) => {
        toast.error(error.message);
    }
  });

  const handleCreateAppointment = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newAppointment = {
      subject: formData.get('subject') as string,
      startTime: new Date(formData.get('startTime') as string).toISOString(),
      endTime: new Date(formData.get('endTime') as string).toISOString(),
      contactId: 'HARDCODED_CONTACT_ID', // Replace with actual contact ID
    };
    mutation.mutate(newAppointment);
  };

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

  const todayAppointments = appointments.filter((apt: any) => {
    const aptDate = new Date(apt.start_time)
    return aptDate.toDateString() === selectedDate.toDateString()
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#3B2352]">Appointment Scheduler</h2>
          <p className="text-gray-600">Manage appointments and scheduling</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#3B2352] hover:bg-[#3B2352]/90">
              <Plus className="h-4 w-4 mr-2" />
              New Appointment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Appointment</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required />
              </div>
              <div>
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" name="startTime" type="datetime-local" required />
              </div>
              <div>
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" name="endTime" type="datetime-local" required />
              </div>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? 'Creating...' : 'Create Appointment'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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
                {todayAppointments.map((appointment: any) => {
                  return (
                    <div key={appointment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{getServiceTypeIcon(appointment.subject)}</span>
                            <h3 className="font-semibold">
                              {appointment.subject}
                            </h3>
                            <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {format(new Date(appointment.start_time), "h:mm a")} -
                              {format(new Date(appointment.end_time), "h:mm a")}
                            </div>

                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {"Unknown"}
                            </div>

                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {"Unknown"}
                            </div>
                          </div>
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
    </div>
  )
}
