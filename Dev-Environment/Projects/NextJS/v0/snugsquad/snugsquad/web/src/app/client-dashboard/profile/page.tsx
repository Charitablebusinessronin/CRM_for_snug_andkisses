'use client';

import React, { useState } from 'react';
import { 
  Container, 
  PageHeader, 
  StandardCard, 
  PrimaryButton,
  SecondaryButton,
  Grid,
  Flex,
  FormField,
  FormLabel,
  FormInput,
  FormSelect,
  FormCheckbox,
  FormTextarea,
  TabNavigation,
  SectionDivider
} from '@/components/ui';

// Mock user profile data
const mockProfile = {
  personal: {
    firstName: "Margaret",
    lastName: "Thompson",
    email: "margaret.thompson@email.com",
    phone: "+1 (555) 123-4567",
    dateOfBirth: "1945-03-15",
    emergencyContact: {
      name: "Robert Thompson",
      relationship: "Son",
      phone: "+1 (555) 987-6543"
    }
  },
  preferences: {
    communication: "email",
    notifications: {
      email: true,
      sms: false,
      push: true
    },
    accessibility: {
      largeText: false,
      highContrast: false,
      screenReader: false
    }
  },
  care: {
    primaryLanguage: "English",
    dietaryRestrictions: ["Gluten-free", "Low-sodium"],
    mobility: "Uses walker",
    medicalConditions: ["Hypertension", "Type 2 Diabetes"],
    allergies: ["Penicillin", "Shellfish"],
    medications: [
      "Lisinopril 10mg daily",
      "Metformin 500mg twice daily"
    ]
  }
};

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockProfile);

  const PersonalInfoTab = () => (
    <div className="space-y-6">
      <StandardCard>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-h4 font-heading text-semantic-fg">Basic Information</h3>
          <SecondaryButton onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit'}
          </SecondaryButton>
        </div>

        <form className="space-y-4">
          <Grid cols={2} gap="md">
            <FormField>
              <FormLabel>First Name</FormLabel>
              <FormInput
                value={profile.personal.firstName}
                onChange={(e) => setProfile({
                  ...profile,
                  personal: { ...profile.personal, firstName: e.target.value }
                })}
                disabled={!isEditing}
              />
            </FormField>
            
            <FormField>
              <FormLabel>Last Name</FormLabel>
              <FormInput
                value={profile.personal.lastName}
                onChange={(e) => setProfile({
                  ...profile,
                  personal: { ...profile.personal, lastName: e.target.value }
                })}
                disabled={!isEditing}
              />
            </FormField>
          </Grid>

          <Grid cols={2} gap="md">
            <FormField>
              <FormLabel>Email</FormLabel>
              <FormInput
                type="email"
                value={profile.personal.email}
                onChange={(e) => setProfile({
                  ...profile,
                  personal: { ...profile.personal, email: e.target.value }
                })}
                disabled={!isEditing}
              />
            </FormField>
            
            <FormField>
              <FormLabel>Phone</FormLabel>
              <FormInput
                type="tel"
                value={profile.personal.phone}
                onChange={(e) => setProfile({
                  ...profile,
                  personal: { ...profile.personal, phone: e.target.value }
                })}
                disabled={!isEditing}
              />
            </FormField>
          </Grid>

          <FormField>
            <FormLabel>Date of Birth</FormLabel>
            <FormInput
              type="date"
              value={profile.personal.dateOfBirth}
              onChange={(e) => setProfile({
                ...profile,
                personal: { ...profile.personal, dateOfBirth: e.target.value }
              })}
              disabled={!isEditing}
            />
          </FormField>

          <SectionDivider />

          <h4 className="text-h5 font-heading text-semantic-fg mb-4">Emergency Contact</h4>
          
          <Grid cols={2} gap="md">
            <FormField>
              <FormLabel>Contact Name</FormLabel>
              <FormInput
                value={profile.personal.emergencyContact.name}
                onChange={(e) => setProfile({
                  ...profile,
                  personal: { 
                    ...profile.personal, 
                    emergencyContact: { ...profile.personal.emergencyContact, name: e.target.value }
                  }
                })}
                disabled={!isEditing}
              />
            </FormField>
            
            <FormField>
              <FormLabel>Relationship</FormLabel>
              <FormInput
                value={profile.personal.emergencyContact.relationship}
                onChange={(e) => setProfile({
                  ...profile,
                  personal: { 
                    ...profile.personal, 
                    emergencyContact: { ...profile.personal.emergencyContact, relationship: e.target.value }
                  }
                })}
                disabled={!isEditing}
              />
            </FormField>
          </Grid>

          <FormField>
            <FormLabel>Emergency Contact Phone</FormLabel>
            <FormInput
              type="tel"
              value={profile.personal.emergencyContact.phone}
              onChange={(e) => setProfile({
                ...profile,
                personal: { 
                  ...profile.personal, 
                  emergencyContact: { ...profile.personal.emergencyContact, phone: e.target.value }
                }
              })}
              disabled={!isEditing}
            />
          </FormField>

          {isEditing && (
            <Flex justify="end" gap="md">
              <SecondaryButton onClick={() => setIsEditing(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={() => setIsEditing(false)}>
                Save Changes
              </PrimaryButton>
            </Flex>
          )}
        </form>
      </StandardCard>
    </div>
  );

  const PreferencesTab = () => (
    <div className="space-y-6">
      <StandardCard>
        <h3 className="text-h4 font-heading text-semantic-fg mb-6">Communication Preferences</h3>
        
        <FormField>
          <FormLabel>Preferred Communication Method</FormLabel>
          <FormSelect
            value={profile.preferences.communication}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { ...profile.preferences, communication: e.target.value }
            })}
          >
            <option value="email">Email</option>
            <option value="phone">Phone</option>
            <option value="sms">SMS</option>
            <option value="mail">Mail</option>
          </FormSelect>
        </FormField>

        <div className="space-y-4">
          <h4 className="text-h5 font-heading text-semantic-fg mb-3">Notification Preferences</h4>
          
          <FormCheckbox
            label="Email notifications"
            checked={profile.preferences.notifications.email}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { 
                ...profile.preferences, 
                notifications: { ...profile.preferences.notifications, email: e.target.checked }
              }
            })}
          />
          
          <FormCheckbox
            label="SMS notifications"
            checked={profile.preferences.notifications.sms}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { 
                ...profile.preferences, 
                notifications: { ...profile.preferences.notifications, sms: e.target.checked }
              }
            })}
          />
          
          <FormCheckbox
            label="Push notifications"
            checked={profile.preferences.notifications.push}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { 
                ...profile.preferences, 
                notifications: { ...profile.preferences.notifications, push: e.target.checked }
              }
            })}
          />
        </div>
      </StandardCard>

      <StandardCard>
        <h3 className="text-h4 font-heading text-semantic-fg mb-6">Accessibility Preferences</h3>
        
        <div className="space-y-4">
          <FormCheckbox
            label="Large text size"
            checked={profile.preferences.accessibility.largeText}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { 
                ...profile.preferences, 
                accessibility: { ...profile.preferences.accessibility, largeText: e.target.checked }
              }
            })}
          />
          
          <FormCheckbox
            label="High contrast mode"
            checked={profile.preferences.accessibility.highContrast}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { 
                ...profile.preferences, 
                accessibility: { ...profile.preferences.accessibility, highContrast: e.target.checked }
              }
            })}
          />
          
          <FormCheckbox
            label="Screen reader support"
            checked={profile.preferences.accessibility.screenReader}
            onChange={(e) => setProfile({
              ...profile,
              preferences: { 
                ...profile.preferences, 
                accessibility: { ...profile.preferences.accessibility, screenReader: e.target.checked }
              }
            })}
          />
        </div>
      </StandardCard>
    </div>
  );

  const CareDetailsTab = () => (
    <div className="space-y-6">
      <StandardCard>
        <h3 className="text-h4 font-heading text-semantic-fg mb-6">Care Information</h3>
        
        <Grid cols={2} gap="md">
          <FormField>
            <FormLabel>Primary Language</FormLabel>
            <FormSelect
              value={profile.care.primaryLanguage}
              onChange={(e) => setProfile({
                ...profile,
                care: { ...profile.care, primaryLanguage: e.target.value }
              })}
            >
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="French">French</option>
              <option value="German">German</option>
              <option value="Other">Other</option>
            </FormSelect>
          </FormField>
          
          <FormField>
            <FormLabel>Mobility Status</FormLabel>
            <FormInput
              value={profile.care.mobility}
              onChange={(e) => setProfile({
                ...profile,
                care: { ...profile.care, mobility: e.target.value }
              })}
              placeholder="e.g., Independent, Uses walker, Wheelchair"
            />
          </FormField>
        </Grid>

        <FormField>
          <FormLabel>Dietary Restrictions</FormLabel>
          <FormTextarea
            value={profile.care.dietaryRestrictions.join(', ')}
            onChange={(e) => setProfile({
              ...profile,
              care: { ...profile.care, dietaryRestrictions: e.target.value.split(', ') }
            })}
            placeholder="List any dietary restrictions or preferences"
            rows={2}
          />
        </FormField>

        <FormField>
          <FormLabel>Medical Conditions</FormLabel>
          <FormTextarea
            value={profile.care.medicalConditions.join(', ')}
            onChange={(e) => setProfile({
              ...profile,
              care: { ...profile.care, medicalConditions: e.target.value.split(', ') }
            })}
            placeholder="List any medical conditions"
            rows={2}
          />
        </FormField>

        <FormField>
          <FormLabel>Allergies</FormLabel>
          <FormTextarea
            value={profile.care.allergies.join(', ')}
            onChange={(e) => setProfile({
              ...profile,
              care: { ...profile.care, allergies: e.target.value.split(', ') }
            })}
            placeholder="List any allergies"
            rows={2}
          />
        </FormField>

        <FormField>
          <FormLabel>Current Medications</FormLabel>
          <FormTextarea
            value={profile.care.medications.join('\n')}
            onChange={(e) => setProfile({
              ...profile,
              care: { ...profile.care, medications: e.target.value.split('\n') }
            })}
            placeholder="List current medications, one per line"
            rows={4}
          />
        </FormField>
      </StandardCard>
    </div>
  );

  const tabs = [
    { id: 'personal', label: 'Personal Information', content: <PersonalInfoTab /> },
    { id: 'preferences', label: 'Preferences', content: <PreferencesTab /> },
    { id: 'care', label: 'Care Details', content: <CareDetailsTab /> }
  ];

  return (
    <Container>
      <PageHeader 
        title="Profile & Preferences" 
        subtitle="Manage your account details and care preferences"
      >
        <Flex gap="md">
          <SecondaryButton>Export Data</SecondaryButton>
          <PrimaryButton>Save All Changes</PrimaryButton>
        </Flex>
      </PageHeader>

      <TabNavigation
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
    </Container>
  );
}


