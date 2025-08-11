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
  Mail, 
  TrendingUp, 
  Users, 
  Eye, 
  Send, 
  Plus, 
  Edit, 
  Calendar,
  RefreshCw,
  Download,
  BarChart3,
  Target,
  MessageSquare,
  Share2,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Play,
  Pause,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  type: 'email' | 'social' | 'content' | 'automation';
  status: 'draft' | 'active' | 'paused' | 'completed' | 'scheduled';
  subject?: string;
  content: string;
  target_audience: string;
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  created_date: string;
  send_date?: string;
  budget?: number;
  spent?: number;
  channels: string[];
}

interface MarketingMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalRecipients: number;
  averageOpenRate: number;
  averageClickRate: number;
  totalConversions: number;
  monthlyBudget: number;
  monthlySpent: number;
}

export function MarketingDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [isAddCampaignOpen, setIsAddCampaignOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'email' as Campaign['type'],
    subject: '',
    content: '',
    target_audience: 'All Clients',
    send_date: '',
    budget: 0,
    channels: ['email']
  });

  useEffect(() => {
    loadMarketingData();
  }, []);

  const loadMarketingData = async () => {
    setIsLoading(true);
    try {
      // Generate comprehensive mock campaign data
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'New Parent Welcome Series',
          type: 'automation',
          status: 'active',
          subject: 'Welcome to Your Postpartum Journey',
          content: 'Automated email series for new parents covering postpartum care, breastfeeding tips, and support resources.',
          target_audience: 'New Clients',
          recipients: 156,
          sent: 156,
          opened: 124,
          clicked: 89,
          converted: 23,
          created_date: '2024-12-15',
          budget: 500,
          spent: 245,
          channels: ['email', 'social']
        },
        {
          id: '2',
          name: 'Holiday Postpartum Care Special',
          type: 'email',
          status: 'completed',
          subject: 'Special Holiday Rates for Postpartum Care',
          content: 'Holiday promotion offering 15% off postpartum care packages for families during the holiday season.',
          target_audience: 'Active Clients',
          recipients: 89,
          sent: 89,
          opened: 67,
          clicked: 34,
          converted: 12,
          created_date: '2024-12-01',
          send_date: '2024-12-10',
          budget: 300,
          spent: 300,
          channels: ['email']
        },
        {
          id: '3',
          name: 'Lactation Support Awareness',
          type: 'content',
          status: 'active',
          content: 'Educational content series about lactation support benefits, featuring client testimonials and expert tips.',
          target_audience: 'Expecting Mothers',
          recipients: 234,
          sent: 180,
          opened: 156,
          clicked: 78,
          converted: 19,
          created_date: '2024-12-20',
          budget: 800,
          spent: 456,
          channels: ['social', 'content']
        },
        {
          id: '4',
          name: 'Monthly Newsletter - January',
          type: 'email',
          status: 'scheduled',
          subject: 'January Health & Wellness Tips for New Parents',
          content: 'Monthly newsletter featuring health tips, upcoming events, client success stories, and educational resources.',
          target_audience: 'All Subscribers',
          recipients: 312,
          sent: 0,
          opened: 0,
          clicked: 0,
          converted: 0,
          created_date: '2025-01-01',
          send_date: '2025-01-15',
          budget: 200,
          spent: 0,
          channels: ['email']
        },
        {
          id: '5',
          name: 'Social Media Birth Story Campaign',
          type: 'social',
          status: 'active',
          content: 'Social media campaign featuring inspiring birth stories and postpartum journeys from our clients.',
          target_audience: 'General Public',
          recipients: 1200,
          sent: 856,
          opened: 645,
          clicked: 123,
          converted: 34,
          created_date: '2024-12-28',
          budget: 600,
          spent: 378,
          channels: ['facebook', 'instagram', 'twitter']
        }
      ];

      setCampaigns(mockCampaigns);
    } catch (error) {
      toast.error("Failed to load marketing data");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCampaign = async () => {
    if (!newCampaign.name || !newCampaign.content) {
      toast.error("Please fill in required fields");
      return;
    }

    const campaign: Campaign = {
      id: Date.now().toString(),
      ...newCampaign,
      status: 'draft',
      recipients: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      converted: 0,
      created_date: new Date().toISOString().split('T')[0],
      spent: 0
    };

    setCampaigns(prev => [campaign, ...prev]);
    setIsAddCampaignOpen(false);
    setNewCampaign({
      name: '',
      type: 'email',
      subject: '',
      content: '',
      target_audience: 'All Clients',
      send_date: '',
      budget: 0,
      channels: ['email']
    });
    toast.success("Campaign created successfully!");
  };

  const updateCampaignStatus = (campaignId: string, newStatus: Campaign['status']) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        return { ...campaign, status: newStatus };
      }
      return campaign;
    }));
    
    toast.success(`Campaign ${newStatus.replace('_', ' ').toUpperCase()}`);
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         campaign.target_audience.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const marketingMetrics: MarketingMetrics = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'active').length,
    totalRecipients: campaigns.reduce((sum, c) => sum + c.recipients, 0),
    averageOpenRate: campaigns.length > 0 ? 
      campaigns.reduce((sum, c) => sum + (c.sent > 0 ? (c.opened / c.sent) * 100 : 0), 0) / campaigns.length : 0,
    averageClickRate: campaigns.length > 0 ? 
      campaigns.reduce((sum, c) => sum + (c.opened > 0 ? (c.clicked / c.opened) * 100 : 0), 0) / campaigns.length : 0,
    totalConversions: campaigns.reduce((sum, c) => sum + c.converted, 0),
    monthlyBudget: 2500,
    monthlySpent: campaigns.reduce((sum, c) => sum + (c.spent || 0), 0)
  };

  const statusColors = {
    draft: 'bg-gray-500',
    active: 'bg-green-500',
    paused: 'bg-yellow-500',
    completed: 'bg-blue-500',
    scheduled: 'bg-purple-500'
  };

  const statusNames = {
    draft: 'Draft',
    active: 'Active',
    paused: 'Paused',
    completed: 'Completed',
    scheduled: 'Scheduled'
  };

  const typeIcons = {
    email: Mail,
    social: Share2,
    content: MessageSquare,
    automation: Target
  };

  return (
    <div className="space-y-6">
      {/* Marketing Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
            Marketing Campaign Management
          </h2>
          <p className="text-gray-600">Create, manage, and analyze your healthcare marketing campaigns</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadMarketingData} variant="outline" size="sm" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => toast.success("Export feature coming soon!")} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Marketing Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-[#3B2352]">{marketingMetrics.totalCampaigns}</p>
                <p className="text-sm text-green-600">{marketingMetrics.activeCampaigns} active</p>
              </div>
              <Target className="h-8 w-8 text-[#3B2352]" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reach</p>
                <p className="text-2xl font-bold text-blue-600">{marketingMetrics.totalRecipients.toLocaleString()}</p>
                <p className="text-sm text-blue-600">recipients</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Open Rate</p>
                <p className="text-2xl font-bold text-green-600">{marketingMetrics.averageOpenRate.toFixed(1)}%</p>
                <p className="text-sm text-green-600">industry: 21.3%</p>
              </div>
              <Eye className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversions</p>
                <p className="text-2xl font-bold text-purple-600">{marketingMetrics.totalConversions}</p>
                <p className="text-sm text-purple-600">+15% vs last month</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Monthly Marketing Budget</span>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              ${marketingMetrics.monthlySpent.toLocaleString()} / ${marketingMetrics.monthlyBudget.toLocaleString()}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Progress 
              value={(marketingMetrics.monthlySpent / marketingMetrics.monthlyBudget) * 100} 
              className="h-3"
            />
            <div className="flex justify-between text-sm text-gray-600">
              <span>{((marketingMetrics.monthlySpent / marketingMetrics.monthlyBudget) * 100).toFixed(1)}% of budget used</span>
              <span>${(marketingMetrics.monthlyBudget - marketingMetrics.monthlySpent).toLocaleString()} remaining</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 max-w-md">
            <Input
              placeholder="Search campaigns, content, or audience..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={() => setIsAddCampaignOpen(true)} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Marketing Tabs */}
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Campaigns
          </TabsTrigger>
          <TabsTrigger value="automation" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Automation
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="templates" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-[#3B2352]" />
              </div>
            ) : (
              filteredCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {React.createElement(typeIcons[campaign.type], { className: "h-5 w-5 text-[#3B2352]" })}
                            <h3 className="font-semibold text-lg">{campaign.name}</h3>
                          </div>
                          <Badge className={statusColors[campaign.status]}>
                            {statusNames[campaign.status]}
                          </Badge>
                          <Badge variant="outline">{campaign.type.toUpperCase()}</Badge>
                        </div>
                        
                        {campaign.subject && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Subject:</strong> {campaign.subject}
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{campaign.content}</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Audience</p>
                            <p className="font-medium">{campaign.target_audience}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Recipients</p>
                            <p className="font-medium">{campaign.recipients.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Open Rate</p>
                            <p className="font-medium text-green-600">
                              {campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : 0}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Click Rate</p>
                            <p className="font-medium text-blue-600">
                              {campaign.opened > 0 ? ((campaign.clicked / campaign.opened) * 100).toFixed(1) : 0}%
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Conversions</p>
                            <p className="font-medium text-purple-600">{campaign.converted}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          {campaign.channels.map(channel => (
                            <Badge key={channel} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedCampaign(campaign);
                            setIsCampaignModalOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        {campaign.status === 'active' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateCampaignStatus(campaign.id, 'paused')}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}
                        {campaign.status === 'paused' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateCampaignStatus(campaign.id, 'active')}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}
                        {campaign.status === 'draft' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateCampaignStatus(campaign.id, 'active')}
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Marketing Automation Workflows</CardTitle>
              <CardDescription>Automated email sequences and trigger-based campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    name: 'New Client Onboarding',
                    trigger: 'Client Registration',
                    emails: 5,
                    active: true,
                    subscribers: 45
                  },
                  {
                    name: 'Post-Service Follow-up',
                    trigger: 'Service Completion',
                    emails: 3,
                    active: true,
                    subscribers: 89
                  },
                  {
                    name: 'Birthday & Anniversary',
                    trigger: 'Date-based',
                    emails: 2,
                    active: false,
                    subscribers: 156
                  },
                  {
                    name: 'Re-engagement Series',
                    trigger: 'Inactivity (30 days)',
                    emails: 4,
                    active: true,
                    subscribers: 23
                  }
                ].map((workflow, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{workflow.name}</h4>
                        <p className="text-sm text-gray-600">
                          Trigger: {workflow.trigger} • {workflow.emails} emails • {workflow.subscribers} subscribers
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={workflow.active ? 'bg-green-500' : 'bg-gray-500'}>
                          {workflow.active ? 'Active' : 'Inactive'}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.slice(0, 5).map((campaign) => {
                    const openRate = campaign.sent > 0 ? (campaign.opened / campaign.sent) * 100 : 0;
                    return (
                      <div key={campaign.id} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-sm">{campaign.name}</span>
                          <span className="text-sm text-gray-600">{openRate.toFixed(1)}% open rate</span>
                        </div>
                        <Progress value={openRate} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Channel Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { channel: 'Email', campaigns: 3, recipients: 556, conversions: 47 },
                    { channel: 'Social Media', campaigns: 2, recipients: 1856, conversions: 53 },
                    { channel: 'Content Marketing', campaigns: 1, recipients: 234, conversions: 19 },
                    { channel: 'Automation', campaigns: 1, recipients: 156, conversions: 23 }
                  ].map((channel, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="font-medium">{channel.channel}</span>
                        <span className="text-sm text-gray-600">
                          {channel.conversions} conversions ({channel.campaigns} campaigns)
                        </span>
                      </div>
                      <Progress 
                        value={(channel.conversions / marketingMetrics.totalConversions) * 100} 
                        className="h-2" 
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                name: 'Welcome Email',
                type: 'Email Template',
                description: 'Welcome new clients to your healthcare services',
                category: 'Onboarding'
              },
              {
                name: 'Service Reminder',
                type: 'Email Template',
                description: 'Remind clients of upcoming appointments',
                category: 'Appointments'
              },
              {
                name: 'Health Tips Newsletter',
                type: 'Newsletter Template',
                description: 'Monthly health and wellness tips for parents',
                category: 'Education'
              },
              {
                name: 'Birth Announcement',
                type: 'Social Media Template',
                description: 'Celebrate client births on social media',
                category: 'Social'
              },
              {
                name: 'Service Review Request',
                type: 'Email Template',
                description: 'Request reviews after service completion',
                category: 'Follow-up'
              },
              {
                name: 'Holiday Greetings',
                type: 'Email Template',
                description: 'Seasonal greetings and special offers',
                category: 'Seasonal'
              }
            ].map((template, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">{template.name}</h4>
                      <Badge variant="outline">{template.category}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{template.type}</span>
                      <Button size="sm" variant="outline">
                        Use Template
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Campaign Dialog */}
      <Dialog open={isAddCampaignOpen} onOpenChange={setIsAddCampaignOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Campaign</DialogTitle>
            <DialogDescription>
              Design and launch your healthcare marketing campaign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="campaignName">Campaign Name *</Label>
              <Input
                id="campaignName"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                placeholder="e.g., Spring Wellness Newsletter"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="campaignType">Campaign Type</Label>
                <Select value={newCampaign.type} onValueChange={(value) => setNewCampaign({...newCampaign, type: value as Campaign['type']})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email Campaign</SelectItem>
                    <SelectItem value="social">Social Media</SelectItem>
                    <SelectItem value="content">Content Marketing</SelectItem>
                    <SelectItem value="automation">Automation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Select value={newCampaign.target_audience} onValueChange={(value) => setNewCampaign({...newCampaign, target_audience: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All Clients">All Clients</SelectItem>
                    <SelectItem value="New Clients">New Clients</SelectItem>
                    <SelectItem value="Active Clients">Active Clients</SelectItem>
                    <SelectItem value="Expecting Mothers">Expecting Mothers</SelectItem>
                    <SelectItem value="New Parents">New Parents</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newCampaign.type === 'email' && (
              <div>
                <Label htmlFor="subject">Email Subject</Label>
                <Input
                  id="subject"
                  value={newCampaign.subject}
                  onChange={(e) => setNewCampaign({...newCampaign, subject: e.target.value})}
                  placeholder="Compelling subject line..."
                />
              </div>
            )}
            <div>
              <Label htmlFor="content">Campaign Content *</Label>
              <Textarea
                id="content"
                value={newCampaign.content}
                onChange={(e) => setNewCampaign({...newCampaign, content: e.target.value})}
                placeholder="Your campaign message..."
                rows={6}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sendDate">Send Date (Optional)</Label>
                <Input
                  id="sendDate"
                  type="datetime-local"
                  value={newCampaign.send_date}
                  onChange={(e) => setNewCampaign({...newCampaign, send_date: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="budget">Budget ($)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={newCampaign.budget}
                  onChange={(e) => setNewCampaign({...newCampaign, budget: parseFloat(e.target.value) || 0})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddCampaignOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCampaign} className="bg-[#3B2352] hover:bg-[#3B2352]/90">
                Create Campaign
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Campaign Details Modal */}
      <Dialog open={isCampaignModalOpen} onOpenChange={setIsCampaignModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Campaign Details</DialogTitle>
          </DialogHeader>
          {selectedCampaign && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">{selectedCampaign.name}</h3>
                      <div className="flex gap-2">
                        <Badge className={statusColors[selectedCampaign.status]}>
                          {statusNames[selectedCampaign.status]}
                        </Badge>
                        <Badge variant="outline">{selectedCampaign.type.toUpperCase()}</Badge>
                      </div>
                      {selectedCampaign.subject && (
                        <p><strong>Subject:</strong> {selectedCampaign.subject}</p>
                      )}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <p><strong>Audience:</strong> {selectedCampaign.target_audience}</p>
                        <p><strong>Recipients:</strong> {selectedCampaign.recipients.toLocaleString()}</p>
                        <p><strong>Sent:</strong> {selectedCampaign.sent}</p>
                        <p><strong>Opened:</strong> {selectedCampaign.opened}</p>
                        <p><strong>Clicked:</strong> {selectedCampaign.clicked}</p>
                        <p><strong>Converted:</strong> {selectedCampaign.converted}</p>
                      </div>
                      <div className="mt-3">
                        <p className="font-medium text-sm">Content:</p>
                        <p className="text-sm bg-gray-50 p-2 rounded max-h-32 overflow-y-auto">{selectedCampaign.content}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <h4 className="font-semibold mb-3">Performance Metrics</h4>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Open Rate</span>
                          <span className="text-sm font-medium">
                            {selectedCampaign.sent > 0 ? ((selectedCampaign.opened / selectedCampaign.sent) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={selectedCampaign.sent > 0 ? (selectedCampaign.opened / selectedCampaign.sent) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Click Rate</span>
                          <span className="text-sm font-medium">
                            {selectedCampaign.opened > 0 ? ((selectedCampaign.clicked / selectedCampaign.opened) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={selectedCampaign.opened > 0 ? (selectedCampaign.clicked / selectedCampaign.opened) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm">Conversion Rate</span>
                          <span className="text-sm font-medium">
                            {selectedCampaign.recipients > 0 ? ((selectedCampaign.converted / selectedCampaign.recipients) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <Progress 
                          value={selectedCampaign.recipients > 0 ? (selectedCampaign.converted / selectedCampaign.recipients) * 100 : 0} 
                          className="h-2"
                        />
                      </div>
                    </div>
                    {selectedCampaign.budget && (
                      <div className="mt-4 p-3 bg-blue-50 rounded">
                        <p className="text-sm"><strong>Budget:</strong> ${selectedCampaign.budget.toLocaleString()}</p>
                        <p className="text-sm"><strong>Spent:</strong> ${(selectedCampaign.spent || 0).toLocaleString()}</p>
                        <p className="text-sm"><strong>Remaining:</strong> ${((selectedCampaign.budget || 0) - (selectedCampaign.spent || 0)).toLocaleString()}</p>
                      </div>
                    )}
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