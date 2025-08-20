'use client';

import React, { useState } from 'react';
import { 
  Container, 
  PageHeader, 
  StandardCard, 
  StatusCard, 
  StatusBadge, 
  PrimaryButton,
  SecondaryButton,
  Grid,
  Flex,
  TabNavigation,
  FormField,
  FormLabel,
  FormInput,
  FormSelect,
  FormTextarea
} from '@/components/ui';

// Mock data for service requests
const mockServiceRequests = [
  {
    id: "SR-001",
    title: "Housekeeping Service",
    description: "Need weekly housekeeping service for 2-bedroom apartment",
    status: "pending" as const,
    priority: "medium" as const,
    category: "Housekeeping",
    requestedDate: "2025-01-15",
    estimatedStart: "2025-01-22",
    assignedTo: "Sarah Johnson"
  },
  {
    id: "SR-002",
    title: "Meal Preparation",
    description: "Request for daily meal preparation and nutrition planning",
    status: "active" as const,
    priority: "high" as const,
    category: "Nutrition",
    requestedDate: "2025-01-10",
    estimatedStart: "2025-01-12",
    assignedTo: "Maria Rodriguez"
  },
  {
    id: "SR-003",
    title: "Transportation to Medical Appointments",
    description: "Need reliable transportation for weekly doctor visits",
    status: "completed" as const,
    priority: "high" as const,
    category: "Transportation",
    requestedDate: "2025-01-05",
    estimatedStart: "2025-01-08",
    assignedTo: "James Wilson"
  }
];

const requestCategories = [
  "Personal Care",
  "Housekeeping", 
  "Nutrition",
  "Transportation",
  "Medical Support",
  "Companionship",
  "Other"
];

const priorityLevels = [
  "low",
  "medium", 
  "high",
  "urgent"
];

