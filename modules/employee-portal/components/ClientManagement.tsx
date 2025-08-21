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
  Users, Search, Plus, Edit, Eye, Phone, Mail, 
  Calendar, MapPin, Heart, Baby, Star, AlertCircle
} from "lucide-react"
import { EmployeeService } from "../services/EmployeeService"
import type { Client, ClientNote, ServicePlan } from "../types/EmployeeTypes"

interface ClientManagementProps {
  onClientUpdated: () => void
}

/**
 * Client Management Component - HIPAA Compliant Healthcare Client Management
 * Comprehensive client management for healthcare employees
 */
export function ClientManagement({ onClientUpdated }: ClientManagementProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [newNote, setNewNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [isAddingNote, setIsAddingNote] = useState(false)

  const employeeService = new EmployeeService()

  useEffect(() => {
    loadClients()
  }, [])

  useEffect(() => {
    filterClients()
  }, [clients, searchQuery, statusFilter])

  const loadClients = async () => {
    try {
      setLoading(true)
      const clientsData = await employeeService.getAllClients()
      setClients(clientsData)
    } catch (error) {
      console.error('Failed to load clients:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterClients = () => {
    let filtered = clients

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(client =>
        client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        client.phone.includes(searchQuery)
      )
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(client => client.status === statusFilter)
    }

    setFilteredClients(filtered)
  }

  const handleAddNote = async (clientId: string) => {
    if (!newNote.trim()) return

    try {
      setIsAddingNote(true)
      await employeeService.addClientNote(clientId, {
        content: newNote.trim(),
        type: 'general',
        isPrivate: false
      })
      
      setNewNote("")
      setIsAddingNote(false)
      
      // Refresh client data if viewing details
      if (selectedClient?.id === clientId) {
        const updatedClient = await employeeService.getClientDetails(clientId)
        setSelectedClient(updatedClient)
      }
      
      onClientUpdated()
    } catch (error) {
      console.error('Failed to add note:', error)
      setIsAddingNote(false)
    }
  }

  const handleStatusChange = async (clientId: string, newStatus: string) => {
    try {
      await employeeService.updateClientStatus(clientId, newStatus)
      loadClients()
      onClientUpdated()
    } catch (error) {
      console.error('Failed to update client status:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'discharged': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
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
          <Users className="h-8 w-8 animate-pulse text-[#3B2352] mx-auto mb-4" />
          <p className="text-[#3B2352] font-medium">Loading client data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
            Client Management
          </CardTitle>
          <CardDescription>
            Manage your assigned clients and their care plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search clients by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="discharged">Discharged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredClients.length} of {clients.length} clients
          </div>
        </CardContent>
      </Card>

      {/* Client List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="border-[#D7C7ED]/50 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="w-12 h-12 bg-[#D7C7ED] rounded-full flex items-center justify-center">
                    <Heart className="h-6 w-6 text-[#3B2352]" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-[#3B2352] text-lg">{client.name}</h3>
                      <Badge 
                        variant="secondary" 
                        className={getStatusColor(client.status)}
                      >
                        {client.status}
                      </Badge>
                      {client.priority && client.priority !== 'low' && (
                        <AlertCircle className={`h-4 w-4 ${getPriorityColor(client.priority)}`} />
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Baby className="h-4 w-4" />
                          <span>Baby age: {client.babyAge}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Last visit: {formatDate(client.lastVisit)}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{client.address}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600">
                          {client.satisfactionRating}/5 satisfaction
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {client.currentServices.length} active services
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const details = await employeeService.getClientDetails(client.id)
                          setSelectedClient(details)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>{selectedClient?.name} - Client Details</DialogTitle>
                      </DialogHeader>
                      
                      {selectedClient && (
                        <div className="space-y-6">
                          {/* Client Info */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Email:</strong> {selectedClient.email}
                            </div>
                            <div>
                              <strong>Phone:</strong> {selectedClient.phone}
                            </div>
                            <div>
                              <strong>Address:</strong> {selectedClient.address}
                            </div>
                            <div>
                              <strong>Emergency Contact:</strong> {selectedClient.emergencyContact}
                            </div>
                          </div>
                          
                          {/* Current Services */}
                          <div>
                            <h4 className="font-semibold mb-3">Current Services</h4>
                            <div className="space-y-2">
                              {selectedClient.currentServices.map((service, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                                  <strong>{service.name}</strong>
                                  <p className="text-gray-600">{service.description}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Started: {formatDate(service.startDate)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Recent Notes */}
                          <div>
                            <h4 className="font-semibold mb-3">Recent Notes</h4>
                            <div className="space-y-3 max-h-60 overflow-y-auto">
                              {selectedClient.notes?.slice(0, 5).map((note, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                                  <p className="text-gray-700">{note.content}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {formatDate(note.createdAt)} by {note.authorName}
                                  </p>
                                </div>
                              ))}
                            </div>
                            
                            {/* Add Note */}
                            <div className="mt-4 space-y-3">
                              <Textarea
                                placeholder="Add a note about this client..."
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                rows={3}
                              />
                              <Button
                                onClick={() => handleAddNote(selectedClient.id)}
                                disabled={!newNote.trim() || isAddingNote}
                                size="sm"
                                className="bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
                              >
                                {isAddingNote ? "Adding..." : "Add Note"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `tel:${client.phone}`}
                  >
                    <Phone className="h-4 w-4" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = `mailto:${client.email}`}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Quick Status Update */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Quick Status Update:</span>
                  <Select 
                    value={client.status} 
                    onValueChange={(value) => handleStatusChange(client.id, value)}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="discharged">Discharged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredClients.length === 0 && (
        <Card className="border-[#3B2352]/20">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No clients found matching your criteria</p>
            <p className="text-sm text-gray-500 mt-1">
              Try adjusting your search or filter settings
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}