"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Calendar, Clock, MapPin, User, CheckCircle, XCircle, 
  AlertCircle, Plus, Edit, Eye, RefreshCw, FileText
} from "lucide-react"
import { EmployeeService } from "../services/EmployeeService"
import type { Shift, Client, ShiftDocumentation } from "../types/EmployeeTypes"

interface ShiftSchedulingProps {
  shifts: Shift[]
  onScheduleUpdated: () => void
}

/**
 * Shift Scheduling Component - HIPAA Compliant Healthcare Shift Management
 * Comprehensive shift scheduling and management for healthcare employees
 */
export function ShiftScheduling({ shifts, onScheduleUpdated }: ShiftSchedulingProps) {
  const [weekShifts, setWeekShifts] = useState<Shift[]>([])
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null)
  const [isSubmittingDoc, setIsSubmittingDoc] = useState(false)
  const [documentation, setDocumentation] = useState<Partial<ShiftDocumentation>>({
    assessment: "",
    interventions: "",
    outcomes: "",
    recommendations: "",
    followUpRequired: false
  })
  const [loading, setLoading] = useState(true)
  const [weekStartDate, setWeekStartDate] = useState(getCurrentWeekStart())

  const employeeService = new EmployeeService()

  useEffect(() => {
    loadWeekShifts()
  }, [weekStartDate])

  function getCurrentWeekStart(): string {
    const today = new Date()
    const dayOfWeek = today.getDay()
    const difference = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + difference)
    return monday.toISOString().split('T')[0]
  }

  const loadWeekShifts = async () => {
    try {
      setLoading(true)
      const endDate = new Date(weekStartDate)
      endDate.setDate(endDate.getDate() + 6)
      
      const shiftsData = await employeeService.getEmployeeSchedule(
        weekStartDate,
        endDate.toISOString().split('T')[0]
      )
      setWeekShifts(shiftsData)
    } catch (error) {
      console.error('Failed to load shifts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (shiftId: string, newStatus: string, notes?: string) => {
    try {
      await employeeService.updateShiftStatus(shiftId, newStatus, notes)
      loadWeekShifts()
      onScheduleUpdated()
    } catch (error) {
      console.error('Failed to update shift status:', error)
    }
  }

  const handleDocumentationSubmit = async () => {
    if (!selectedShift || !documentation.assessment || !documentation.outcomes) {
      return
    }

    try {
      setIsSubmittingDoc(true)
      
      const docData = {
        assessment: documentation.assessment,
        interventions: documentation.interventions || "No specific interventions noted",
        outcomes: documentation.outcomes,
        recommendations: documentation.recommendations || "Continue current care plan"
      }

      await employeeService.submitShiftDocumentation(selectedShift.id, docData)
      
      // Reset documentation form
      setDocumentation({
        assessment: "",
        interventions: "",
        outcomes: "",
        recommendations: "",
        followUpRequired: false
      })
      
      setSelectedShift(null)
      loadWeekShifts()
      onScheduleUpdated()
    } catch (error) {
      console.error('Failed to submit documentation:', error)
    } finally {
      setIsSubmittingDoc(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-green-100 text-green-800'
      case 'completed': return 'bg-gray-100 text-gray-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'postpartum-visit': return 'text-purple-600'
      case 'lactation-support': return 'text-green-600'
      case 'night-care': return 'text-blue-600'
      case 'emergency': return 'text-red-600'
      case 'follow-up': return 'text-orange-600'
      default: return 'text-gray-600'
    }
  }

  const formatTime = (timeStr: string) => {
    return new Date(`2000-01-01T${timeStr}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const formatShiftType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const getWeekDates = () => {
    const dates = []
    const startDate = new Date(weekStartDate)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      dates.push(date)
    }
    
    return dates
  }

  const getShiftsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return weekShifts.filter(shift => 
      shift.date === dateStr || 
      (!shift.date && new Date().toISOString().split('T')[0] === dateStr)
    )
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const currentDate = new Date(weekStartDate)
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    setWeekStartDate(newDate.toISOString().split('T')[0])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Calendar className="h-8 w-8 animate-pulse text-[#3B2352] mx-auto mb-4" />
          <p className="text-[#3B2352] font-medium">Loading schedule...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
            Shift Schedule
          </CardTitle>
          <CardDescription>
            Manage your appointments and shifts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('prev')}
              >
                ← Previous
              </Button>
              <h3 className="font-semibold text-[#3B2352]">
                Week of {new Date(weekStartDate).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateWeek('next')}
              >
                Next →
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadWeekShifts}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {getWeekDates().map((date, index) => {
          const dayShifts = getShiftsForDate(date)
          const isToday = date.toDateString() === new Date().toDateString()
          
          return (
            <Card 
              key={index} 
              className={`border-[#D7C7ED]/50 ${isToday ? 'ring-2 ring-[#3B2352]' : ''}`}
            >
              <CardHeader className="pb-2">
                <div className="text-center">
                  <h4 className="font-medium text-[#3B2352]">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  {isToday && (
                    <Badge variant="secondary" className="bg-[#D7C7ED] text-[#3B2352] text-xs">
                      Today
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {dayShifts.length > 0 ? (
                  <div className="space-y-2">
                    {dayShifts.map((shift) => (
                      <div
                        key={shift.id}
                        className="p-2 bg-gray-50 rounded border text-xs"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-[#3B2352]" />
                            <span className="font-medium">
                              {formatTime(shift.startTime)}
                            </span>
                          </div>
                          <Badge 
                            variant="secondary" 
                            className={`${getStatusColor(shift.status)} text-xs`}
                          >
                            {shift.status}
                          </Badge>
                        </div>
                        
                        <p className="font-medium text-[#3B2352] mb-1">
                          {shift.clientName}
                        </p>
                        
                        <p className={`text-xs mb-1 ${getTypeColor(shift.type)}`}>
                          {formatShiftType(shift.type)}
                        </p>
                        
                        <div className="flex items-center text-xs text-gray-500 mb-2">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span className="truncate">{shift.location}</span>
                        </div>
                        
                        <div className="flex space-x-1">
                          {shift.status === 'scheduled' && (
                            <Button
                              size="sm"
                              className="bg-[#3B2352] text-white hover:bg-[#2A1A3E] h-6 text-xs"
                              onClick={() => handleStatusUpdate(shift.id, 'in-progress')}
                            >
                              Start
                            </Button>
                          )}
                          
                          {shift.status === 'in-progress' && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs"
                              onClick={() => {
                                setSelectedShift(shift)
                                setDocumentation({
                                  assessment: "",
                                  interventions: "",
                                  outcomes: "",
                                  recommendations: "",
                                  followUpRequired: false
                                })
                              }}
                            >
                              Complete
                            </Button>
                          )}
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 text-xs"
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Shift Details</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <strong>Client:</strong> {shift.clientName}
                                </div>
                                <div>
                                  <strong>Time:</strong> {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                </div>
                                <div>
                                  <strong>Type:</strong> {formatShiftType(shift.type)}
                                </div>
                                <div>
                                  <strong>Location:</strong> {shift.location}
                                </div>
                                {shift.notes && (
                                  <div>
                                    <strong>Notes:</strong> {shift.notes}
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Calendar className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No shifts</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Documentation Dialog */}
      {selectedShift && (
        <Dialog open={!!selectedShift} onOpenChange={() => setSelectedShift(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Complete Shift Documentation</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Shift Summary</h4>
                <p><strong>Client:</strong> {selectedShift.clientName}</p>
                <p><strong>Type:</strong> {formatShiftType(selectedShift.type)}</p>
                <p><strong>Duration:</strong> {formatTime(selectedShift.startTime)} - {formatTime(selectedShift.endTime)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Assessment <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={documentation.assessment}
                  onChange={(e) => setDocumentation(prev => ({
                    ...prev,
                    assessment: e.target.value
                  }))}
                  placeholder="Describe the client's current status and any observations..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Interventions
                </label>
                <Textarea
                  value={documentation.interventions}
                  onChange={(e) => setDocumentation(prev => ({
                    ...prev,
                    interventions: e.target.value
                  }))}
                  placeholder="List any interventions provided during this visit..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Outcomes <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={documentation.outcomes}
                  onChange={(e) => setDocumentation(prev => ({
                    ...prev,
                    outcomes: e.target.value
                  }))}
                  placeholder="Document the results and client response to care provided..."
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Recommendations
                </label>
                <Textarea
                  value={documentation.recommendations}
                  onChange={(e) => setDocumentation(prev => ({
                    ...prev,
                    recommendations: e.target.value
                  }))}
                  placeholder="Provide recommendations for continued care..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="followUp"
                  checked={documentation.followUpRequired}
                  onChange={(e) => setDocumentation(prev => ({
                    ...prev,
                    followUpRequired: e.target.checked
                  }))}
                />
                <label htmlFor="followUp" className="text-sm">
                  Follow-up visit required
                </label>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setSelectedShift(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDocumentationSubmit}
                  disabled={!documentation.assessment || !documentation.outcomes || isSubmittingDoc}
                  className="bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
                >
                  {isSubmittingDoc ? "Submitting..." : "Complete Shift"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Stats */}
      <Card className="border-[#3B2352]/20">
        <CardContent className="p-6">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-[#3B2352]">
                {weekShifts.length}
              </p>
              <p className="text-sm text-gray-600">Total Shifts</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                {weekShifts.filter(s => s.status === 'completed').length}
              </p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {weekShifts.filter(s => s.status === 'scheduled').length}
              </p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">
                {weekShifts.filter(s => s.status === 'in-progress').length}
              </p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}