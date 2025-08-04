"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Users, Calendar, DollarSign, TrendingUp, Clock, AlertCircle, 
  CheckCircle, UserPlus, MessageSquare, FileText, Mail, 
  Settings, BarChart3, Target, Briefcase, CreditCard
} from "lucide-react"

/**
 * Unified Dashboard Component - Zoho One-like interface
 * Provides integrated access to all business modules
 */
export function UnifiedDashboard() {
  const [activeApp, setActiveApp] = useState("overview")

  // Business apps configuration (Zoho One-like structure)
  const businessApps = [
    {
      id: "crm",
      name: "CRM",
      icon: Users,
      description: "Customer relationship management",
      status: "active",
      color: "bg-blue-500"
    },
    {
      id: "sales",
      name: "Sales",
      icon: Target,
      description: "Sales pipeline & automation",
      status: "active",
      color: "bg-green-500"
    },
    {
      id: "marketing",
      name: "Marketing",
      icon: TrendingUp,
      description: "Email campaigns & automation",
      status: "active",
      color: "bg-purple-500"
    },
    {
      id: "support",
      name: "Support",
      icon: MessageSquare,
      description: "Customer service & ticketing",
      status: "active",
      color: "bg-orange-500"
    },
    {
      id: "finance",
      name: "Finance",
      icon: CreditCard,
      description: "Accounting & invoicing",
      status: "active",
      color: "bg-emerald-500"
    },
    {
      id: "hr",
      name: "HR",
      icon: UserPlus,
      description: "Human resources management",
      status: "active",
      color: "bg-pink-500"
    },
    {
      id: "projects",
      name: "Projects",
      icon: Briefcase,
      description: "Project management & tracking",
      status: "active",
      color: "bg-indigo-500"
    },
    {
      id: "analytics",
      name: "Analytics",
      icon: BarChart3,
      description: "Business intelligence & reports",
      status: "active",
      color: "bg-cyan-500"
    }
  ]

  // Key metrics for overview
  const keyMetrics = [
    {
      title: "Total Revenue",
      value: "$124,500",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-600"
    },
    {
      title: "Active Customers",
      value: "1,247",
      change: "+8.2%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Open Deals",
      value: "89",
      change: "+15.3%",
      icon: Target,
      color: "text-purple-600"
    },
    {
      title: "Support Tickets",
      value: "23",
      change: "-5.1%",
      icon: MessageSquare,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
              Snug & Kisses Business Suite
            </h1>
            <Badge variant="secondary" className="bg-[#D7C7ED] text-[#3B2352]">
              Powered by Catalyst
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>

      {/* App Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="flex space-x-1 overflow-x-auto">
          <Button
            variant={activeApp === "overview" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveApp("overview")}
            className={activeApp === "overview" ? "bg-[#3B2352] text-white" : ""}
          >
            Overview
          </Button>
          {businessApps.map((app) => (
            <Button
              key={app.id}
              variant={activeApp === app.id ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveApp(app.id)}
              className={`flex items-center space-x-2 ${
                activeApp === app.id ? "bg-[#3B2352] text-white" : ""
              }`}
            >
              <app.icon className="h-4 w-4" />
              <span>{app.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeApp === "overview" && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {keyMetrics.map((metric, index) => (
                <Card key={index} className="border-[#D7C7ED]/50">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                        <p className="text-2xl font-bold text-[#3B2352]">{metric.value}</p>
                        <p className={`text-sm ${metric.color}`}>{metric.change} from last month</p>
                      </div>
                      <div className={`p-3 rounded-full bg-gray-100`}>
                        <metric.icon className={`h-6 w-6 ${metric.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Business Apps Grid */}
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Business Applications</CardTitle>
                <CardDescription>Access all your business tools in one place</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {businessApps.map((app) => (
                    <Card
                      key={app.id}
                      className="cursor-pointer hover:shadow-md transition-shadow border-[#D7C7ED]/50"
                      onClick={() => setActiveApp(app.id)}
                    >
                      <CardContent className="p-4 text-center">
                        <div className={`w-12 h-12 ${app.color} rounded-lg mx-auto mb-3 flex items-center justify-center`}>
                          <app.icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="font-semibold text-[#3B2352] mb-1">{app.name}</h3>
                        <p className="text-xs text-gray-600">{app.description}</p>
                        <Badge
                          variant="secondary"
                          className="mt-2 bg-green-100 text-green-800 text-xs"
                        >
                          {app.status}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity & Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-[#3B2352]/20">
                <CardHeader>
                  <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { action: "New customer registered", time: "2 hours ago", type: "success" },
                      { action: "Invoice #1234 paid", time: "4 hours ago", type: "success" },
                      { action: "Support ticket created", time: "6 hours ago", type: "warning" },
                      { action: "Marketing campaign sent", time: "1 day ago", type: "info" },
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3 p-2 rounded-lg bg-gray-50">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.type === "success" ? "bg-green-500" :
                          activity.type === "warning" ? "bg-yellow-500" : "bg-blue-500"
                        }`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#3B2352]/20">
                <CardHeader>
                  <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white h-20 flex-col"
                    >
                      <UserPlus className="h-6 w-6 mb-2" />
                      Add Customer
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white h-20 flex-col"
                    >
                      <FileText className="h-6 w-6 mb-2" />
                      Create Invoice
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white h-20 flex-col"
                    >
                      <Mail className="h-6 w-6 mb-2" />
                      Send Campaign
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white h-20 flex-col"
                    >
                      <BarChart3 className="h-6 w-6 mb-2" />
                      View Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Individual App Content */}
        {activeApp !== "overview" && (
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
                {businessApps.find(app => app.id === activeApp)?.name} Module
              </CardTitle>
              <CardDescription>
                {businessApps.find(app => app.id === activeApp)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                {businessApps.find(app => app.id === activeApp) && (
                  <>
                    {React.createElement(businessApps.find(app => app.id === activeApp)!.icon, {
                      className: "h-16 w-16 mx-auto mb-4 text-[#D7C7ED]"
                    })}
                    <h3 className="text-xl font-semibold text-[#3B2352] mb-2">
                      {businessApps.find(app => app.id === activeApp)?.name} Dashboard
                    </h3>
                    <p className="text-gray-600 mb-4">
                      This module will be powered by Zoho Catalyst serverless functions
                    </p>
                    <Badge variant="outline" className="border-[#D4AF37] text-[#D4AF37]">
                      Coming Soon - Catalyst Integration
                    </Badge>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}