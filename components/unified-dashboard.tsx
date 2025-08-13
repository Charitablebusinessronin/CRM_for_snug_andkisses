
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Users, 
  DollarSign, 
  Target, 
  MessageSquare, 
  Heart,
  UserPlus,
  CreditCard,
  Briefcase,
  BarChart3,
  Phone,
  Calendar,
  FileText,
  Clock,
  Star
} from "lucide-react"
import { CatalystAuth, CatalystUser } from '@/lib/catalyst-auth'

interface DashboardMetrics {
  totalRevenue: number
  revenueChange: number
  activeCustomers: number
  customersChange: number
  openDeals: number
  dealsChange: number
  supportTickets: number
  ticketsChange: number
}

interface ServiceRequest {
  id: string
  service_type: 'doula' | 'backup_childcare' | 'postpartum_support'
  status: 'pending' | 'assigned' | 'in_progress' | 'completed'
  client_name: string
  requested_date: string
  hours_requested: number
  assigned_provider?: string
}

export default function UnifiedDashboard() {
  const [user, setUser] = useState<CatalystUser | null>(null)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeDashboard()
  }, [])

  const initializeDashboard = async () => {
    try {
      const currentUser = await CatalystAuth.getCurrentUser()
      setUser(currentUser)
      
      if (currentUser) {
        await Promise.all([
          loadMetrics(),
          loadServiceRequests()
        ])
      }
    } catch (error) {
      console.error('Dashboard initialization error:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMetrics = async () => {
    try {
      const response = await fetch('/api/business-suite/dashboard-metrics', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMetrics(data.metrics)
      }
    } catch (error) {
      console.error('Failed to load metrics:', error)
    }
  }

  const loadServiceRequests = async () => {
    try {
      const response = await fetch('/api/business-suite/service-requests', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setServiceRequests(data.requests || [])
      }
    } catch (error) {
      console.error('Failed to load service requests:', error)
    }
  }

  const handleVideoCall = async () => {
    try {
      const response = await fetch('/api/client/video-call', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.user_id,
          call_type: 'urgent_care'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        window.open(data.meeting_url, '_blank')
      }
    } catch (error) {
      console.error('Failed to initiate video call:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D7C7ED]/20 to-white">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3B2352] mx-auto"></div>
          <p className="text-[#3B2352]" style={{ fontFamily: 'Lato' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  const businessModules = [
    {
      id: "crm",
      name: "CRM",
      icon: Users,
      description: "Customer relationship management",
      status: "active",
      color: "bg-[#3B2352]",
      href: "/admin/crm"
    },
    {
      id: "support",
      name: "Support",
      icon: Heart,
      description: "Customer service & ticketing", 
      status: "active",
      color: "bg-pink-500",
      href: "/admin/support"
    },
    {
      id: "finance",
      name: "Finance",
      icon: CreditCard,
      description: "Accounting & invoicing",
      status: "active", 
      color: "bg-emerald-500",
      href: "/admin/finance"
    },
    {
      id: "hr",
      name: "HR",
      icon: UserPlus,
      description: "Human resources management",
      status: "active",
      color: "bg-purple-500", 
      href: "/admin/hr"
    }
  ]

  const keyMetrics = [
    {
      title: "Total Revenue",
      value: metrics ? `$${metrics.totalRevenue.toLocaleString()}` : "$124,500",
      change: metrics ? `${metrics.revenueChange > 0 ? '+' : ''}${metrics.revenueChange}%` : "+12.5%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Families",
      value: metrics ? metrics.activeCustomers.toString() : "1,247", 
      change: metrics ? `${metrics.customersChange > 0 ? '+' : ''}${metrics.customersChange}%` : "+8.2%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Service Requests",
      value: serviceRequests.length.toString(),
      change: "+15.3%",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Support Tickets", 
      value: metrics ? metrics.supportTickets.toString() : "23",
      change: metrics ? `${metrics.ticketsChange > 0 ? '+' : ''}${metrics.ticketsChange}%` : "-5.1%",
      icon: MessageSquare,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D7C7ED]/20 to-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-[#3B2352] mb-2" style={{ fontFamily: 'Merriweather' }}>
                Welcome back, {user?.first_name}
              </h1>
              <p className="text-[#3B2352]/70" style={{ fontFamily: 'Lato' }}>
                Guarding rest. Cherishing families. Here's your overview.
              </p>
            </div>
            
            {user?.roles.includes('client') && (
              <div className="flex gap-3">
                <Button
                  onClick={handleVideoCall}
                  className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white font-semibold"
                  style={{ fontFamily: 'Nunito Sans' }}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency Care
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {keyMetrics.map((metric, index) => (
            <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#3B2352]/60 mb-1" style={{ fontFamily: 'Lato' }}>
                      {metric.title}
                    </p>
                    <p className="text-2xl font-bold text-[#3B2352] mb-1">
                      {metric.value}
                    </p>
                    <p className={`text-sm ${metric.color} flex items-center`}>
                      {metric.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.color} bg-opacity-10`}>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recent Service Requests - Client Portal */}
        {user?.roles.includes('client') && serviceRequests.length > 0 && (
          <Card className="mb-8 border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#3B2352]" style={{ fontFamily: 'Merriweather' }}>
                Your Service Requests
              </CardTitle>
              <CardDescription style={{ fontFamily: 'Lato' }}>
                Track your care services and appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {serviceRequests.slice(0, 5).map((request) => (
                  <div key={request.id} className="flex items-center justify-between p-4 rounded-lg bg-[#D7C7ED]/10 border border-[#D7C7ED]/20">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-[#3B2352]/10">
                        <Heart className="w-4 h-4 text-[#3B2352]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#3B2352]" style={{ fontFamily: 'Lato' }}>
                          {request.service_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-[#3B2352]/60">
                          {request.hours_requested} hours • {new Date(request.requested_date).toLocaleDateString()}
                        </p>
                        {request.assigned_provider && (
                          <p className="text-sm text-[#3B2352]">Provider: {request.assigned_provider}</p>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant={request.status === 'completed' ? 'default' : 'secondary'}
                      className={
                        request.status === 'completed' ? 'bg-green-100 text-green-800' :
                        request.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                        request.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }
                    >
                      {request.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Business Modules - Admin/Employee View */}
        {(user?.roles.includes('admin') || user?.roles.includes('employee')) && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-[#3B2352]" style={{ fontFamily: 'Merriweather' }}>
                Business Suite
              </CardTitle>
              <CardDescription style={{ fontFamily: 'Lato' }}>
                Complete business management platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {businessModules.map((module) => (
                  <a 
                    key={module.id} 
                    href={module.href}
                    className="block group hover:transform hover:scale-105 transition-all duration-200"
                  >
                    <div className="p-6 rounded-xl bg-gradient-to-br from-white to-[#D7C7ED]/5 border border-[#D7C7ED]/20 hover:border-[#3B2352]/30 hover:shadow-lg">
                      <div className={`p-3 rounded-full ${module.color} w-fit mb-4 group-hover:scale-110 transition-transform duration-200`}>
                        <module.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-[#3B2352] mb-2" style={{ fontFamily: 'Merriweather' }}>
                        {module.name}
                      </h3>
                      <p className="text-sm text-[#3B2352]/60 mb-3" style={{ fontFamily: 'Lato' }}>
                        {module.description}  
                      </p>
                      <Badge 
                        variant="secondary"
                        className="bg-green-100 text-green-800 text-xs"
                      >
                        {module.status}
                      </Badge>
                    </div>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
