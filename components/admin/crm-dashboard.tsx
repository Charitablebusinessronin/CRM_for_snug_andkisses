"use client"

import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  UserPlus, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  Phone, 
  Mail, 
  Calendar, 
  Users,
  TrendingUp,
  Clock,
  RefreshCw,
  FileText,
  Target,
  Activity
} from 'lucide-react';

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company?: string;
  created_time: string;
  modified_time?: string;
}

interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  lead_source: string;
  lead_status: string;
  created_time: string;
}

export function CrmDashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company: ''
  });
  const [newLead, setNewLead] = useState({
    first_name: '',
    last_name: '',
    email: '',
    company: '',
    lead_source: 'Website',
    lead_status: 'New'
  });

  useEffect(() => {
    loadCrmData();
  }, []);

  const loadCrmData = async () => {
    setIsLoading(true);
    try {
      // Load contacts
      const contactsResponse = await fetch('/api/crm/contacts');
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        setContacts(contactsData.data || []);
      }

      // Generate mock leads data
      const mockLeads: Lead[] = [
        {
          id: '1',
          first_name: 'Emma',
          last_name: 'Watson',
          email: 'emma.watson@example.com',
          company: 'Healthcare Partners',
          lead_source: 'Website',
          lead_status: 'New',
          created_time: new Date().toISOString()
        },
        {
          id: '2',
          first_name: 'David',
          last_name: 'Miller',
          email: 'david.miller@medical.com',
          company: 'Miller Medical Group',
          lead_source: 'Referral',
          lead_status: 'Contacted',
          created_time: new Date().toISOString()
        }
      ];
      setLeads(mockLeads);
      
      setError(null);
    } catch (err) {
      setError("Failed to load CRM data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.first_name || !newContact.email) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      const response = await fetch('/api/crm/contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newContact)
      });

      if (response.ok) {
        toast.success("Contact added successfully!");
        setIsAddContactOpen(false);
        setNewContact({ first_name: '', last_name: '', email: '', phone: '', company: '' });
        loadCrmData();
      } else {
        toast.error("Failed to add contact");
      }
    } catch (error) {
      toast.error("Error adding contact");
    }
  };

  const handleAddLead = async () => {
    if (!newLead.first_name || !newLead.email) {
      toast.error("Please fill in required fields");
      return;
    }

    // Mock lead creation (would integrate with backend)
    const mockLead: Lead = {
      id: Date.now().toString(),
      ...newLead,
      created_time: new Date().toISOString()
    };

    setLeads([mockLead, ...leads]);
    setIsAddLeadOpen(false);
    setNewLead({
      first_name: '',
      last_name: '',
      email: '',
      company: '',
      lead_source: 'Website',
      lead_status: 'New'
    });
    toast.success("Lead added successfully!");
  };

  const filteredContacts = contacts.filter(contact =>
    contact.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.company && contact.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredLeads = leads.filter(lead =>
    lead.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const crmStats = {
    totalContacts: contacts.length,
    totalLeads: leads.length,
    newThisMonth: Math.min(contacts.length, 8) + Math.min(leads.length, 3),
    conversionRate: leads.length > 0 ? Math.round((contacts.length / (contacts.length + leads.length)) * 100) : 0
  };

  return (
    <div className="space-y-6">
      {/* CRM Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
            Customer Relationship Management
          </h2>
          <p className="text-gray-600">Manage your healthcare clients and leads efficiently</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadCrmData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => toast.success("Export feature coming soon!")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* CRM Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Contacts</p>
                <p className="text-2xl font-bold text-[#3B2352]">{crmStats.totalContacts}</p>
              </div>
              <Users className="h-8 w-8 text-[#3B2352]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Leads</p>
                <p className="text-2xl font-bold text-blue-600">{crmStats.totalLeads}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">New This Month</p>
                <p className="text-2xl font-bold text-green-600">{crmStats.newThisMonth}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-purple-600">{crmStats.conversionRate}%</p>
              </div>
              <Activity className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search contacts, leads, or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* CRM Tabs */}
      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="contacts" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Contacts ({contacts.length})
          </TabsTrigger>
          <TabsTrigger value="leads" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Leads ({leads.length})
          </TabsTrigger>
          <TabsTrigger value="activities" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Activities
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Contact Directory</h3>
            <Button onClick={() => setIsAddContactOpen(true)} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-[#3B2352]" />
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-500">{error}</p>
                  <Button onClick={loadCrmData} className="mt-2" size="sm">
                    Retry
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredContacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">
                          {contact.first_name} {contact.last_name}
                        </TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.phone || 'N/A'}</TableCell>
                        <TableCell>{contact.company || 'N/A'}</TableCell>
                        <TableCell>{new Date(contact.created_time).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => {
                                setSelectedContact(contact);
                                setIsContactModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Lead Pipeline</h3>
            <Button onClick={() => setIsAddLeadOpen(true)} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Lead
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">
                        {lead.first_name} {lead.last_name}
                      </TableCell>
                      <TableCell>{lead.email}</TableCell>
                      <TableCell>{lead.company || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{lead.lead_source}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={lead.lead_status === 'New' ? 'default' : 'secondary'}
                          className={lead.lead_status === 'New' ? 'bg-green-500' : ''}
                        >
                          {lead.lead_status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(lead.created_time).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline">
                            <Mail className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Track all CRM interactions and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: 'contact_created', message: 'New contact added: John Doe', time: '2 hours ago', icon: UserPlus },
                  { type: 'lead_updated', message: 'Lead status updated: Emma Watson → Contacted', time: '4 hours ago', icon: Edit },
                  { type: 'call_made', message: 'Phone call completed with David Miller', time: '6 hours ago', icon: Phone },
                  { type: 'email_sent', message: 'Email campaign sent to 15 contacts', time: '1 day ago', icon: Mail },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-white rounded-full">
                      <activity.icon className="h-4 w-4 text-[#3B2352]" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Contact Dialog */}
      <Dialog open={isAddContactOpen} onOpenChange={setIsAddContactOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>
            <DialogDescription>
              Add a new contact to your healthcare CRM
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={newContact.first_name}
                  onChange={(e) => setNewContact({...newContact, first_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={newContact.last_name}
                  onChange={(e) => setNewContact({...newContact, last_name: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={newContact.email}
                onChange={(e) => setNewContact({...newContact, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={newContact.phone}
                onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                value={newContact.company}
                onChange={(e) => setNewContact({...newContact, company: e.target.value})}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddContactOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddContact} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
                Add Contact
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Lead Dialog */}
      <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Add a new potential client to your lead pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leadFirstName">First Name *</Label>
                <Input
                  id="leadFirstName"
                  value={newLead.first_name}
                  onChange={(e) => setNewLead({...newLead, first_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="leadLastName">Last Name</Label>
                <Input
                  id="leadLastName"
                  value={newLead.last_name}
                  onChange={(e) => setNewLead({...newLead, last_name: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="leadEmail">Email *</Label>
              <Input
                id="leadEmail"
                type="email"
                value={newLead.email}
                onChange={(e) => setNewLead({...newLead, email: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="leadCompany">Company</Label>
              <Input
                id="leadCompany"
                value={newLead.company}
                onChange={(e) => setNewLead({...newLead, company: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="leadSource">Lead Source</Label>
                <Select value={newLead.lead_source} onValueChange={(value) => setNewLead({...newLead, lead_source: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Website">Website</SelectItem>
                    <SelectItem value="Referral">Referral</SelectItem>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Healthcare Directory">Healthcare Directory</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="leadStatus">Status</Label>
                <Select value={newLead.lead_status} onValueChange={(value) => setNewLead({...newLead, lead_status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="Contacted">Contacted</SelectItem>
                    <SelectItem value="Qualified">Qualified</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddLeadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddLead} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
                Add Lead
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Contact Details Modal */}
      <Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Contact Details</DialogTitle>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <p><strong>Name:</strong> {selectedContact.first_name} {selectedContact.last_name}</p>
                      <p><strong>Email:</strong> {selectedContact.email}</p>
                      <p><strong>Phone:</strong> {selectedContact.phone || 'N/A'}</p>
                      <p><strong>Company:</strong> {selectedContact.company || 'N/A'}</p>
                      <p><strong>Created:</strong> {new Date(selectedContact.created_time).toLocaleString()}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Contact
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
