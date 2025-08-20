'use client';

import React from 'react';
import { 
  Container, 
  PageHeader, 
  StandardCard, 
  StatusCard, 
  StatusBadge, 
  ProgressIndicator,
  PrimaryButton,
  SecondaryButton,
  Grid,
  Flex
} from '@/components/ui';

// Mock data for the care plan
const mockCarePlan = {
  title: "Comprehensive Home Care Support",
  description: "Personalized care plan designed to support your daily needs with professional caregivers, meal preparation, housekeeping, and medical monitoring.",
  status: "active" as const,
  progress: 75,
  timeRemaining: "3 months",
  nextReview: "2 weeks",
  milestones: [
    { id: 1, title: "Initial Assessment", completed: true, date: "2025-08-01" },
    { id: 2, title: "Caregiver Matching", completed: true, date: "2025-08-15" },
    { id: 3, title: "Service Implementation", completed: true, date: "2025-08-20" },
    { id: 4, title: "First Month Review", completed: false, date: "2025-09-20" },
    { id: 5, title: "Quarterly Assessment", completed: false, date: "2025-11-20" }
  ],
  services: [
    { name: "Personal Care", frequency: "Daily", status: "active" as const },
    { name: "Meal Preparation", frequency: "Daily", status: "active" as const },
    { name: "Housekeeping", frequency: "Weekly", status: "active" as const },
    { name: "Medical Monitoring", frequency: "Daily", status: "active" as const }
  ]
};

export default function CarePlanPage() {
  return (
    <Container>
      <PageHeader 
        title="Your Care Plan" 
        subtitle="Personalized support for your journey"
      >
        <Flex gap="md">
          <SecondaryButton>Update Preferences</SecondaryButton>
          <PrimaryButton>Contact Care Team</PrimaryButton>
        </Flex>
      </PageHeader>

      <Grid cols={3} gap="lg">
        {/* Progress Overview Sidebar */}
        <div className="lg:col-span-1">
          <StandardCard>
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#3B2352"
                    strokeWidth="8"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - mockCarePlan.progress / 100)}`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-heading font-bold text-brand-primary">
                    {mockCarePlan.progress}%
                  </span>
                </div>
              </div>
              <p className="text-sm text-semantic-fg/70">Complete</p>
            </div>

            <div className="space-y-4">
              <div className="text-center p-4 bg-semantic-muted rounded-lg">
                <StatusBadge status={mockCarePlan.status} className="mb-2">
                  {mockCarePlan.status.charAt(0).toUpperCase() + mockCarePlan.status.slice(1)}
                </StatusBadge>
                <p className="text-sm text-semantic-fg">
                  {mockCarePlan.timeRemaining} remaining
                </p>
              </div>

              <div className="text-center p-4 bg-semantic-muted rounded-lg">
                <p className="text-sm font-semibold text-semantic-fg mb-1">Next Review</p>
                <p className="text-sm text-semantic-fg/70">{mockCarePlan.nextReview}</p>
              </div>
            </div>
          </StandardCard>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Care Plan Details */}
          <StandardCard>
            <h2 className="text-h3 font-heading text-semantic-fg mb-4">
              {mockCarePlan.title}
            </h2>
            <p className="text-body text-semantic-fg/80 mb-6">
              {mockCarePlan.description}
            </p>
            
            <div className="mb-6">
              <h3 className="text-h4 font-heading text-semantic-fg mb-3">Progress Overview</h3>
              <ProgressIndicator progress={mockCarePlan.progress} size="lg" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-semantic-muted rounded-lg">
                <h4 className="font-ui font-semibold text-semantic-fg mb-2">Current Status</h4>
                <StatusBadge status="active">Active - {mockCarePlan.timeRemaining} remaining</StatusBadge>
              </div>
              <div className="p-4 bg-semantic-muted rounded-lg">
                <h4 className="font-ui font-semibold text-semantic-fg mb-2">Next Steps</h4>
                <p className="text-sm text-semantic-fg/80">Schedule next review ({mockCarePlan.nextReview})</p>
              </div>
            </div>
          </StandardCard>

          {/* Milestones */}
          <StandardCard>
            <h3 className="text-h4 font-heading text-semantic-fg mb-4">Care Plan Milestones</h3>
            <div className="space-y-3">
              {mockCarePlan.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center justify-between p-3 bg-semantic-muted rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      milestone.completed ? 'bg-semantic-success' : 'bg-semantic-border'
                    }`} />
                    <span className="font-ui text-semantic-fg">{milestone.title}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-ui text-semantic-fg">
                      {milestone.completed ? 'Completed' : 'Pending'}
                    </p>
                    <p className="text-xs text-semantic-fg/70">{milestone.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </StandardCard>

          {/* Services */}
          <StandardCard>
            <h3 className="text-h4 font-heading text-semantic-fg mb-4">Active Services</h3>
            <Grid cols={2} gap="md">
              {mockCarePlan.services.map((service, index) => (
                <StatusCard key={index} status={service.status}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-ui font-semibold text-semantic-fg">{service.name}</h4>
                      <p className="text-sm text-semantic-fg/70">{service.frequency}</p>
                    </div>
                    <StatusBadge status={service.status}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </StatusBadge>
                  </div>
                </StatusCard>
              ))}
            </Grid>
          </StandardCard>

          {/* Quick Actions */}
          <StandardCard>
            <h3 className="text-h4 font-heading text-semantic-fg mb-4">Quick Actions</h3>
            <Flex gap="md" wrap="wrap">
              <PrimaryButton size="sm">Schedule Review</PrimaryButton>
              <SecondaryButton size="sm">Update Preferences</SecondaryButton>
              <SecondaryButton size="sm">Contact Care Team</SecondaryButton>
              <SecondaryButton size="sm">View Documents</SecondaryButton>
            </Flex>
          </StandardCard>
        </div>
      </Grid>
    </Container>
  );
}


