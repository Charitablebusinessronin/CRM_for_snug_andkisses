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
  FileText, Plus, Search, Filter, Eye, Edit, CheckCircle,
  Calendar, User, AlertTriangle, Heart, Clock, Save
} from "lucide-react"
import { EmployeeService } from "../services/EmployeeService"
import type { Client, Task, CareAssessment } from "../types/EmployeeTypes"

interface DocumentationToolsProps {
  clients: Client[]
  onDocumentationUpdated: () => void
}

interface AssessmentFormData {
  clientId: string
  physicalHealth: {
    overallStatus: 'excellent' | 'good' | 'fair' | 'poor'
    incisionHealing?: 'excellent' | 'good' | 'concerning'
    breastfeedingStatus?: 'successful' | 'needs-support' | 'not-breastfeeding'
    painLevel: number
    sleepQuality: 'excellent' | 'good' | 'fair' | 'poor'
    energyLevel: 'high' | 'moderate' | 'low' | 'very-low'
  }
  mentalHealth: {
    mood: 'excellent' | 'good' | 'fair' | 'concerning'
    anxietyLevel: number
    depressionScreening: 'negative' | 'mild' | 'moderate' | 'severe'
    supportSystem: 'excellent' | 'adequate' | 'limited' | 'poor'
    bonding: 'excellent' | 'good' | 'developing' | 'concerning'
  }
  babyHealth: {
    feedingStatus: 'excellent' | 'good' | 'needs-improvement'
    weightGain: 'on-track' | 'slow' | 'concerning'
    sleepPattern: 'good' | 'irregular' | 'concerning'
    jaundice: 'none' | 'mild' | 'moderate' | 'severe'
    umbilicalCord: 'healing-well' | 'needs-attention'
  }
  recommendations: string[]
  followUpDate: string
  referralsNeeded: string[]
}

/**
 * Documentation Tools Component - HIPAA Compliant Healthcare Documentation
 * Comprehensive documentation and assessment tools for healthcare employees
 */
