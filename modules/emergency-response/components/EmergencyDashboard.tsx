"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  AlertTriangle, Phone, Clock, MapPin, User, Heart, 
  Activity, Shield, Plus, Eye, RefreshCw, Bell
} from "lucide-react"
import { EmergencyService } from "../services/EmergencyService"
import type { 
  EmergencyIncident, EmergencyContact, MonitoringAlert,
  EmergencyType, EmergencySeverity 
} from "../types/EmergencyTypes"

interface EmergencyDashboardProps {
  onIncidentCreated?: (incident: EmergencyIncident) => void
}

/**
 * Emergency Dashboard Component - HIPAA Compliant Emergency Response Interface
 * Comprehensive emergency response and crisis management dashboard
 */
export function EmergencyDashboard({ onIncidentCreated }: EmergencyDashboardProps) {
  const [activeIncidents, setActiveIncidents] = useState<EmergencyIncident[]>([])
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [emergencyForm, setEmergencyForm] = useState({
    clientId: '',
    type: 'medical-emergency' as EmergencyType,
    severity: 'moderate' as EmergencySeverity,
    description: '',
    location: '',
    symptoms: '',
    reportedBy: {
      name: '',
      role: 'caregiver' as const,
      contactInfo: ''
    }
  })
  const [loading, setLoading] = useState(true)
  const [isReporting, setIsReporting] = useState(false)
  const [recentAlerts, setRecentAlerts] = useState<MonitoringAlert[]>([])

  const emergencyService = new EmergencyService()

  useEffect(() => {
    loadDashboardData()
    // Set up real-time updates
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [incidents] = await Promise.all([
        emergencyService.getActiveIncidents()
      ])
      
      setActiveIncidents(incidents)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReportEmergency = async () => {
    if (!emergencyForm.clientId || !emergencyForm.description) {
      return
    }

    try {
      setIsReporting(true)
      
      const incident = await emergencyService.reportEmergency({
        clientId: emergencyForm.clientId,
        type: emergencyForm.type,
        severity: emergencyForm.severity,
        description: emergencyForm.description,
        location: emergencyForm.location,
        reportedBy: emergencyForm.reportedBy,
        symptoms: emergencyForm.symptoms ? emergencyForm.symptoms.split(',').map(s => s.trim()) : undefined
      })

      setActiveIncidents(prev => [incident, ...prev])
      
      // Reset form
      setEmergencyForm({
        clientId: '',
        type: 'medical-emergency',
        severity: 'moderate',
        description: '',
        location: '',
        symptoms: '',
        reportedBy: {
          name: '',
          role: 'caregiver',
          contactInfo: ''
        }
      })
      
      setShowReportForm(false)
      
      if (onIncidentCreated) {
        onIncidentCreated(incident)
      }

    } catch (error) {
      console.error('Failed to report emergency:', error)
    } finally {
      setIsReporting(false)
    }
  }

  const handleUpdateStatus = async (incidentId: string, newStatus: string) => {
    try {
      await emergencyService.updateIncidentStatus(incidentId, newStatus, 'dashboard-user')
      loadDashboardData() // Refresh data
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const getSeverityColor = (severity: EmergencySeverity) => {
    switch (severity) {
      case 'life-threatening': return 'bg-red-100 text-red-800 border-red-200'
      case 'severe': return 'bg-red-100 text-red-700 border-red-200'
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'mild': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'non-urgent': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported': return 'bg-red-100 text-red-800'
      case 'acknowledged': return 'bg-orange-100 text-orange-800'
      case 'dispatched': return 'bg-blue-100 text-blue-800'
      case 'on-scene': return 'bg-purple-100 text-purple-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case 'medium': return <Clock className="h-4 w-4 text-yellow-600" />
      case 'low': return <Clock className="h-4 w-4 text-green-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getTimeElapsed = (timestamp: string) => {
    const elapsed = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(elapsed / 60000)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`
    }
    return `${minutes}m ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse text-[#3B2352] mx-auto mb-4" />
          <p className="text-[#3B2352] font-medium">Loading emergency dashboard...</p>
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
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-[#3B2352]" />
              <span>Emergency Response Center</span>
            </div>
          </CardTitle>
          <CardDescription>
            24/7 emergency monitoring and rapid response coordination
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Monitor active incidents, coordinate emergency responses, and ensure 
                immediate care for clients in crisis situations.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="outline"
                onClick={loadDashboardData}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                onClick={() => setShowReportForm(true)}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Report Emergency
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">
              {activeIncidents.filter(i => i.priority === 'critical').length}
            </p>
            <p className="text-sm text-gray-600">Critical</p>
          </CardContent>
        </Card>

        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {activeIncidents.filter(i => i.priority === 'high').length}
            </p>
            <p className="text-sm text-gray-600">High Priority</p>
          </CardContent>
        </Card>

        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Activity className="h-8 w-8 text-[#3B2352]" />
            </div>
            <p className="text-2xl font-bold text-[#3B2352]">
              {activeIncidents.filter(i => i.status === 'in-progress').length}
            </p>
            <p className="text-sm text-gray-600">In Progress</p>
          </CardContent>
        </Card>

        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">
              {activeIncidents.length}
            </p>
            <p className="text-sm text-gray-600">Total Active</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Incidents */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle>Active Emergency Incidents</CardTitle>
          <CardDescription>
            Current emergencies requiring immediate attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeIncidents.length > 0 ? (
            <div className="space-y-4">
              {activeIncidents.map((incident) => (
                <Card 
                  key={incident.incidentId} 
                  className={`border-l-4 ${
                    incident.priority === 'critical' ? 'border-l-red-600' :
                    incident.priority === 'high' ? 'border-l-orange-600' :
                    'border-l-blue-600'
                  }`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          {getPriorityIcon(incident.priority)}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-[#3B2352]">
                              {incident.clientName}
                            </h4>
                            <Badge 
                              variant="secondary" 
                              className={getSeverityColor(incident.severity)}
                            >
                              {incident.severity}
                            </Badge>
                            <Badge 
                              variant="secondary" 
                              className={getStatusColor(incident.status)}
                            >
                              {incident.status}
                            </Badge>
                          </div>
                          
                          <p className="text-sm text-gray-700 mb-2">
                            <strong>Type:</strong> {incident.type.replace('-', ' ')}
                          </p>
                          <p className="text-sm text-gray-600 mb-3">
                            {incident.description}
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>Reported: {getTimeElapsed(incident.reportedAt)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4" />
                              <span>By: {incident.reportedBy.name} ({incident.reportedBy.role})</span>
                            </div>
                            <div className="flex items-center space-x-2 sm:col-span-2">
                              <MapPin className="h-4 w-4" />
                              <span>{incident.location.address}</span>
                            </div>
                          </div>

                          {incident.symptoms && incident.symptoms.length > 0 && (
                            <div className="mt-3 p-2 bg-red-50 rounded border border-red-100">
                              <p className="text-sm text-red-800">
                                <strong>Symptoms:</strong> {incident.symptoms.join(', ')}
                              </p>
                            </div>
                          )}

                          {incident.vitalSigns && (
                            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-100">
                              <p className="text-sm text-blue-800">
                                <strong>Vital Signs:</strong> Recorded at {formatTime(incident.vitalSigns.recordedAt)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedIncident(incident)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>
                                Emergency Incident Details - {selectedIncident?.clientName}
                              </DialogTitle>
                            </DialogHeader>
                            
                            {selectedIncident && (
                              <div className="space-y-6">
                                {/* Incident Overview */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                  <h4 className="font-semibold mb-2">Incident Overview</h4>
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <strong>Type:</strong> {selectedIncident.type}
                                    </div>
                                    <div>
                                      <strong>Severity:</strong> {selectedIncident.severity}
                                    </div>
                                    <div>
                                      <strong>Priority:</strong> {selectedIncident.priority}
                                    </div>
                                    <div>
                                      <strong>Status:</strong> {selectedIncident.status}
                                    </div>
                                  </div>
                                </div>

                                {/* Timeline */}
                                <div>
                                  <h4 className="font-semibold mb-3">Timeline</h4>
                                  <div className="space-y-2">
                                    {selectedIncident.timeline.map((event, index) => (
                                      <div key={index} className="flex items-start space-x-3 text-sm">
                                        <div className="w-2 h-2 bg-[#3B2352] rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                          <p className="font-medium">{event.event}</p>
                                          <p className="text-gray-600">{event.details}</p>
                                          <p className="text-xs text-gray-500">
                                            {formatTime(event.timestamp)} by {event.performedBy}
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Response Team */}
                                {selectedIncident.response.responders.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-3">Response Team</h4>
                                    <div className="space-y-2">
                                      {selectedIncident.response.responders.map((responder, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                          <div>
                                            <p className="font-medium">{responder.name}</p>
                                            <p className="text-sm text-gray-600">{responder.role}</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-sm">{responder.contact.phone}</p>
                                            <Badge variant="outline" className="text-xs">
                                              {responder.availability.status}
                                            </Badge>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        
                        {!['resolved', 'closed'].includes(incident.status) && (
                          <Select 
                            value={incident.status}
                            onValueChange={(value) => handleUpdateStatus(incident.incidentId, value)}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="acknowledged">Acknowledged</SelectItem>
                              <SelectItem value="dispatched">Dispatched</SelectItem>
                              <SelectItem value="on-scene">On Scene</SelectItem>
                              <SelectItem value="in-progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#3B2352] mb-2">
                No Active Emergencies
              </h3>
              <p className="text-gray-600">
                All clear! No emergency incidents currently active.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Emergency Report Form */}
      <Dialog open={showReportForm} onOpenChange={setShowReportForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-red-600">Report Emergency</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Client ID <span className="text-red-500">*</span></Label>
                <Input
                  value={emergencyForm.clientId}
                  onChange={(e) => setEmergencyForm(prev => ({
                    ...prev,
                    clientId: e.target.value
                  }))}
                  placeholder="Enter client ID..."
                />
              </div>
              
              <div>
                <Label>Emergency Type <span className="text-red-500">*</span></Label>
                <Select 
                  value={emergencyForm.type}
                  onValueChange={(value: EmergencyType) => setEmergencyForm(prev => ({
                    ...prev,
                    type: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="medical-emergency">Medical Emergency</SelectItem>
                    <SelectItem value="postpartum-hemorrhage">Postpartum Hemorrhage</SelectItem>
                    <SelectItem value="preeclampsia">Preeclampsia</SelectItem>
                    <SelectItem value="mental-health-crisis">Mental Health Crisis</SelectItem>
                    <SelectItem value="baby-distress">Baby Distress</SelectItem>
                    <SelectItem value="infection">Infection</SelectItem>
                    <SelectItem value="allergic-reaction">Allergic Reaction</SelectItem>
                    <SelectItem value="fall-injury">Fall/Injury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Severity <span className="text-red-500">*</span></Label>
                <Select 
                  value={emergencyForm.severity}
                  onValueChange={(value: EmergencySeverity) => setEmergencyForm(prev => ({
                    ...prev,
                    severity: value
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="life-threatening">Life Threatening</SelectItem>
                    <SelectItem value="severe">Severe</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="mild">Mild</SelectItem>
                    <SelectItem value="non-urgent">Non-Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Location <span className="text-red-500">*</span></Label>
                <Input
                  value={emergencyForm.location}
                  onChange={(e) => setEmergencyForm(prev => ({
                    ...prev,
                    location: e.target.value
                  }))}
                  placeholder="Client address or location..."
                />
              </div>
            </div>

            <div>
              <Label>Description <span className="text-red-500">*</span></Label>
              <Textarea
                value={emergencyForm.description}
                onChange={(e) => setEmergencyForm(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Detailed description of the emergency situation..."
                rows={3}
              />
            </div>

            <div>
              <Label>Symptoms (comma-separated)</Label>
              <Input
                value={emergencyForm.symptoms}
                onChange={(e) => setEmergencyForm(prev => ({
                  ...prev,
                  symptoms: e.target.value
                }))}
                placeholder="fever, nausea, chest pain..."
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Reported By <span className="text-red-500">*</span></Label>
                <Input
                  value={emergencyForm.reportedBy.name}
                  onChange={(e) => setEmergencyForm(prev => ({
                    ...prev,
                    reportedBy: { ...prev.reportedBy, name: e.target.value }
                  }))}
                  placeholder="Reporter name..."
                />
              </div>
              
              <div>
                <Label>Role</Label>
                <Select 
                  value={emergencyForm.reportedBy.role}
                  onValueChange={(value: any) => setEmergencyForm(prev => ({
                    ...prev,
                    reportedBy: { ...prev.reportedBy, role: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Client</SelectItem>
                    <SelectItem value="caregiver">Caregiver</SelectItem>
                    <SelectItem value="family">Family Member</SelectItem>
                    <SelectItem value="medical-provider">Medical Provider</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Contact Info <span className="text-red-500">*</span></Label>
                <Input
                  value={emergencyForm.reportedBy.contactInfo}
                  onChange={(e) => setEmergencyForm(prev => ({
                    ...prev,
                    reportedBy: { ...prev.reportedBy, contactInfo: e.target.value }
                  }))}
                  placeholder="Phone or email..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowReportForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReportEmergency}
                disabled={!emergencyForm.clientId || !emergencyForm.description || isReporting}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Phone className="h-4 w-4 mr-2" />
                {isReporting ? "Reporting..." : "Report Emergency"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}