export default function ServiceRequestsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [showNewRequestForm, setShowNewRequestForm] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    estimatedStart: ''
  });

  const handleNewRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Submit to API
    console.log('New request:', newRequest);
    setShowNewRequestForm(false);
    setNewRequest({ title: '', description: '', category: '', priority: 'medium', estimatedStart: '' });
  };

  const AllRequestsTab = () => (
    <div className="space-y-6">
      <Grid cols={1} gap="md">
        {mockServiceRequests.map((request) => (
          <ServiceRequestCard key={request.id} request={request} />
        ))}
      </Grid>
    </div>
  );

  const PendingRequestsTab = () => (
    <div className="space-y-6">
      <Grid cols={1} gap="md">
        {mockServiceRequests.filter(r => r.status === 'pending').map((request) => (
          <ServiceRequestCard key={request.id} request={request} />
        ))}
      </Grid>
    </div>
  );

  const ActiveRequestsTab = () => (
    <div className="space-y-6">
      <Grid cols={1} gap="md">
        {mockServiceRequests.filter(r => r.status === 'active').map((request) => (
          <ServiceRequestCard key={request.id} request={request} />
        ))}
      </Grid>
    </div>
  );

  const CompletedRequestsTab = () => (
    <div className="space-y-6">
      <Grid cols={1} gap="md">
        {mockServiceRequests.filter(r => r.status === 'completed').map((request) => (
          <ServiceRequestCard key={request.id} request={request} />
        ))}
      </Grid>
    </div>
  );

  return (
    <Container>
      <PageHeader 
        title="Service Requests" 
        subtitle="Create and manage your care service requests"
      >
        <PrimaryButton onClick={() => setShowNewRequestForm(true)}>
          New Request
        </PrimaryButton>
      </PageHeader>

      {/* New Request Form */}
      {showNewRequestForm && (
        <StandardCard className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-h4 font-heading text-semantic-fg">New Service Request</h3>
            <SecondaryButton 
              size="sm" 
              onClick={() => setShowNewRequestForm(false)}
            >
              Cancel
            </SecondaryButton>
          </div>
          
          <form onSubmit={handleNewRequestSubmit} className="space-y-4">
            <Grid cols={2} gap="md">
              <FormField>
                <FormLabel>Request Title</FormLabel>
                <FormInput
                  placeholder="Brief description of the service needed"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                  required
                />
              </FormField>
              
              <FormField>
                <FormLabel>Category</FormLabel>
                <FormSelect
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({...newRequest, category: e.target.value})}
                  required
                >
                  <option value="">Select a category</option>
                  {requestCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </FormSelect>
              </FormField>
            </Grid>

            <FormField>
              <FormLabel>Description</FormLabel>
              <FormTextarea
                placeholder="Detailed description of what you need..."
                rows={4}
                value={newRequest.description}
                onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                required
              />
            </FormField>

            <Grid cols={2} gap="md">
              <FormField>
                <FormLabel>Priority</FormLabel>
                <FormSelect
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest({...newRequest, priority: e.target.value as 'urgent' | 'high' | 'medium' | 'low'})}
                >
                  {priorityLevels.map(priority => (
                    <option key={priority} value={priority}>
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
              
              <FormField>
                <FormLabel>Estimated Start Date</FormLabel>
                <FormInput
                  type="date"
                  value={newRequest.estimatedStart}
                  onChange={(e) => setNewRequest({...newRequest, estimatedStart: e.target.value})}
                />
              </FormField>
            </Grid>

            <Flex justify="end" gap="md">
              <SecondaryButton 
                type="button" 
                onClick={() => setShowNewRequestForm(false)}
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton type="submit">
                Submit Request
              </PrimaryButton>
            </Flex>
          </form>
        </StandardCard>
      )}

      {/* Service Requests Tabs */}
      <TabNavigation
        tabs={[
          { id: 'all', label: 'All Requests', content: <AllRequestsTab /> },
          { id: 'pending', label: 'Pending', content: <PendingRequestsTab /> },
          { id: 'active', label: 'Active', content: <ActiveRequestsTab /> },
          { id: 'completed', label: 'Completed', content: <CompletedRequestsTab /> }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Container>
  );
}

// Service Request Card Component
interface ServiceRequestCardProps {
  request: typeof mockServiceRequests[0];
}

function ServiceRequestCard({ request }: ServiceRequestCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-semantic-danger text-white';
      case 'high': return 'bg-semantic-warning text-white';
      case 'medium': return 'bg-semantic-ring text-white';
      case 'low': return 'bg-semantic-muted text-semantic-fg';
      default: return 'bg-semantic-muted text-semantic-fg';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'active': return 'active';
      case 'completed': return 'completed';
      default: return 'pending';
    }
  };

  return (
    <StatusCard status={getStatusColor(request.status)}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="text-h4 font-heading text-semantic-fg mb-2">
              {request.title}
            </h4>
            <p className="text-body text-semantic-fg/80 mb-3">
              {request.description}
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-semantic-fg/70">
              <span>Category: {request.category}</span>
              <span>Requested: {request.requestedDate}</span>
              {request.estimatedStart && (
                <span>Start: {request.estimatedStart}</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col items-end space-y-2">
            <StatusBadge status={getStatusColor(request.status)}>
              {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
            </StatusBadge>
            <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityColor(request.priority)}`}>
              {request.priority.charAt(0).toUpperCase() + request.priority.slice(1)}
            </span>
          </div>
        </div>

        {request.assignedTo && (
          <div className="flex items-center justify-between pt-3 border-t border-semantic-border">
            <span className="text-sm text-semantic-fg/70">
              Assigned to: <span className="font-medium text-semantic-fg">{request.assignedTo}</span>
            </span>
            
            <Flex gap="sm">
              <SecondaryButton size="sm">Update</SecondaryButton>
              <SecondaryButton size="sm">Contact</SecondaryButton>
            </Flex>
          </div>
        )}
      </div>
    </StatusCard>
  );
}