export function DocumentationTools({ clients, onDocumentationUpdated }: DocumentationToolsProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [taskFilter, setTaskFilter] = useState("all")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [showAssessmentForm, setShowAssessmentForm] = useState(false)
  const [assessmentForm, setAssessmentForm] = useState<AssessmentFormData>({
    clientId: "",
    physicalHealth: {
      overallStatus: 'good',
      painLevel: 0,
      sleepQuality: 'good',
      energyLevel: 'moderate'
    },
    mentalHealth: {
      mood: 'good',
      anxietyLevel: 0,
      depressionScreening: 'negative',
      supportSystem: 'adequate',
      bonding: 'good'
    },
    babyHealth: {
      feedingStatus: 'good',
      weightGain: 'on-track',
      sleepPattern: 'good',
      jaundice: 'none',
      umbilicalCord: 'healing-well'
    },
    recommendations: [],
    followUpDate: "",
    referralsNeeded: []
  })
  const [loading, setLoading] = useState(true)
  const [isSavingAssessment, setIsSavingAssessment] = useState(false)

  const employeeService = new EmployeeService()

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    filterTasks()
  }, [tasks, searchQuery, taskFilter])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const tasksData = await employeeService.getPendingTasks()
      setTasks(tasksData)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTasks = () => {
    let filtered = tasks

    if (searchQuery.trim()) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.clientName && task.clientName.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    if (taskFilter !== "all") {
      if (taskFilter === "priority") {
        filtered = filtered.filter(task => ['urgent', 'high'].includes(task.priority))
      } else {
        filtered = filtered.filter(task => task.type === taskFilter)
      }
    }

    setFilteredTasks(filtered)
  }

  const handleCompleteTask = async (taskId: string, notes?: string) => {
    try {
      await employeeService.completeTask(taskId, notes)
      loadTasks()
      onDocumentationUpdated()
    } catch (error) {
      console.error('Failed to complete task:', error)
    }
  }

  const initializeAssessmentForm = (client: Client) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    setAssessmentForm({
      clientId: client.id,
      physicalHealth: {
        overallStatus: 'good',
        painLevel: 0,
        sleepQuality: 'good',
        energyLevel: 'moderate'
      },
      mentalHealth: {
        mood: 'good',
        anxietyLevel: 0,
        depressionScreening: 'negative',
        supportSystem: 'adequate',
        bonding: 'good'
      },
      babyHealth: {
        feedingStatus: 'good',
        weightGain: 'on-track',
        sleepPattern: 'good',
        jaundice: 'none',
        umbilicalCord: 'healing-well'
      },
      recommendations: [],
      followUpDate: tomorrow.toISOString().split('T')[0],
      referralsNeeded: []
    })
    
    setSelectedClient(client)
    setShowAssessmentForm(true)
  }

  const handleSaveAssessment = async () => {
    try {
      setIsSavingAssessment(true)
      
      // In production, this would save to the actual API
      console.log('Saving assessment:', assessmentForm)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setShowAssessmentForm(false)
      setSelectedClient(null)
      onDocumentationUpdated()
      
    } catch (error) {
      console.error('Failed to save assessment:', error)
    } finally {
      setIsSavingAssessment(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'low': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'documentation': return <FileText className="h-4 w-4" />
      case 'assessment': return <Heart className="h-4 w-4" />
      case 'follow-up': return <Calendar className="h-4 w-4" />
      case 'care-planning': return <Edit className="h-4 w-4" />
      case 'administrative': return <User className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <FileText className="h-8 w-8 animate-pulse text-[#3B2352] mx-auto mb-4" />
          <p className="text-[#3B2352] font-medium">Loading documentation tools...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
            Documentation & Assessment Tools
          </CardTitle>
          <CardDescription>
            Complete assessments, manage tasks, and maintain client documentation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tasks and documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={taskFilter} onValueChange={setTaskFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter tasks" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="priority">High Priority</SelectItem>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="assessment">Assessment</SelectItem>
                  <SelectItem value="follow-up">Follow-up</SelectItem>
                  <SelectItem value="care-planning">Care Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Assessment Actions */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle>Quick Assessment Actions</CardTitle>
          <CardDescription>
            Create new assessments for your clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.slice(0, 6).map((client) => (
              <div
                key={client.id}
                className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-[#3B2352]">{client.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    {client.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Baby age: {client.babyAge}
                </p>
                <Button
                  size="sm"
                  onClick={() => initializeAssessmentForm(client)}
                  className="bg-[#3B2352] text-white hover:bg-[#2A1A3E] w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Assessment
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#3B2352]">
            Documentation Tasks ({filteredTasks.length})
          </h3>
        </div>

        {filteredTasks.length > 0 ? (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <Card key={task.id} className="border-[#D7C7ED]/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="text-[#3B2352] mt-1">
                        {getTypeIcon(task.type)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-[#3B2352]">{task.title}</h4>
                          <Badge 
                            variant="secondary" 
                            className={getPriorityColor(task.priority)}
                          >
                            {task.priority}
                          </Badge>
                          {task.priority === 'urgent' && (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          )}
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {task.clientName && (
                            <div className="flex items-center space-x-1">
                              <User className="h-3 w-3" />
                              <span>{task.clientName}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {formatDate(task.dueDate)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.estimatedDuration} min</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCompleteTask(task.id, `Completed ${task.type} task`)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-[#3B2352]/20">
            <CardContent className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-4" />
              <p className="text-gray-600">All documentation tasks are complete!</p>
              <p className="text-sm text-gray-500 mt-1">
                Great job staying on top of your documentation requirements
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Care Assessment Form */}
      <Dialog open={showAssessmentForm} onOpenChange={setShowAssessmentForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Care Assessment - {selectedClient?.name}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Physical Health */}
            <div className="space-y-4">
              <h4 className="font-semibold text-[#3B2352] text-lg">Physical Health Assessment</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Overall Status</Label>
                  <Select 
                    value={assessmentForm.physicalHealth.overallStatus}
                    onValueChange={(value: any) => setAssessmentForm(prev => ({
                      ...prev,
                      physicalHealth: { ...prev.physicalHealth, overallStatus: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Sleep Quality</Label>
                  <Select 
                    value={assessmentForm.physicalHealth.sleepQuality}
                    onValueChange={(value: any) => setAssessmentForm(prev => ({
                      ...prev,
                      physicalHealth: { ...prev.physicalHealth, sleepQuality: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Pain Level (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={assessmentForm.physicalHealth.painLevel}
                  onChange={(e) => setAssessmentForm(prev => ({
                    ...prev,
                    physicalHealth: { ...prev.physicalHealth, painLevel: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>

            {/* Mental Health */}
            <div className="space-y-4">
              <h4 className="font-semibold text-[#3B2352] text-lg">Mental Health Assessment</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mood</Label>
                  <Select 
                    value={assessmentForm.mentalHealth.mood}
                    onValueChange={(value: any) => setAssessmentForm(prev => ({
                      ...prev,
                      mentalHealth: { ...prev.mentalHealth, mood: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="concerning">Concerning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Support System</Label>
                  <Select 
                    value={assessmentForm.mentalHealth.supportSystem}
                    onValueChange={(value: any) => setAssessmentForm(prev => ({
                      ...prev,
                      mentalHealth: { ...prev.mentalHealth, supportSystem: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="adequate">Adequate</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Anxiety Level (0-10)</Label>
                <Input
                  type="number"
                  min="0"
                  max="10"
                  value={assessmentForm.mentalHealth.anxietyLevel}
                  onChange={(e) => setAssessmentForm(prev => ({
                    ...prev,
                    mentalHealth: { ...prev.mentalHealth, anxietyLevel: parseInt(e.target.value) || 0 }
                  }))}
                />
              </div>
            </div>

            {/* Baby Health */}
            <div className="space-y-4">
              <h4 className="font-semibold text-[#3B2352] text-lg">Baby Health Assessment</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Feeding Status</Label>
                  <Select 
                    value={assessmentForm.babyHealth.feedingStatus}
                    onValueChange={(value: any) => setAssessmentForm(prev => ({
                      ...prev,
                      babyHealth: { ...prev.babyHealth, feedingStatus: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="needs-improvement">Needs Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Weight Gain</Label>
                  <Select 
                    value={assessmentForm.babyHealth.weightGain}
                    onValueChange={(value: any) => setAssessmentForm(prev => ({
                      ...prev,
                      babyHealth: { ...prev.babyHealth, weightGain: value }
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on-track">On Track</SelectItem>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="concerning">Concerning</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Follow-up */}
            <div>
              <Label>Follow-up Date</Label>
              <Input
                type="date"
                value={assessmentForm.followUpDate}
                onChange={(e) => setAssessmentForm(prev => ({
                  ...prev,
                  followUpDate: e.target.value
                }))}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowAssessmentForm(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveAssessment}
                disabled={isSavingAssessment}
                className="bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSavingAssessment ? "Saving..." : "Save Assessment"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}