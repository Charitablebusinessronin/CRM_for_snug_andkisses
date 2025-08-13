// hooks/useClientActions.ts
import { useState } from 'react'

type LoadingKeys = 'urgentCare' | 'contact' | 'schedule' | 'message' | 'video'

export function useClientActions(clientId: string) {
  const [loading, setLoading] = useState<Record<LoadingKeys, boolean>>({
    urgentCare: false,
    contact: false,
    schedule: false,
    message: false,
    video: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const apiCall = async (
    endpoint: string,
    data: any,
    loadingKey: LoadingKeys
  ) => {
    setLoading((prev) => ({ ...prev, [loadingKey]: true }))
    setErrors((prev) => ({ ...prev, [loadingKey]: '' }))

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)
    try {
      const response = await fetch(`/api/client/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, ...data }),
        signal: controller.signal,
      })
      clearTimeout(timeout)

      const result = await response.json().catch(() => ({}))
      if (!response.ok || result?.success === false) {
        const message = result?.error || result?.message || 'Request failed'
        throw new Error(message)
      }
      return result
    } catch (error: any) {
      const errorMessage = error?.name === 'AbortError' ? 'Request timed out' : error?.message || 'Network error'
      setErrors((prev) => ({ ...prev, [loadingKey]: errorMessage }))
      throw error
    } finally {
      setLoading((prev) => ({ ...prev, [loadingKey]: false }))
    }
  }

  return {
    requestUrgentCare: (type: 'medical' | 'support' = 'medical') =>
      apiCall('urgent-care', { requestType: type }, 'urgentCare'),

    contactCareProvider: () => apiCall('contact-provider', {}, 'contact'),

    scheduleAppointment: (type: string = 'consultation') =>
      apiCall('schedule-appointment', { appointmentType: type }, 'schedule'),

    messageCareTeam: (message: string, priority: 'normal' | 'urgent' = 'normal') =>
      apiCall('message-team', { message, priority }, 'message'),

    startVideoCall: (type: string = 'consultation') =>
      apiCall('video-consultation' /* Next.js -> backend video-call */, { callType: type }, 'video'),

    loading,
    errors,
    clearError: (key: string) => setErrors((prev) => ({ ...prev, [key]: '' })),
  }
}
