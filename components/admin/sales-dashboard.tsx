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
import { Progress } from "@/components/ui/progress";
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Plus, 
  Edit, 
  Eye, 
  Phone, 
  Mail, 
  Calendar,
  RefreshCw,
  Filter,
  Download,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  client_name: string;
  client_email: string;
  amount: number;
  stage: 'lead' | 'qualified' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';
  probability: number;
  expected_close_date: string;
  created_date: string;
  last_activity: string;
  notes: string;
  contact_person: string;
  phone: string;
  service_type: string;
}

interface SalesMetrics {
  totalDeals: number;
  totalValue: number;
  wonDeals: number;
  lostDeals: number;
  averageDealSize: number;
  conversionRate: number;
  monthlyTarget: number;
  monthlyActual: number;
}

export function SalesDashboard() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('all');
  const [newDeal, setNewDeal] = useState({
    title: '',
    client_name: '',
    client_email: '',
    amount: 0,
    stage: 'lead' as Deal['stage'],
    probability: 10,
    expected_close_date: '',
    notes: '',
    contact_person: '',
    phone: '',
    service_type: 'Postpartum Care'
  });

  useEffect(() => {
    loadSalesData();
  }, []);

  const loadSalesData = async () => {
    setIsLoading(true);
    try {
      // Load contacts for potential deals
      const contactsResponse = await fetch('/api/crm/contacts');
      let contacts = [];
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        contacts = contactsData.data || [];
      }

      // Generate comprehensive mock deals data
      const mockDeals: Deal[] = [
        {
          id: '1',
          title: 'Postpartum Care Package - Johnson Family',
          client_name: 'Sarah Johnson',
          client_email: 'sarah.johnson@email.com',
          amount: 2500,
          stage: 'proposal',
          probability: 75,
          expected_close_date: '2025-01-15',
          created_date: '2024-12-20',
          last_activity: '2025-01-03',
          notes: 'Interested in 6-week postpartum care package. Budget approved.',
          contact_person: 'Sarah Johnson',
          phone: '+1-555-0123',
          service_type: 'Postpartum Care'
        },
        {
          id: '2',
          title: 'Lactation Support Services - Miller Family',
          client_name: 'Emma Miller',
          client_email: 'emma.miller@email.com',
          amount: 1200,
          stage: 'qualified',
          probability: 60,
          expected_close_date: '2025-01-20',
          created_date: '2024-12-28',
          last_activity: '2025-01-02',
          notes: 'First-time mother, needs comprehensive lactation support.',
          contact_person: 'Emma Miller',
          phone: '+1-555-0456',
          service_type: 'Lactation Support'
        },
        {
          id: '3',
          title: 'Doula Services - Davis Family',
          client_name: 'Jennifer Davis',
          client_email: 'jennifer.davis@email.com',
          amount: 3200,
          stage: 'negotiation',
          probability: 85,
          expected_close_date: '2025-01-10',
          created_date: '2024-12-15',
          last_activity: '2025-01-03',
          notes: 'Birth doula services for February delivery. Reviewing contract.',
          contact_person: 'Jennifer Davis',
          phone: '+1-555-0789',
          service_type: 'Doula Services'
        },
        {
          id: '4',
          title: 'Comprehensive Care Plan - Wilson Family',
          client_name: 'Lisa Wilson',
          client_email: 'lisa.wilson@email.com',
          amount: 4500,
          stage: 'closed_won',
          probability: 100,
          expected_close_date: '2024-12-30',
          created_date: '2024-12-01',
          last_activity: '2024-12-30',
          notes: 'Full service package including birth and postpartum care. Contract signed.',
          contact_person: 'Lisa Wilson',
          phone: '+1-555-0321',
          service_type: 'Comprehensive Care'
        },
        {
          id: '5',
          title: 'Prenatal Classes - Rodriguez Family',
          client_name: 'Maria Rodriguez',
          client_email: 'maria.rodriguez@email.com',
          amount: 800,
          stage: 'lead',
          probability: 25,
          expected_close_date: '2025-02-01',
          created_date: '2025-01-02',
          last_activity: '2025-01-02',
          notes: 'Inquired about prenatal education classes. Following up this week.',
          contact_person: 'Maria Rodriguez',
          phone: '+1-555-0654',
          service_type: 'Prenatal Education'
        }
      ];

      setDeals(mockDeals);
    } catch (error) {
      toast.error("Failed to load sales data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDeal = async () => {
    if (!newDeal.title || !newDeal.client_name || !newDeal.amount) {
      toast.error("Please fill in required fields");
      return;
    }

    const deal: Deal = {
      id: Date.now().toString(),
      ...newDeal,
      created_date: new Date().toISOString().split('T')[0],
      last_activity: new Date().toISOString().split('T')[0]
    };

    setDeals(prev => [deal, ...prev]);
    setIsAddDealOpen(false);
    setNewDeal({
      title: '',
      client_name: '',
      client_email: '',
      amount: 0,
      stage: 'lead',
      probability: 10,
      expected_close_date: '',
      notes: '',
      contact_person: '',
      phone: '',
      service_type: 'Postpartum Care'
    });
    toast.success("Deal added successfully!");
  };

  const updateDealStage = (dealId: string, newStage: Deal['stage']) => {
    setDeals(prev => prev.map(deal => {
      if (deal.id === dealId) {
        const probability = {
          lead: 10,
          qualified: 35,
          proposal: 65,
          negotiation: 80,
          closed_won: 100,
          closed_lost: 0
        }[newStage];
        
        return {
          ...deal,
          stage: newStage,
          probability,
          last_activity: new Date().toISOString().split('T')[0]
        };
      }
      return deal;
    }));
    
    toast.success(`Deal moved to ${newStage.replace('_', ' ').toUpperCase()}`);
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.client_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         deal.service_type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage = stageFilter === 'all' || deal.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const salesMetrics: SalesMetrics = {
    totalDeals: deals.length,
    totalValue: deals.reduce((sum, deal) => sum + deal.amount, 0),
    wonDeals: deals.filter(deal => deal.stage === 'closed_won').length,
    lostDeals: deals.filter(deal => deal.stage === 'closed_lost').length,
    averageDealSize: deals.length > 0 ? deals.reduce((sum, deal) => sum + deal.amount, 0) / deals.length : 0,
    conversionRate: deals.length > 0 ? (deals.filter(deal => deal.stage === 'closed_won').length / deals.length) * 100 : 0,
    monthlyTarget: 15000,
    monthlyActual: deals.filter(deal => deal.stage === 'closed_won').reduce((sum, deal) => sum + deal.amount, 0)
  };

  const stageColors = {
    lead: 'bg-gray-500',
    qualified: 'bg-blue-500',
    proposal: 'bg-yellow-500',
    negotiation: 'bg-orange-500',
    closed_won: 'bg-green-500',
    closed_lost: 'bg-red-500'
  };

  const stageNames = {
    lead: 'Lead',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    closed_won: 'Closed Won',
    closed_lost: 'Closed Lost'
  };

  return (
    <div className="space-y-6">
      {/* Sales Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
            Sales Pipeline Management
          </h2>
          <p className="text-gray-600">Track deals and optimize your healthcare sales process</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadSalesData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => toast.success("Export feature coming soon!")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pipeline Value</p>
                <p className="text-2xl font-bold text-[#3B2352]">
                  ${salesMetrics.totalValue.toLocaleString()}
                </p>
                <p className="text-sm text-green-600">+12% vs last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-[#3B2352]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-blue-600">{salesMetrics.totalDeals}</p>
                <p className="text-sm text-blue-600">{salesMetrics.wonDeals} won this month</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-green-600">{salesMetrics.conversionRate.toFixed(1)}%</p>
                <p className="text-sm text-green-600">Above industry avg</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Deal Size</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${salesMetrics.averageDealSize.toFixed(0)}
                </p>
                <p className="text-sm text-purple-600">+8% growth</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Target Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Monthly Sales Target</span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              ${salesMetrics.monthlyActual.toLocaleString()} / ${salesMetrics.monthlyTarget.toLocaleString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress 
              value={(salesMetrics.monthlyActual / salesMetrics.monthlyTarget) * 100} 
              className="h-3"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{((salesMetrics.monthlyActual / salesMetrics.monthlyTarget) * 100).toFixed(1)}% of target achieved</span>
              <span>${(salesMetrics.monthlyTarget - salesMetrics.monthlyActual).toLocaleString()} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search deals, clients, or services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddDealOpen(true)} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Deal
        </Button>
      </div>

      {/* Sales Pipeline Tabs */}
      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pipeline" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Pipeline View
          </TabsTrigger>
          <TabsTrigger value="kanban" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Kanban Board
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-[#3B2352]" />
              </div>
            ) : (
              filteredDeals.map((deal) => (
                <Card key={deal.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{deal.title}</h3>
                          <Badge className={stageColors[deal.stage]}>
                            {stageNames[deal.stage]}
                          </Badge>
                          <Badge variant="outline">{deal.service_type}</Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Client:</strong> {deal.client_name}</p>
                            <p><strong>Contact:</strong> {deal.contact_person}</p>
                          </div>
                          <div>
                            <p><strong>Value:</strong> ${deal.amount.toLocaleString()}</p>
                            <p><strong>Probability:</strong> {deal.probability}%</p>
                          </div>
                          <div>
                            <p><strong>Expected Close:</strong> {new Date(deal.expected_close_date).toLocaleDateString()}</p>
                            <p><strong>Last Activity:</strong> {new Date(deal.last_activity).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p><strong>Phone:</strong> {deal.phone}</p>
                            <p><strong>Email:</strong> {deal.client_email}</p>
                          </div>
                        </div>
                        {deal.notes && (
                          <p className="mt-2 text-sm bg-gray-50 p-2 rounded">{deal.notes}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDeal(deal);
                            setIsDealModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4" />
                        </Button>
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

        <TabsContent value="kanban" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(stageNames).map(([stage, name]) => (
              <Card key={stage} className="min-h-[400px]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{name}</span>
                    <Badge variant="secondary">
                      {deals.filter(deal => deal.stage === stage).length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {deals
                    .filter(deal => deal.stage === stage)
                    .map(deal => (
                      <Card key={deal.id} className="p-3 cursor-pointer hover:shadow-sm transition-shadow">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm leading-tight">{deal.title}</h4>
                          <p className="text-xs text-gray-600">{deal.client_name}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-green-600">
                              ${deal.amount.toLocaleString()}
                            </span>
                            <span className="text-xs text-gray-500">
                              {deal.probability}%
                            </span>
                          </div>
                          <div className="flex gap-1 mt-2">
                            {stage !== 'closed_won' && stage !== 'closed_lost' && (
                              <Select
                                value={deal.stage}
                                onValueChange={(newStage) => updateDealStage(deal.id, newStage as Deal['stage'])}
                              >
                                <SelectTrigger className="h-6 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="lead">Lead</SelectItem>
                                  <SelectItem value="qualified">Qualified</SelectItem>
                                  <SelectItem value="proposal">Proposal</SelectItem>
                                  <SelectItem value="negotiation">Negotiation</SelectItem>
                                  <SelectItem value="closed_won">Close Won</SelectItem>
                                  <SelectItem value="closed_lost">Close Lost</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Funnel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stageNames).map(([stage, name]) => {
                    const stageDeals = deals.filter(deal => deal.stage === stage);
                    const percentage = deals.length > 0 ? (stageDeals.length / deals.length) * 100 : 0;
                    return (
                      <div key={stage} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{name}</span>
                          <span className="text-sm text-gray-600">
                            {stageDeals.length} deals (${stageDeals.reduce((sum, deal) => sum + deal.amount, 0).toLocaleString()})
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Type Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Postpartum Care', 'Lactation Support', 'Doula Services', 'Comprehensive Care', 'Prenatal Education'].map(service => {
                    const serviceDeals = deals.filter(deal => deal.service_type === service);
                    const serviceValue = serviceDeals.reduce((sum, deal) => sum + deal.amount, 0);
                    const percentage = salesMetrics.totalValue > 0 ? (serviceValue / salesMetrics.totalValue) * 100 : 0;
                    
                    return (
                      <div key={service} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{service}</span>
                          <span className="text-sm text-gray-600">
                            ${serviceValue.toLocaleString()} ({serviceDeals.length} deals)
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Deal Dialog */}
      <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Deal</DialogTitle>
            <DialogDescription>
              Create a new sales opportunity in your pipeline
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="dealTitle">Deal Title *</Label>
              <Input
                id="dealTitle"
                value={newDeal.title}
                onChange={(e) => setNewDeal({...newDeal, title: e.target.value})}
                placeholder="e.g., Postpartum Care Package - Smith Family"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name *</Label>
                <Input
                  id="clientName"
                  value={newDeal.client_name}
                  onChange={(e) => setNewDeal({...newDeal, client_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                  id="contactPerson"
                  value={newDeal.contact_person}
                  onChange={(e) => setNewDeal({...newDeal, contact_person: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientEmail">Email</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={newDeal.client_email}
                  onChange={(e) => setNewDeal({...newDeal, client_email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newDeal.phone}
                  onChange={(e) => setNewDeal({...newDeal, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="amount">Deal Value ($) *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newDeal.amount}
                  onChange={(e) => setNewDeal({...newDeal, amount: parseFloat(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label htmlFor="stage">Stage</Label>
                <Select value={newDeal.stage} onValueChange={(value) => setNewDeal({...newDeal, stage: value as Deal['stage']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lead">Lead</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="proposal">Proposal</SelectItem>
                    <SelectItem value="negotiation">Negotiation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="expectedClose">Expected Close Date</Label>
                <Input
                  id="expectedClose"
                  type="date"
                  value={newDeal.expected_close_date}
                  onChange={(e) => setNewDeal({...newDeal, expected_close_date: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="serviceType">Service Type</Label>
              <Select value={newDeal.service_type} onValueChange={(value) => setNewDeal({...newDeal, service_type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Postpartum Care">Postpartum Care</SelectItem>
                  <SelectItem value="Lactation Support">Lactation Support</SelectItem>
                  <SelectItem value="Doula Services">Doula Services</SelectItem>
                  <SelectItem value="Comprehensive Care">Comprehensive Care</SelectItem>
                  <SelectItem value="Prenatal Education">Prenatal Education</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={newDeal.notes}
                onChange={(e) => setNewDeal({...newDeal, notes: e.target.value})}
                placeholder="Additional details about this opportunity..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddDealOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddDeal} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
                Add Deal
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deal Details Modal */}
      <Dialog open={isDealModalOpen} onOpenChange={setIsDealModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Deal Details</DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{selectedDeal.title}</h3>
                      <div className="flex gap-2">
                        <Badge className={stageColors[selectedDeal.stage]}>
                          {stageNames[selectedDeal.stage]}
                        </Badge>
                        <Badge variant="outline">{selectedDeal.service_type}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Client:</strong> {selectedDeal.client_name}</p>
                        <p><strong>Contact:</strong> {selectedDeal.contact_person}</p>
                        <p><strong>Email:</strong> {selectedDeal.client_email}</p>
                        <p><strong>Phone:</strong> {selectedDeal.phone}</p>
                        <p><strong>Value:</strong> ${selectedDeal.amount.toLocaleString()}</p>
                        <p><strong>Probability:</strong> {selectedDeal.probability}%</p>
                        <p><strong>Expected Close:</strong> {new Date(selectedDeal.expected_close_date).toLocaleDateString()}</p>
                        <p><strong>Created:</strong> {new Date(selectedDeal.created_date).toLocaleDateString()}</p>
                      </div>
                      {selectedDeal.notes && (
                        <div className="mt-3">
                          <p className="font-medium text-sm">Notes:</p>
                          <p className="text-sm bg-gray-50 p-2 rounded">{selectedDeal.notes}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Phone className="h-4 w-4 mr-2" />
                        Call Client
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule Meeting
                      </Button>
                      <Button size="sm" variant="outline" className="w-full justify-start">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Deal
                      </Button>
                    </div>
                    <div className="mt-4">
                      <Label>Update Stage</Label>
                      <Select
                        value={selectedDeal.stage}
                        onValueChange={(newStage) => {
                          updateDealStage(selectedDeal.id, newStage as Deal['stage']);
                          setSelectedDeal({...selectedDeal, stage: newStage as Deal['stage']});
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="qualified">Qualified</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="negotiation">Negotiation</SelectItem>
                          <SelectItem value="closed_won">Close Won</SelectItem>
                          <SelectItem value="closed_lost">Close Lost</SelectItem>
                        </SelectContent>
                      </Select>
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