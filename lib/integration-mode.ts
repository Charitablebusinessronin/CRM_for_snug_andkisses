export type IntegrationMode = 'catalyst' | 'direct'

export function getIntegrationMode(): IntegrationMode {
  const mode = (process.env.INTEGRATION_MODE || 'catalyst').toLowerCase()
  return mode === 'direct' ? 'direct' : 'catalyst'
}
