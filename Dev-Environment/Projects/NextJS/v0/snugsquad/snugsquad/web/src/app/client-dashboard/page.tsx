'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Container, 
  PageHeader, 
  StandardCard, 
  StatusBadge, 
  ProgressIndicator,
  PrimaryButton,
  SecondaryButton,
  Grid,
  Flex
} from '@/components/ui';

// Mock dashboard data
const mockDashboardData = {
  carePlan: {
    title: "Comprehensive Home Care Support",
    progress: 75,
    status: "active" as const,
    nextReview: "2 weeks"
  },
  recentRequests: [
    {
      id: "SR-001",
      title: "Housekeeping Service",
      status: "pending" as const,
      category: "Housekeeping",
      requestedDate: "2025-01-15"
    },
    {
      id: "SR-002", 
      title: "Meal Preparation",
      status: "active" as const,
      category: "Nutrition",
      requestedDate: "2025-01-10"
    }
  ],
  upcomingAppointments: [
    {
      id: "APT-001",
      title: "Care Plan Review",
      date: "2025-01-22",
      time: "10:00 AM",
      type: "Virtual"
    },
    {
      id: "APT-002",
      title: "Physical Therapy",
      date: "2025-01-25", 
      time: "2:00 PM",
      type: "In-Person"
    }
  ],
  quickStats: {
    totalRequests: 8,
    activeServices: 4,
    completedRequests: 3,
    upcomingReviews: 1
  }
};

export default function ClientDashboardPage() {
  return (
    <Container>
      <PageHeader 
        title="Welcome back, Margaret" 
        subtitle="Here's what's happening with your care plan today"
      >
        <Flex gap="md">
          <SecondaryButton>View Calendar</SecondaryButton>
          <PrimaryButton>New Service Request</PrimaryButton>
        </Flex>
      </PageHeader>

      {/* Quick Stats */}
      <Grid cols={4} gap="md" className="mb-8">
        <StandardCard>
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-brand-primary mb-2">
              {mockDashboardData.quickStats.totalRequests}
            </div>
            <p className="text-sm text-semantic-fg/70">Total Requests</p>
          </div>
        </StandardCard>
        
        <StandardCard>
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-semantic-success mb-2">
              {mockDashboardData.quickStats.activeServices}
            </div>
            <p className="text-sm text-semantic-fg/70">Active Services</p>
          </div>
        </StandardCard>
        
        <StandardCard>
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-semantic-warning mb-2">
              {mockDashboardData.quickStats.completedRequests}
            </div>
            <p className="text-sm text-semantic-fg/70">Completed</p>
          </div>
        </StandardCard>
        
        <StandardCard>
          <div className="text-center">
            <div className="text-3xl font-heading font-bold text-semantic-ring mb-2">
              {mockDashboardData.quickStats.upcomingReviews}
            </div>
            <p className="text-sm text-semantic-fg/70">Upcoming Reviews</p>
          </div>
        </StandardCard>
      </Grid>

      <Grid cols={3} gap="lg">
        {/* Care Plan Overview */}
        <div className="lg:col-span-2">
          <StandardCard>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-h4 font-heading text-semantic-fg">Care Plan Overview</h3>
              <Link href="/client-dashboard/care-plan">
                <SecondaryButton size="sm">View Full Plan</SecondaryButton>
              </Link>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-ui font-semibold text-semantic-fg mb-2">
                  {mockDashboardData.carePlan.title}
                </h4>
                <div className="flex items-center space-x-4 mb-4">
                  <StatusBadge status={mockDashboardData.carePlan.status}>
                    {mockDashboardData.carePlan.status.charAt(0).toUpperCase() + mockDashboardData.carePlan.status.slice(1)}
                  </StatusBadge>
                  <span className="text-sm text-semantic-fg/70">
                    Next review in {mockDashboardData.carePlan.nextReview}
                  </span>
                </div>
                <ProgressIndicator progress={mockDashboardData.carePlan.progress} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-semantic-muted rounded-lg">
                  <p className="text-sm font-semibold text-semantic-fg">Progress</p>
                  <p className="text-lg font-heading text-brand-primary">{mockDashboardData.carePlan.progress}%</p>
                </div>
                <div className="p-3 bg-semantic-muted rounded-lg">
                  <p className="text-sm font-semibold text-semantic-fg">Status</p>
                  <p className="text-lg font-heading text-semantic-success">Active</p>
                </div>
              </div>
            </div>
          </StandardCard>
        </div>

        {/* Quick Actions Sidebar */}
        <div className="lg:col-span-1">
          <StandardCard>
            <h3 className="text-h4 font-heading text-semantic-fg mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link href="/client-dashboard/service-requests">
                <PrimaryButton className="w-full justify-center">
                  New Service Request
                </PrimaryButton>
              </Link>
              <Link href="/client-dashboard/care-plan">
                <SecondaryButton className="w-full justify-center">
                  Update Care Plan
                </SecondaryButton>
              </Link>
              <Link href="/client-dashboard/profile">
                <SecondaryButton className="w-full justify-center">
                  Edit Profile
                </SecondaryButton>
              </Link>
              <SecondaryButton className="w-full justify-center">
                Contact Care Team
              </SecondaryButton>
            </div>
          </StandardCard>
        </div>
      </Grid>

      {/* Recent Activity */}
      <div className="mt-8">
        <h3 className="text-h4 font-heading text-semantic-fg mb-6">Recent Activity</h3>
        
        <Grid cols={2} gap="lg">
          {/* Recent Service Requests */}
          <StandardCard>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-h5 font-heading text-semantic-fg">Recent Service Requests</h4>
              <Link href="/client-dashboard/service-requests">
                <SecondaryButton size="sm">View All</SecondaryButton>
              </Link>
            </div>
            
            <div className="space-y-3">
              {mockDashboardData.recentRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-3 bg-semantic-muted rounded-lg">
                  <div>
                    <p className="font-ui font-medium text-semantic-fg">{request.title}</p>
                    <p className="text-sm text-semantic-fg/70">{request.category} • {request.requestedDate}</p>
                  </div>
                  <StatusBadge status={request.status}>
                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                  </StatusBadge>
                </div>
              ))}
            </div>
          </StandardCard>

          {/* Upcoming Appointments */}
          <StandardCard>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-h5 font-heading text-semantic-fg">Upcoming Appointments</h4>
              <SecondaryButton size="sm">View Calendar</SecondaryButton>
            </div>
            
            <div className="space-y-3">
              {mockDashboardData.upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="p-3 bg-semantic-muted rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-ui font-medium text-semantic-fg">{appointment.title}</p>
                    <span className="text-xs px-2 py-1 bg-semantic-ring/10 text-semantic-ring rounded">
                      {appointment.type}
                    </span>
                  </div>
                  <p className="text-sm text-semantic-fg/70">
                    {appointment.date} at {appointment.time}
                  </p>
                </div>
              ))}
            </div>
          </StandardCard>
        </Grid>
      </div>
    </Container>
  );
}


