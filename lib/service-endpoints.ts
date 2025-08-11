import { getIntegrationMode } from '@/lib/integration-mode'

// Centralize service endpoint resolution per feature flag
export function getCrmEndpoint(): string {
  const mode = getIntegrationMode()
  const catalyst = process.env.CATALYST_FUNCTION_URL
  const zohoProxy = process.env.ZOHO_PROXY_PREFIX

  if (mode === 'direct' && zohoProxy) {
    // Route through our Next.js proxy for Zoho direct calls
    return `${zohoProxy}/crm`
  }
  // Default to Catalyst serverless function
  return catalyst || 'https://project-rainfall-891140386.development.catalystserverless.com/server/project_rainfall_function'
}
