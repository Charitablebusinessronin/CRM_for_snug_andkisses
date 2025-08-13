import React from 'react'
import ClientQuickActionsUnified from '@/components/client/ClientQuickActionsUnified'

export const dynamic = 'force-dynamic'

export default function UnifiedActionsSandboxPage() {
  // Replace with a real clientId when integrating
  const demoClientId = 'demo-client-id'
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Unified Quick Actions (Sandbox)</h1>
      <p className="text-sm text-gray-600">
        This page renders the new unified quick actions component wired to the v2 endpoints.
        No existing components are modified. Use this to validate UX and backend connectivity.
      </p>
      <ClientQuickActionsUnified clientId={demoClientId} />
    </div>
  )
}
