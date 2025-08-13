"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { LoadingButton } from "@/components/common/loading-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Calendar, 
  MessageCircle, 
  FileText, 
  Clock, 
  Heart, 
  Phone, 
  Video,
  AlertCircle,
  CheckCircle2,
  Baby,
  Stethoscope,
  User,
  CreditCard,
  Settings,
  Bell,
  HelpCircle,
  Activity,
  Zap,
  Users
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'
import { formatDisplay } from '@/lib/date-utils'
import { runQuickAction } from '@/lib/actions'
import UnifiedActionButton from '@/components/UnifiedActionButton'

const USE_UNIFIED = process.env.NEXT_PUBLIC_USE_UNIFIED_BUTTONS === 'true'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  category: 'urgent' | 'primary' | 'secondary' | 'informational'
  action: () => void
  disabled?: boolean
  badge?: string
  requiresConfirmation?: boolean
  estimatedTime?: string
}

interface ClientQuickActionsProps {
  clientId: string
  workflowPhase: number
  hasActiveServices: boolean
  upcomingAppointments: number
  unreadMessages: number
  connectionStatus: 'connected' | 'disconnected' | 'connecting'
}

export function ClientQuickActions({ 
  clientId, 
  workflowPhase, 
  hasActiveServices, 
  upcomingAppointments, 
  unreadMessages,
  connectionStatus 
}: ClientQuickActionsProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({})
  const [actionCooldowns, setActionCooldowns] = useState<Record<string, number>>({})
  const router = useRouter()

  // Real-time connection status
  const isConnected = connectionStatus === 'connected'

  /**
   * Execute quick action with real backend integration
   */
  const executeAction = async (actionId: string, action: () => Promise<any>) => {
    if (isLoading[actionId] || actionCooldowns[actionId] > Date.now()) return

    setIsLoading(prev => ({ ...prev, [actionId]: true }))

    try {
      await action()
      
      // Set cooldown to prevent spam clicks
      setActionCooldowns(prev => ({ ...prev, [actionId]: Date.now() + 2000 }))
      
    } catch (error) {
      console.error(`Action ${actionId} failed:`, error)
      toast({
        title: "Action Failed",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(prev => ({ ...prev, [actionId]: false }))
    }
  }

  /**
   * Request urgent care assistance
   */
  const requestUrgentCare = async () => {
    const response = await fetch('/api/client/urgent-care', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        urgencyLevel: 'high',
        requestTime: new Date().toISOString(),
        currentPhase: workflowPhase
      })
    })

    if (!response.ok) throw new Error('Failed to request urgent care')

    const result = await response.json()
    
    toast({
      title: "Urgent Care Requested",
      description: `Requested at ${formatDisplay(new Date())}. A care coordinator will contact you within 15 minutes.`,
      variant: "default"
    })

    // Trigger immediate notification to care team
    if (window.socket?.connected) {
      window.socket.emit('client_portal_action', {
        action: 'emergency_request',
        data: {
          clientId,
          urgency: 'high',
          requestTime: new Date().toISOString()
        }
      })
    }

    return result
  }

  /**
   * Schedule appointment with AI optimization
   */
  const scheduleAppointment = async () => {
    // Try unified quick action first
    try {
      const res = await runQuickAction<any>({ action: 'create-appointment', params: { clientId, type: 'consultation' } })
      if (res.ok) {
        const data: any = (res.json as any)?.data
        const url = data?.bookingUrl || data?.appointmentUrl
        if (url) {
          try { window.open(url, '_blank', 'noopener,noreferrer') } catch {}
        }
        toast({
          title: "Appointment Request Sent",
          description: `Submitted at ${formatDisplay(new Date())}. We'll confirm your appointment shortly.`,
        })
        if (window.socket?.connected) {
          window.socket.emit('client_portal_action', {
            action: 'request_appointment',
            data: { clientId, appointmentData: data?.suggestedTimes }
          })
        }
        return data
      }
    } catch {}

    // Fallback to existing endpoint
    const response = await fetch('/api/client/schedule-appointment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        serviceType: 'consultation',
        preferenceData: {
          timeOfDay: 'morning',
          appointmentType: 'video',
          urgency: 'normal'
        }
      })
    })

    if (response.status === 401) {
      toast({ title: 'Please sign in', description: 'Your session expired. Sign in to schedule.' })
      try { router.push('/auth/signin') } catch {}
      return
    }
    if (!response.ok) throw new Error('Failed to schedule appointment')

    const result = await response.json()

    toast({
      title: "Appointment Request Sent",
      description: `Submitted at ${formatDisplay(new Date())}. We'll confirm your appointment shortly.`,
    })

    const bookingUrl = (result && (result.bookingUrl || result.appointmentUrl))
    if (bookingUrl) {
      try { window.open(bookingUrl, '_blank', 'noopener,noreferrer') } catch {}
      toast({ title: 'Booking Link', description: bookingUrl })
    }

    if (window.socket?.connected) {
      window.socket.emit('client_portal_action', {
        action: 'request_appointment',
        data: {
          clientId,
          appointmentData: result.suggestedTimes
        }
      })
    }

    return result
  }

  /**
   * Send secure message to care team
   */
  const sendMessage = async () => {
    router.push('/client/messages?compose=true')
  }

  /**
   * Request care plan adjustment
   */
  const requestCareAdjustment = async () => {
    const response = await fetch('/api/client/care-adjustment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        currentPhase: workflowPhase,
        adjustmentType: 'service_modification',
        requestReason: 'client_initiated'
      })
    })

    if (!response.ok) throw new Error('Failed to request care adjustment')

    toast({
      title: "Care Adjustment Requested",
      description: "Your care coordinator will review your request and contact you soon.",
      variant: "default"
    })

    return await response.json()
  }

  /**
   * View care progress and timeline
   */
  const viewCareProgress = async () => {
    router.push('/client/progress')
  }

  /**
   * Access billing and payments
   */
  const viewBilling = async () => {
    router.push('/client/billing')
  }

  /**
   * Submit feedback about services
   */
  const submitFeedback = async () => {
    router.push('/client/feedback')
  }

  /**
   * Contact care provider directly
   */
  const contactProvider = async () => {
    // Try unified quick action first (message team to call client)
    try {
      const res = await runQuickAction<any>({ action: 'messageTeam', params: { clientId, message: 'Please call me regarding my care plan.' } })
      if (res.ok) {
        toast({ title: 'Provider Contacted', description: 'Your care provider has been notified and will call you shortly.' })
        return (res.json as any)?.data
      }
    } catch {}

    // Fallback to existing endpoint
    const response = await fetch('/api/client/contact-provider', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        contactMethod: 'phone',
        urgencyLevel: 'normal'
      })
    })

    if (response.status === 401) {
      toast({ title: 'Please sign in', description: 'Your session expired. Sign in to continue.' })
      try { router.push('/auth/signin') } catch {}
      return
    }
    if (!response.ok) throw new Error('Failed to contact provider')

    toast({
      title: "Provider Contacted",
      description: "Your care provider has been notified and will call you shortly.",
    })

    return await response.json()
  }

  /**
   * Start video consultation
   */
  const startVideoConsultation = async () => {
    // Try unified quick action first
    try {
      const res = await runQuickAction<any>({ action: 'startVideoCall', params: { clientId, type: 'immediate', duration: 30 } })
      if (res.ok) {
        const data: any = (res.json as any)?.data
        const url = data?.roomUrl || data?.meetingUrl
        if (url) {
          try { window.open(url, '_blank', 'noopener,noreferrer') } catch {}
        }
        toast({ title: 'Video Consultation Started', description: 'Opening secure video room in new window.' })
        return data
      }
    } catch {}

    // Fallback to existing endpoint
    const response = await fetch('/api/client/video-consultation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        consultationType: 'immediate',
        duration: 30
      })
    })

    if (response.status === 401) {
      toast({ title: 'Please sign in', description: 'Your session expired. Sign in to start a call.' })
      try { router.push('/auth/signin') } catch {}
      return
    }
    if (!response.ok) throw new Error('Failed to start video consultation')

    const result = await response.json()

    if (result.roomUrl) {
      try { window.open(result.roomUrl, '_blank', 'noopener,noreferrer') } catch {}
      toast({ title: 'Video Consultation Started', description: result.roomUrl })
    }

    return result
  }

  /**
   * Update client preferences
   */
  const updatePreferences = async () => {
    router.push('/client/preferences')
  }

  /**
   * View educational resources
   */
  const viewResources = async () => {
    router.push('/client/resources')
  }

  /**
   * Get help and support
   */
  const getHelp = async () => {
    router.push('/client/support')
  }

  const signContract = async () => {
    try {
      const response = await fetch('/api/client/contract-signing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractType: 'postpartum',
          serviceDetails: 'Postpartum care services including in-home visits and 24/7 support',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          toast({ title: "Authentication Required", description: "Please sign in to perform this action.", variant: "destructive" });
          router.push('/auth/signin');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.signUrl) {
        toast({ 
          title: 'Contract Ready', 
          description: `Click to sign: ${result.signUrl}`,
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.open(result.signUrl, '_blank')}
            >
              Sign Contract
            </Button>
          )
        });
      } else {
        toast({ title: 'Contract Sent', description: result.message });
      }
    } catch (error: any) {
      if (error.message.includes('401')) {
        toast({ title: "Authentication Required", description: "Please sign in to perform this action.", variant: "destructive" });
        router.push('/auth/signin');
      } else {
        toast({ title: "Action Failed", description: "Please try again or contact support if the issue persists.", variant: "destructive" });
      }
    }
  };

  const actions = [
    {
      id: 'schedule-appointment',
      title: 'Schedule Appointment',
      description: 'Book your next care appointment',
      icon: Calendar,
      category: 'primary' as const,
      action: () => executeAction('schedule-appointment', scheduleAppointment),
      color: 'blue'
    },
    {
      id: 'video-consultation',
      title: 'Start Video Call',
      description: 'Begin a telehealth consultation',
      icon: Video,
      category: 'primary' as const,
      action: () => executeAction('video-consultation', startVideoConsultation),
      color: 'green'
    },
    {
      id: 'contact-provider',
      title: 'Contact Care Provider',
      description: 'Message your assigned provider',
      icon: MessageCircle,
      category: 'primary' as const,
      action: () => executeAction('contact-provider', contactProvider),
      color: 'purple'
    },
    {
      id: 'message-team',
      title: 'Message Care Team',
      description: 'Send message to care team',
      icon: Users,
      category: 'secondary' as const,
      action: () => executeAction('message-team', sendMessage),
      color: 'orange'
    },
    {
      id: 'contract-signing',
      title: 'Sign Contract',
      description: 'Review and sign service agreements',
      icon: FileText,
      category: 'secondary' as const,
      action: () => executeAction('contract-signing', signContract),
      color: 'red'
    }
  ];

  // Group actions by category (simplified for now)
  const groupedActions = {
    primary: actions.filter(a => ['schedule-appointment', 'video-consultation', 'contact-provider'].includes(a.id)),
    secondary: actions.filter(a => ['message-team', 'contract-signing'].includes(a.id))
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[#3B2352]">Quick Actions</h3>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500' : 'bg-red-500'
          }`} />
          <span className="text-sm text-gray-600">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Primary Actions */}
      <Card className="bg-white/70 backdrop-blur border-[#D7C7ED]/30 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#3B2352] flex items-center gap-2" style={{ fontFamily: "Merriweather, serif" }}>
            <Zap className="h-5 w-5" />
            Primary Actions
          </CardTitle>
          <CardDescription style={{ fontFamily: "Lato, sans-serif" }}>
            Most commonly used features and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedActions.primary.map((action) => (
              <QuickActionButton 
                key={action.id} 
                action={action} 
                isLoading={isLoading[action.id]} 
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Secondary Actions */}
      <Card className="bg-white/70 backdrop-blur border-[#D7C7ED]/30 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>Care Management</CardTitle>
          <CardDescription style={{ fontFamily: "Lato, sans-serif" }}>
            Manage your care preferences and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {groupedActions.secondary.map((action) => (
              <QuickActionButton 
                key={action.id} 
                action={action} 
                isLoading={isLoading[action.id]} 
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Informational Actions */}
      <Card className="bg-white/70 backdrop-blur border-[#D7C7ED]/30 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>Resources & Support</CardTitle>
          <CardDescription style={{ fontFamily: "Lato, sans-serif" }}>
            Educational materials and assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.filter(a => ['message-team', 'contract-signing'].includes(a.id)).map((action) => (
              <QuickActionButton 
                key={action.id} 
                action={action} 
                isLoading={isLoading[action.id]} 
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface QuickActionButtonProps {
  action: QuickAction
  isLoading: boolean
}

function QuickActionButton({ action, isLoading }: QuickActionButtonProps) {
  const IconComponent = action.icon
  const [showConfirmation, setShowConfirmation] = useState(false)

  const handleClick = () => {
    if (action.requiresConfirmation && !showConfirmation) {
      setShowConfirmation(true)
      setTimeout(() => setShowConfirmation(false), 3000) // Auto-hide after 3 seconds
      return
    }
    
    action.action()
    setShowConfirmation(false)
  }

  const getButtonVariant = () => {
    if (action.category === 'urgent') return 'destructive'
    if (action.category === 'primary') return 'default'
    return 'outline'
  }

  return (
    <div className="relative">
      <LoadingButton
        data-testid={`qa-${action.id}`}
        onClick={handleClick}
        disabled={action.disabled}
        variant={getButtonVariant()}
        loading={isLoading}
        className={`h-auto p-4 flex flex-col items-start gap-2 w-full text-left transition-all duration-300 ${
          action.category === 'urgent' 
            ? 'hover:bg-[#3B2352] border-[#D7C7ED]/50 shadow-md bg-[#D7C7ED]/10' 
            : action.category === 'primary'
            ? 'bg-gradient-to-br from-[#3B2352] to-[#D7C7ED] hover:from-[#3B2352]/90 hover:to-[#D7C7ED]/90 shadow-md'
            : 'hover:border-[#3B2352] hover:bg-gradient-to-br hover:from-[#D7C7ED]/5 hover:to-[#D7C7ED]/10 border-[#D7C7ED]/30'
        }`}
      >
        <div className="flex items-center justify-between w-full">
          <IconComponent className={`h-5 w-5 ${
            action.category === 'urgent' ? 'text-[#3B2352]' : 
            action.category === 'primary' ? 'text-white' : 'text-[#3B2352]'
          }`} />
          {action.badge && (
            <Badge variant={action.category === 'urgent' ? 'secondary' : 'outline'} className="text-xs">
              {action.badge}
            </Badge>
          )}
        </div>
        
        <div className="space-y-1">
          <h4 className={`font-semibold text-sm ${
            action.category === 'urgent' ? 'text-[#3B2352]' : action.category === 'primary' ? 'text-white' : 'text-[#3B2352]'
          }`} style={{ fontFamily: "Nunito Sans, sans-serif" }}>
            {action.title}
          </h4>
          <p className={`text-xs ${
            action.category === 'urgent' ? 'text-[#3B2352]/80' : action.category === 'primary' 
              ? 'text-white/80' 
              : 'text-gray-600'
          }`} style={{ fontFamily: "Lato, sans-serif" }}>
            {action.description}
          </p>
          {action.estimatedTime && (
            <div className="flex items-center gap-1">
              <Clock className={`h-3 w-3 ${
                action.category === 'urgent' ? 'text-[#3B2352]/60' : action.category === 'primary' 
                  ? 'text-white/60' 
                  : 'text-gray-500'
              }`} />
              <span className={`text-xs ${
                action.category === 'urgent' ? 'text-[#3B2352]/60' : action.category === 'primary' 
                  ? 'text-white/60' 
                  : 'text-gray-500'
              }`} style={{ fontFamily: "Lato, sans-serif" }}>
                {action.estimatedTime}
              </span>
            </div>
          )}
        </div>

      </LoadingButton>
      {showConfirmation && (
        <div className="absolute top-0 left-0 right-0 bg-yellow-100 border border-yellow-300 rounded-md p-2 text-xs text-yellow-800 z-10">
          Click again to confirm this action
        </div>
      )}
    </div>
  )
}