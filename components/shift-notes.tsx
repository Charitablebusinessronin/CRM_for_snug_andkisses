"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Upload, CheckCircle, Loader2, Save } from "lucide-react"

/**
 * The main component for managing shift notes.
 * It allows contractors to submit new shift notes and view their previous notes.
 * @returns {JSX.Element} The shift notes component.
 */
export function ShiftNotes() {
  // Form state management
  const [formData, setFormData] = useState({
    client: '',
    date: '',
    startTime: '',
    endTime: '',
    totalHours: '',
    activities: [] as string[],
    notes: '',
    signature: null as File | null
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const [shiftNotes] = useState([
    {
      id: 1,
      client: "Sarah M.",
      date: "2024-01-10",
      startTime: "9:00 AM",
      endTime: "5:00 PM",
      hours: 8,
      type: "Postpartum",
      status: "submitted",
      notes:
        "Baby had a good day with regular feeding schedule. Mom is recovering well and got some rest. Light housework completed including laundry and meal prep.",
      activities: ["Newborn care", "Feeding support", "Light housework", "Emotional support"],
    },
    {
      id: 2,
      client: "Maria L.",
      date: "2024-01-08",
      startTime: "2:00 PM",
      endTime: "11:00 PM",
      hours: 9,
      type: "Birth Support",
      status: "approved",
      notes:
        "Attended birth at Midtown Hospital. Provided continuous support during 12-hour labor. Baby born healthy at 10:45 PM.",
      activities: ["Labor support", "Comfort measures", "Advocacy", "Immediate postpartum care"],
    },
  ])

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle activity checkbox changes
  const handleActivityChange = (activity: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      activities: checked 
        ? [...prev.activities, activity]
        : prev.activities.filter(a => a !== activity)
    }))
  }

  // Submit shift note to Zoho CRM with HIPAA logging
  const handleSubmitShiftNote = async () => {
    setIsSubmitting(true)
    setSubmitStatus('idle')
    
    try {
      // Validate required fields
      if (!formData.client || !formData.date || !formData.notes) {
        throw new Error('Please fill in all required fields')
      }

      // Submit to dedicated shift notes API with HIPAA compliance
      const response = await fetch('/api/v1/shift-notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client: formData.client,
          date: formData.date,
          startTime: formData.startTime,
          endTime: formData.endTime,
          totalHours: formData.totalHours,
          activities: formData.activities,
          notes: formData.notes,
          signature: formData.signature ? 'uploaded' : undefined,
          hipaaCompliant: true
        })
      })

      const result = await response.json()

      if (result.success) {
        setSubmitStatus('success')
        // Reset form
        setFormData({
          client: '',
          date: '',
          startTime: '',
          endTime: '',
          totalHours: '',
          activities: [],
          notes: '',
          signature: null
        })
      } else {
        throw new Error(result.error || 'Failed to submit shift note')
      }
      
    } catch (error) {
      console.error('Error submitting shift note:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Submit New Shift Note */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Submit Shift Note</CardTitle>
          <CardDescription>Record details from your recent shift</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="client">Client</Label>
              <Select value={formData.client} onValueChange={(value) => handleInputChange('client', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sarah">Sarah M.</SelectItem>
                  <SelectItem value="maria">Maria L.</SelectItem>
                  <SelectItem value="jennifer">Jennifer K.</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date">Date</Label>
              <Input 
                type="date" 
                id="date" 
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="hours">Total Hours</Label>
              <Input 
                type="number" 
                id="hours" 
                placeholder="8" 
                value={formData.totalHours}
                onChange={(e) => handleInputChange('totalHours', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time">Start Time</Label>
              <Input 
                type="time" 
                id="start-time" 
                value={formData.startTime}
                onChange={(e) => handleInputChange('startTime', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="end-time">End Time</Label>
              <Input 
                type="time" 
                id="end-time" 
                value={formData.endTime}
                onChange={(e) => handleInputChange('endTime', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="activities">Activities Performed</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              {[
                "Newborn care",
                "Feeding support",
                "Light housework",
                "Emotional support",
                "Meal prep",
                "Sibling care",
                "Birth support",
                "Comfort measures",
              ].map((activity) => (
                <label key={activity} className="flex items-center space-x-2 text-sm">
                  <input 
                    type="checkbox" 
                    className="rounded border-[#3B2352]" 
                    checked={formData.activities.includes(activity)}
                    onChange={(e) => handleActivityChange(activity, e.target.checked)}
                  />
                  <span>{activity}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Detailed Notes</Label>
            <Textarea
              id="notes"
              placeholder="Describe the shift in detail, including any important observations, activities completed, and client feedback..."
              className="min-h-[120px]"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="signature">Digital Signature Upload</Label>
            <div className="border-2 border-dashed border-[#D7C7ED] rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 text-[#3B2352] mx-auto mb-2" />
              <p className="text-sm text-gray-600">Upload signed shift confirmation (PDF or image)</p>
              <Button variant="outline" className="mt-2 border-[#3B2352] text-[#3B2352]">
                Choose File
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {submitStatus === 'success' && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span>Shift note submitted successfully and saved to Zoho CRM!</span>
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
              <span>Error submitting shift note. Please try again.</span>
            </div>
          )}

          <Button 
            className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white"
            onClick={handleSubmitShiftNote}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting to Zoho CRM...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Submit Shift Note
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Previous Shift Notes */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Previous Shift Notes</CardTitle>
          <CardDescription>Your submitted shift records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {shiftNotes.map((note) => (
              <Card key={note.id} className="border-[#D7C7ED]/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="border-[#D7C7ED] text-[#3B2352]">
                        {note.type}
                      </Badge>
                      <div>
                        <div className="font-semibold">{note.client}</div>
                        <div className="text-sm text-gray-600 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {note.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {note.startTime} - {note.endTime} ({note.hours}h)
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={note.status === "approved" ? "default" : "secondary"}
                      className={note.status === "approved" ? "bg-[#D4AF37] text-white" : ""}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {note.status}
                    </Badge>
                  </div>

                  <p className="text-gray-700 mb-3" style={{ fontFamily: "Lato, sans-serif" }}>
                    {note.notes}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {note.activities.map((activity, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-[#D7C7ED] text-[#3B2352]">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
