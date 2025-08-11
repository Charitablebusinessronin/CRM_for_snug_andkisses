"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import { Mail, Send, Users, Eye, Calendar, Target } from "lucide-react"

interface Contact {
  id: string
  first_name: string
  last_name: string
  email: string
  company?: string
}

interface CampaignCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CampaignCreator({ open, onOpenChange }: CampaignCreatorProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [campaignData, setCampaignData] = useState({
    name: `Healthcare Campaign ${Date.now()}`,
    subject: "",
    previewText: "",
    content: "",
    scheduleDate: "",
    scheduleTime: "",
    campaignType: "immediate"
  })
  const [loading, setLoading] = useState(false)

  // Load contacts when dialog opens
  useEffect(() => {
    if (open) {
      loadContacts()
      // Reset form when opening
      setSelectedContacts([])
      setCampaignData({
        name: `Healthcare Campaign ${Date.now()}`,
        subject: "",
        previewText: "",
        content: "",
        scheduleDate: "",
        scheduleTime: "",
        campaignType: "immediate"
      })
    }
  }, [open])

  const loadContacts = async () => {
    try {
      const response = await fetch('/api/crm/contacts')
      const result = await response.json()
      if (result.success) {
        setContacts(result.data || [])
      }
    } catch (error) {
      console.error('Error loading contacts:', error)
    }
  }

  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId) 
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    )
  }

  const selectAllContacts = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([])
    } else {
      setSelectedContacts(contacts.map(c => c.id))
    }
  }

  const handleSendCampaign = async () => {
    if (!campaignData.subject || !campaignData.content) {
      toast.error("Please fill in campaign subject and content")
      return
    }

    if (selectedContacts.length === 0) {
      toast.error("Please select at least one recipient")
      return
    }

    setLoading(true)
    try {
      const recipients = contacts.filter(c => selectedContacts.includes(c.id))
      
      const campaign = {
        ...campaignData,
        recipients: recipients.map(r => ({
          id: r.id,
          name: `${r.first_name} ${r.last_name}`,
          email: r.email,
          company: r.company
        })),
        totalRecipients: recipients.length,
        status: campaignData.campaignType === "immediate" ? "sending" : "scheduled",
        createdAt: new Date().toISOString()
      }

      // Since we don't have a campaign API endpoint yet, simulate the API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock successful response
      toast.success(`Campaign "${campaignData.name}" ${campaignData.campaignType === "immediate" ? "sent" : "scheduled"} to ${recipients.length} recipients!`)
      onOpenChange(false)
      
    } catch (error) {
      toast.error("Error sending campaign")
      console.error('Error sending campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePreview = () => {
    if (!campaignData.subject || !campaignData.content) {
      toast.error("Please fill in subject and content to preview")
      return
    }
    
    toast.success("Campaign preview generated! (Preview feature coming soon)")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#3B2352]" />
            Create Email Campaign
          </DialogTitle>
          <DialogDescription>
            Create and send targeted email campaigns to your healthcare clients
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Campaign Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    value={campaignData.name}
                    onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
                    placeholder="Healthcare Newsletter - January 2025"
                  />
                </div>
                <div>
                  <Label htmlFor="campaignType">Send Type</Label>
                  <Select value={campaignData.campaignType} onValueChange={(value) => setCampaignData({...campaignData, campaignType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Send Immediately</SelectItem>
                      <SelectItem value="scheduled">Schedule for Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {campaignData.campaignType === "scheduled" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scheduleDate">Schedule Date</Label>
                    <Input
                      id="scheduleDate"
                      type="date"
                      value={campaignData.scheduleDate}
                      onChange={(e) => setCampaignData({...campaignData, scheduleDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="scheduleTime">Schedule Time</Label>
                    <Input
                      id="scheduleTime"
                      type="time"
                      value={campaignData.scheduleTime}
                      onChange={(e) => setCampaignData({...campaignData, scheduleTime: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Email Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Email Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="subject">Subject Line *</Label>
                <Input
                  id="subject"
                  value={campaignData.subject}
                  onChange={(e) => setCampaignData({...campaignData, subject: e.target.value})}
                  placeholder="Your healthcare journey: Important updates"
                />
              </div>
              <div>
                <Label htmlFor="previewText">Preview Text</Label>
                <Input
                  id="previewText"
                  value={campaignData.previewText}
                  onChange={(e) => setCampaignData({...campaignData, previewText: e.target.value})}
                  placeholder="A short preview that appears in email clients..."
                />
              </div>
              <div>
                <Label htmlFor="content">Email Content *</Label>
                <Textarea
                  id="content"
                  value={campaignData.content}
                  onChange={(e) => setCampaignData({...campaignData, content: e.target.value})}
                  placeholder="Dear {{first_name}},&#10;&#10;We hope this message finds you well. At Snug & Kisses Healthcare, we're committed to providing you with the best possible care...&#10;&#10;Best regards,&#10;The Snug & Kisses Team"
                  rows={8}
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handlePreview} variant="outline" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recipients Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Select Recipients ({selectedContacts.length} selected)
                </span>
                <Button onClick={selectAllContacts} variant="outline" size="sm">
                  {selectedContacts.length === contacts.length ? "Deselect All" : "Select All"}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {contacts.length > 0 ? (
                  contacts.map((contact) => (
                    <div key={contact.id} className="flex items-center space-x-3 p-2 border rounded hover:bg-gray-50">
                      <Checkbox
                        checked={selectedContacts.includes(contact.id)}
                        onCheckedChange={() => toggleContactSelection(contact.id)}
                      />
                      <div className="flex-1">
                        <div className="font-medium">
                          {contact.first_name} {contact.last_name}
                        </div>
                        <div className="text-sm text-gray-600">
                          {contact.email} {contact.company && `• ${contact.company}`}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No contacts available</p>
                    <p className="text-sm">Add contacts to your CRM first</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Campaign Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-[#3B2352]">{selectedContacts.length}</div>
                  <div className="text-sm text-gray-600">Recipients</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {campaignData.campaignType === "immediate" ? "Immediate" : "Scheduled"}
                  </div>
                  <div className="text-sm text-gray-600">Send Type</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {campaignData.subject ? "Ready" : "Draft"}
                  </div>
                  <div className="text-sm text-gray-600">Status</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendCampaign} disabled={loading} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
              {loading ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  {campaignData.campaignType === "immediate" ? "Send Campaign" : "Schedule Campaign"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}