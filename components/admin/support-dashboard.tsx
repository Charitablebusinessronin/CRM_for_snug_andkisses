"use client"

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Edit, 
  Eye, 
  Phone, 
  Mail,
  RefreshCw,
  Download,
  Search,
  Filter,
  User,
  Calendar,
  TrendingUp,
  BarChart3,
  FileText,
  MessageCircle,
  Headphones,
  Star,
  ArrowUp,
  ArrowDown,
  Users
} from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'technical' | 'billing' | 'appointment' | 'general' | 'medical';
  client_name: string;
  client_email: string;
  client_phone?: string;
  assigned_to?: string;
  created_date: string;
  last_updated: string;
  resolution_time?: number; // in hours
  satisfaction_rating?: number; // 1-5 stars
  tags: string[];
  messages: TicketMessage[];
}

interface TicketMessage {
  id: string;
  author: string;
  author_type: 'client' | 'agent' | 'system';
  content: string;
  timestamp: string;
  is_internal?: boolean;
}

interface SupportMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedToday: number;
  averageResolutionTime: number;
  satisfactionScore: number;
  responseTime: number;
  firstContactResolution: number;
}

export function SupportDashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [isAddTicketOpen, setIsAddTicketOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [newTicket, setNewTicket] = useState({
    subject: '',
    description: '',
    priority: 'medium' as Ticket['priority'],
    category: 'general' as Ticket['category'],
    client_name: '',
    client_email: '',
    client_phone: ''
  });
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = async () => {
    setIsLoading(true);
    try {
      // Load contacts for ticket creation
      const contactsResponse = await fetch('/api/crm/contacts');
      let contacts = [];
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        contacts = contactsData.data || [];
      }

      // Generate comprehensive mock ticket data
      const mockTickets: Ticket[] = [
        {
          id: '1',
          subject: 'Appointment Rescheduling Request',
          description: 'Need to reschedule my postpartum care appointment from January 15th to January 20th due to family emergency.',
          status: 'open',
          priority: 'medium',
          category: 'appointment',
          client_name: 'Sarah Johnson',
          client_email: 'sarah.johnson@email.com',
          client_phone: '+1-555-0123',
          assigned_to: 'Emily Rodriguez',
          created_date: '2025-01-03T09:30:00Z',
          last_updated: '2025-01-03T09:30:00Z',
          tags: ['appointment', 'reschedule'],
          messages: [
            {
              id: '1',
              author: 'Sarah Johnson',
              author_type: 'client',
              content: 'Need to reschedule my postpartum care appointment from January 15th to January 20th due to family emergency.',
              timestamp: '2025-01-03T09:30:00Z'
            }
          ]
        },
        {
          id: '2',
          subject: 'Billing Inquiry - Insurance Coverage',
          description: 'Questions about insurance coverage for lactation support services. My insurance provider needs additional documentation.',
          status: 'in_progress',
          priority: 'high',
          category: 'billing',
          client_name: 'Emma Miller',
          client_email: 'emma.miller@email.com',
          client_phone: '+1-555-0456',
          assigned_to: 'Michael Chen',
          created_date: '2025-01-02T14:15:00Z',
          last_updated: '2025-01-03T10:45:00Z',
          resolution_time: 20,
          tags: ['billing', 'insurance'],
          messages: [
            {
              id: '2',
              author: 'Emma Miller',
              author_type: 'client',
              content: 'Questions about insurance coverage for lactation support services. My insurance provider needs additional documentation.',
              timestamp: '2025-01-02T14:15:00Z'
            },
            {
              id: '3',
              author: 'Michael Chen',
              author_type: 'agent',
              content: 'I\'ve gathered the required documentation. I\'ll send the insurance forms to your email within the next hour.',
              timestamp: '2025-01-03T10:45:00Z'
            }
          ]
        },
        {
          id: '3',
          subject: 'Technical Issue with Online Portal',
          description: 'Unable to access patient portal to view appointment history and care notes. Getting error message when logging in.',
          status: 'resolved',
          priority: 'medium',
          category: 'technical',
          client_name: 'Jennifer Davis',
          client_email: 'jennifer.davis@email.com',
          assigned_to: 'Sarah Wilson',
          created_date: '2025-01-01T16:20:00Z',
          last_updated: '2025-01-02T11:30:00Z',
          resolution_time: 19,
          satisfaction_rating: 5,
          tags: ['technical', 'portal', 'login'],
          messages: [
            {
              id: '4',
              author: 'Jennifer Davis',
              author_type: 'client',
              content: 'Unable to access patient portal to view appointment history and care notes. Getting error message when logging in.',
              timestamp: '2025-01-01T16:20:00Z'
            },
            {
              id: '5',
              author: 'Sarah Wilson',
              author_type: 'agent',
              content: 'I\'ve reset your portal credentials. Please check your email for the new login instructions.',
              timestamp: '2025-01-02T09:15:00Z'
            },
            {
              id: '6',
              author: 'Jennifer Davis',
              author_type: 'client',
              content: 'Perfect! I can now access the portal. Thank you for the quick resolution.',
              timestamp: '2025-01-02T11:30:00Z'
            }
          ]
        },
        {
          id: '4',
          subject: 'Urgent: Emergency Doula Support Needed',
          description: 'Going into early labor at 36 weeks. Need immediate doula support. This is my first pregnancy and I\'m feeling anxious.',
          status: 'resolved',
          priority: 'urgent',
          category: 'medical',
          client_name: 'Lisa Wilson',
          client_email: 'lisa.wilson@email.com',
          client_phone: '+1-555-0321',
          assigned_to: 'Dr. Sarah Chen',
          created_date: '2024-12-30T02:45:00Z',
          last_updated: '2024-12-30T03:15:00Z',
          resolution_time: 0.5,
          satisfaction_rating: 5,
          tags: ['urgent', 'doula', 'emergency', 'labor'],
          messages: [
            {
              id: '7',
              author: 'Lisa Wilson',
              author_type: 'client',
              content: 'Going into early labor at 36 weeks. Need immediate doula support. This is my first pregnancy and I\'m feeling anxious.',
              timestamp: '2024-12-30T02:45:00Z'
            },
            {
              id: '8',
              author: 'Dr. Sarah Chen',
              author_type: 'agent',
              content: 'I\'ve immediately dispatched our on-call doula to your location. She should arrive within 20 minutes. Stay calm, you\'re in good hands.',
              timestamp: '2024-12-30T03:00:00Z'
            },
            {
              id: '9',
              author: 'System',
              author_type: 'system',
              content: 'Emergency doula support dispatched successfully. Client contacted.',
              timestamp: '2024-12-30T03:15:00Z'
            }
          ]
        },
        {
          id: '5',
          subject: 'General Inquiry - Postpartum Services',
          description: 'Interested in learning more about your postpartum care packages. What services are included and what are the costs?',
          status: 'pending',
          priority: 'low',
          category: 'general',
          client_name: 'Maria Rodriguez',
          client_email: 'maria.rodriguez@email.com',
          assigned_to: 'Emily Rodriguez',
          created_date: '2025-01-03T11:00:00Z',
          last_updated: '2025-01-03T11:00:00Z',
          tags: ['inquiry', 'services', 'pricing'],
          messages: [
            {
              id: '10',
              author: 'Maria Rodriguez',
              author_type: 'client',
              content: 'Interested in learning more about your postpartum care packages. What services are included and what are the costs?',
              timestamp: '2025-01-03T11:00:00Z'
            }
          ]
        }
      ];

      setTickets(mockTickets);
    } catch (error) {
      toast.error("Failed to load support data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTicket = async () => {
    if (!newTicket.subject || !newTicket.description || !newTicket.client_name) {
      toast.error("Please fill in required fields");
      return;
    }

    const ticket: Ticket = {
      id: Date.now().toString(),
      ...newTicket,
      status: 'open',
      created_date: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      tags: [newTicket.category],
      messages: [
        {
          id: Date.now().toString(),
          author: newTicket.client_name,
          author_type: 'client',
          content: newTicket.description,
          timestamp: new Date().toISOString()
        }
      ]
    };

    setTickets(prev => [ticket, ...prev]);
    setIsAddTicketOpen(false);
    setNewTicket({
      subject: '',
      description: '',
      priority: 'medium',
      category: 'general',
      client_name: '',
      client_email: '',
      client_phone: ''
    });
    toast.success("Support ticket created successfully!");
  };

  const updateTicketStatus = (ticketId: string, newStatus: Ticket['status']) => {
    setTickets(prev => prev.map(ticket => {
      if (ticket.id === ticketId) {
        return {
          ...ticket,
          status: newStatus,
          last_updated: new Date().toISOString()
        };
      }
      return ticket;
    }));
    
    toast.success(`Ticket ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  const addTicketMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const message: TicketMessage = {
      id: Date.now().toString(),
      author: 'Support Agent',
      author_type: 'agent',
      content: newMessage,
      timestamp: new Date().toISOString()
    };

    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
      last_updated: new Date().toISOString()
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id ? updatedTicket : ticket
    ));
    
    setSelectedTicket(updatedTicket);
    setNewMessage('');
    toast.success("Message added to ticket");
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const supportMetrics: SupportMetrics = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => ['open', 'in_progress', 'pending'].includes(t.status)).length,
    resolvedToday: tickets.filter(t => t.status === 'resolved' && 
      new Date(t.last_updated).toDateString() === new Date().toDateString()).length,
    averageResolutionTime: tickets.filter(t => t.resolution_time).length > 0 ?
      tickets.filter(t => t.resolution_time).reduce((sum, t) => sum + (t.resolution_time || 0), 0) /
      tickets.filter(t => t.resolution_time).length : 0,
    satisfactionScore: tickets.filter(t => t.satisfaction_rating).length > 0 ?
      tickets.filter(t => t.satisfaction_rating).reduce((sum, t) => sum + (t.satisfaction_rating || 0), 0) /
      tickets.filter(t => t.satisfaction_rating).length : 0,
    responseTime: 2.3, // Average response time in hours
    firstContactResolution: 78 // Percentage
  };

  const statusColors = {
    open: 'bg-red-500',
    in_progress: 'bg-blue-500',
    pending: 'bg-yellow-500',
    resolved: 'bg-green-500',
    closed: 'bg-gray-500'
  };

  const priorityColors = {
    low: 'bg-gray-500',
    medium: 'bg-blue-500',
    high: 'bg-orange-500',
    urgent: 'bg-red-500'
  };

  const statusNames = {
    open: 'Open',
    in_progress: 'In Progress',
    pending: 'Pending',
    resolved: 'Resolved',
    closed: 'Closed'
  };

  const priorityNames = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent'
  };

  return (
    <div className="space-y-6">
      {/* Support Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
            Customer Support Center
          </h2>
          <p className="text-gray-600">Manage support tickets and provide exceptional customer service</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSupportData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => toast.success("Export feature coming soon!")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Support Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Open Tickets</p>
                <p className="text-2xl font-bold text-[#3B2352]">{supportMetrics.openTickets}</p>
                <p className="text-sm text-gray-600">of {supportMetrics.totalTickets} total</p>
              </div>
              <MessageSquare className="h-8 w-8 text-[#3B2352]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">{supportMetrics.resolvedToday}</p>
                <p className="text-sm text-green-600">+{Math.floor(Math.random() * 3 + 1)} vs yesterday</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Resolution Time</p>
                <p className="text-2xl font-bold text-blue-600">{supportMetrics.averageResolutionTime.toFixed(1)}h</p>
                <p className="text-sm text-blue-600">Target: {'<'}24h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Satisfaction Score</p>
                <p className="text-2xl font-bold text-yellow-600">{supportMetrics.satisfactionScore.toFixed(1)}/5</p>
                <p className="text-sm text-yellow-600">⭐ Excellent</p>
              </div>
              <Star className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search tickets by subject, client, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddTicketOpen(true)} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
          <Plus className="h-4 w-4 mr-2" />
          New Ticket
        </Button>
      </div>

      {/* Support Tabs */}
      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tickets" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Support Tickets
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Knowledge Base
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-[#3B2352]" />
              </div>
            ) : (
              filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">#{ticket.id} - {ticket.subject}</h3>
                          <Badge className={statusColors[ticket.status]}>
                            {statusNames[ticket.status]}
                          </Badge>
                          <Badge className={priorityColors[ticket.priority]}>
                            {priorityNames[ticket.priority]}
                          </Badge>
                          <Badge variant="outline">{ticket.category.toUpperCase()}</Badge>
                        </div>
                        
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{ticket.description}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Client</p>
                            <p className="font-medium">{ticket.client_name}</p>
                            <p className="text-xs text-gray-500">{ticket.client_email}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Assigned To</p>
                            <p className="font-medium">{ticket.assigned_to || 'Unassigned'}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Created</p>
                            <p className="font-medium">{new Date(ticket.created_date).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{new Date(ticket.created_date).toLocaleTimeString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Last Updated</p>
                            <p className="font-medium">{new Date(ticket.last_updated).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-500">{new Date(ticket.last_updated).toLocaleTimeString()}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          {ticket.tags.map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {ticket.satisfaction_rating && (
                            <div className="flex items-center gap-1 ml-4">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="text-sm font-medium">{ticket.satisfaction_rating}/5</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setIsTicketModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {ticket.client_phone && (
                          <Button size="sm" variant="outline">
                            <Phone className="h-4 w-4" />
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="knowledge" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                title: 'Appointment Scheduling',
                category: 'Procedures',
                articles: 12,
                lastUpdated: '2025-01-02'
              },
              {
                title: 'Billing & Insurance',
                category: 'Financial',
                articles: 8,
                lastUpdated: '2025-01-01'
              },
              {
                title: 'Postpartum Care Services',
                category: 'Services',
                articles: 15,
                lastUpdated: '2024-12-30'
              },
              {
                title: 'Technical Support',
                category: 'Technical',
                articles: 6,
                lastUpdated: '2024-12-28'
              },
              {
                title: 'Emergency Procedures',
                category: 'Medical',
                articles: 4,
                lastUpdated: '2024-12-25'
              },
              {
                title: 'Client Portal Help',
                category: 'Portal',
                articles: 9,
                lastUpdated: '2024-12-20'
              }
            ].map((section, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{section.title}</h4>
                      <Badge variant="outline">{section.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{section.articles} articles</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Updated: {section.lastUpdated}</span>
                      <Button size="sm" variant="outline">
                        <FileText className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Volume by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Appointment', count: 12, percentage: 35 },
                    { category: 'Billing', count: 8, percentage: 25 },
                    { category: 'Technical', count: 6, percentage: 20 },
                    { category: 'General', count: 4, percentage: 12 },
                    { category: 'Medical', count: 3, percentage: 8 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.category}</span>
                        <span className="text-sm text-gray-600">{item.count} tickets</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-[#3B2352] h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resolution Time Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { timeRange: '< 1 hour', count: 8, percentage: 25 },
                    { timeRange: '1-4 hours', count: 12, percentage: 35 },
                    { timeRange: '4-24 hours', count: 10, percentage: 30 },
                    { timeRange: '1-3 days', count: 3, percentage: 10 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{item.timeRange}</span>
                        <span className="text-sm text-gray-600">{item.count} tickets</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Emily Rodriguez',
                role: 'Senior Support Agent',
                activeTickets: 8,
                resolvedThisWeek: 23,
                avgRating: 4.9,
                status: 'online'
              },
              {
                name: 'Michael Chen',
                role: 'Billing Specialist',
                activeTickets: 5,
                resolvedThisWeek: 18,
                avgRating: 4.8,
                status: 'online'
              },
              {
                name: 'Sarah Wilson',
                role: 'Technical Support',
                activeTickets: 3,
                resolvedThisWeek: 15,
                avgRating: 4.7,
                status: 'away'
              },
              {
                name: 'Dr. Sarah Chen',
                role: 'Medical Liaison',
                activeTickets: 2,
                resolvedThisWeek: 8,
                avgRating: 5.0,
                status: 'online'
              }
            ].map((agent, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-[#D7C7ED] text-[#3B2352]">
                          {agent.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-semibold">{agent.name}</h4>
                        <p className="text-sm text-gray-600">{agent.role}</p>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={agent.status === 'online' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                      >
                        {agent.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Active Tickets</p>
                        <p className="font-medium">{agent.activeTickets}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Resolved This Week</p>
                        <p className="font-medium">{agent.resolvedThisWeek}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">{agent.avgRating}/5</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Message
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Ticket Dialog */}
      <Dialog open={isAddTicketOpen} onOpenChange={setIsAddTicketOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Support Ticket</DialogTitle>
            <DialogDescription>
              Create a support ticket for client assistance
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ticketSubject">Subject *</Label>
              <Input
                id="ticketSubject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                placeholder="Brief description of the issue"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={newTicket.client_name}
                  onChange={(e) => setNewTicket({...newTicket, client_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Client Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newTicket.client_email}
                  onChange={(e) => setNewTicket({...newTicket, client_email: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({...newTicket, priority: value as Ticket['priority']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value as Ticket['category']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="appointment">Appointment</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="clientPhone">Phone (Optional)</Label>
                <Input
                  id="clientPhone"
                  value={newTicket.client_phone}
                  onChange={(e) => setNewTicket({...newTicket, client_phone: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                placeholder="Detailed description of the issue or request..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddTicketOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTicket} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
                Create Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Ticket Details Modal */}
      <Dialog open={isTicketModalOpen} onOpenChange={setIsTicketModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ticket #{selectedTicket?.id} - {selectedTicket?.subject}</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Badge className={statusColors[selectedTicket.status]}>
                          {statusNames[selectedTicket.status]}
                        </Badge>
                        <Badge className={priorityColors[selectedTicket.priority]}>
                          {priorityNames[selectedTicket.priority]}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>Client:</strong> {selectedTicket.client_name}</p>
                        <p><strong>Email:</strong> {selectedTicket.client_email}</p>
                        {selectedTicket.client_phone && (
                          <p><strong>Phone:</strong> {selectedTicket.client_phone}</p>
                        )}
                        <p><strong>Category:</strong> {selectedTicket.category}</p>
                        <p><strong>Assigned:</strong> {selectedTicket.assigned_to || 'Unassigned'}</p>
                        <p><strong>Created:</strong> {new Date(selectedTicket.created_date).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="col-span-2">
                  <CardContent className="pt-4">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Update Status</h4>
                      <Select
                        value={selectedTicket.status}
                        onValueChange={(newStatus) => {
                          updateTicketStatus(selectedTicket.id, newStatus as Ticket['status']);
                          setSelectedTicket({...selectedTicket, status: newStatus as Ticket['status']});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Phone className="h-4 w-4 mr-2" />
                          Call Client
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Mail className="h-4 w-4 mr-2" />
                          Send Email
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Conversation History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {selectedTicket.messages.map((message) => (
                      <div key={message.id} className={`flex gap-3 ${message.author_type === 'agent' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] p-3 rounded-lg ${
                          message.author_type === 'agent' ? 'bg-[#3B2352] text-white' :
                          message.author_type === 'system' ? 'bg-gray-100 text-gray-700' :
                          'bg-blue-50 text-gray-900'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{message.author}</span>
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-4 flex gap-2">
                    <Textarea
                      placeholder="Type your response..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      rows={3}
                      className="flex-1"
                    />
                    <Button 
                      onClick={addTicketMessage}
                      className="bg-[#3B2352] hover:bg-[#3B2352]/90"
                      disabled={!newMessage.trim()}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Reply
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}