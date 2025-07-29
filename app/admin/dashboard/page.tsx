/**
 * Admin Dashboard - Main dashboard for system administrators
 * Snugs & Kisses CRM - HIPAA Compliant Healthcare Management
 */
import { Metadata } from 'next'
import { ZohoSyncDashboard } from '@/components/admin/zoho-sync-dashboard'

export const metadata: Metadata = {
  title: 'Admin Dashboard - Snugs & Kisses CRM',
  description: 'Administrative dashboard for managing Zoho integrations and system health',
}

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D7C7ED]/10 to-white">
      <div className="container mx-auto">
        <ZohoSyncDashboard />
      </div>
    </div>
  )
}