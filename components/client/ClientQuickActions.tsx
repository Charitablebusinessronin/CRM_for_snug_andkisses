// components/client/ClientQuickActions.tsx
'use client'

import { useClientActions } from '@/hooks/useClientActions'
import { Button } from '@/components/ui/button'
import UnifiedActionButton from '@/components/UnifiedActionButton'
import { toast } from '@/hooks/use-toast'
import { runQuickAction } from '@/lib/actions'

const USE_UNIFIED = process.env.NEXT_PUBLIC_USE_UNIFIED_BUTTONS === 'true'

function ActionBtn({
  children,
  onClick,
  loading,
  variant,
  className,
  disabled,
}: {
  children: string
  onClick: () => void
  loading?: boolean
  variant?: 'outline' | 'default'
  className?: string
  disabled?: boolean
}) {
  if (USE_UNIFIED) {
    return (
      <UnifiedActionButton
        title={children}
        onClick={onClick}
        loading={!!loading}
        variant={variant === 'outline' ? 'secondary' : 'primary'}
      />
    )
  }
  return (
    <Button onClick={onClick} disabled={disabled} variant={variant as any} className={className}>
      {children}
    </Button>
  )
}

interface ClientQuickActionsProps {
  clientId: string
}

export function ClientQuickActions({ clientId }: ClientQuickActionsProps) {
  const {
    requestUrgentCare,
    contactCareProvider,
    scheduleAppointment,
    messageCareTeam,
    startVideoCall,
    loading,
    errors,
    clearError,
  } = useClientActions(clientId)

  // Try unified quick action first; fallback to existing handler on failure
  const quickActionOrFallback = async (
    action: { type: string; params?: Record<string, any> } | null,
    fallback: () => Promise<any>,
    successMsg: string
  ) => {
    try {
      if (action) {
        const res = await runQuickAction<any>({ action: action.type, params: action.params })
        if (res.ok) {
          const data: any = (res.json as any)?.data || {}
          // Open known URLs if provided
          const url = data.meetingUrl || data.roomUrl || data.bookingUrl || data.appointmentUrl
          if (url) {
            try { window.open(url, '_blank', 'noopener,noreferrer') } catch {}
          }
          toast({ title: 'Success', description: successMsg })
          return data
        }
      }
      // Fallback
      const result = await fallback()
      // Optional URL open from fallback result
      if (result?.meetingUrl || result?.roomUrl) {
        const url = result.meetingUrl || result.roomUrl
        try { window.open(url, '_blank', 'noopener,noreferrer') } catch {}
      }
      if (result?.bookingUrl) {
        try { window.open(result.bookingUrl, '_blank', 'noopener,noreferrer') } catch {}
      }
      toast({ title: 'Success', description: successMsg })
      return result
    } catch (error: any) {
      console.error('Action failed:', error)
      toast({ title: 'Error', description: error?.message || 'Action failed' })
      throw error
    }
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {/* Urgent care: no unified action yet -> fallback only */}
      <Button
        onClick={() => quickActionOrFallback(null, () => requestUrgentCare('medical'), 'Urgent care request sent')}
        disabled={loading.urgentCare}
        className="w-full bg-red-600 hover:bg-red-700"
      >
        {loading.urgentCare ? 'Requesting...' : 'Request Urgent Care'}
      </Button>

      {/* Contact care provider: map to messageTeam if available */}
      <Button
        onClick={() => quickActionOrFallback(
          { type: 'messageTeam', params: { clientId } },
          () => contactCareProvider(),
          'Care team contacted'
        )}
        disabled={loading.contact}
        variant="outline"
        className="w-full"
      >
        {loading.contact ? 'Connecting...' : 'Contact Care Provider'}
      </Button>

      {/* Schedule appointment: unified quick action first */}
      <Button
        onClick={() => quickActionOrFallback(
          { type: 'create-appointment', params: { clientId, type: 'consultation' } },
          () => scheduleAppointment('consultation'),
          'Appointment scheduled'
        )}
        disabled={loading.schedule}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {loading.schedule ? 'Loading...' : 'Schedule Appointment'}
      </Button>

      {/* Message care team: unified quick action "messageTeam" with prompt */}
      <Button
        onClick={() => {
          const message = window.prompt('Enter your message:')
          if (!message) return
          quickActionOrFallback(
            { type: 'messageTeam', params: { clientId, message } },
            () => messageCareTeam(message),
            'Message sent'
          )
        }}
        disabled={loading.message}
        variant="outline"
        className="w-full"
      >
        {loading.message ? 'Sending...' : 'Message Care Team'}
      </Button>

      {/* Start video call: unified quick action first */}
      <Button
        onClick={() => quickActionOrFallback(
          { type: 'startVideoCall', params: { clientId, type: 'consultation' } },
          () => startVideoCall('consultation'),
          'Video call started'
        )}
        disabled={loading.video}
        className="w-full bg-purple-600 hover:bg-purple-700"
      >
        {loading.video ? 'Starting...' : 'Start Video Call'}
      </Button>

      {/* Error Display */}
      {Object.entries(errors).map(([key, error]) =>
        error ? (
          <div key={key} className="col-span-2 text-red-600 text-sm">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                type="button"
                className="underline"
                onClick={() => clearError(key)}
              >
                dismiss
              </button>
            </div>
          </div>
        ) : null
      )}
    </div>
  )
}
