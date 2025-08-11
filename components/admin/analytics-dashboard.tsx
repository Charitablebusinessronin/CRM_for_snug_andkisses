"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Progress } from "@/components/ui/progress"
import { 
  BarChart3, TrendingUp, TrendingDown, DollarSign, Users, 
  Calendar as CalendarIcon, Target, MessageSquare, Clock, 
  FileText, Download, Filter, RefreshCw, Eye, ArrowUp, 
  ArrowDown, Activity, PieChart, LineChart
} from "lucide-react"
import { format, subDays, subMonths } from "date-fns"

interface AnalyticsData {
  metric: string
  current: number
  previous: number
  change: number
  trend: 'up' | 'down' | 'stable'
  format: 'number' | 'currency' | 'percentage'
}

interface ChartData {
  period: string
  value: number
  label: string
}

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState({
    from: subMonths(new Date(), 3),
    to: new Date()
  })
  const [selectedPeriod, setSelectedPeriod] = useState("90d")
  const [activeTab, setActiveTab] = useState("overview")

  // Key Performance Indicators
  const kpiData: AnalyticsData[] = [
    {
      metric: "Total Revenue",
      current: 324500,
      previous: 289750,
      change: 12.0,
      trend: "up",
      format: "currency"
    },
    {
      metric: "New Patients",
      current: 156,
      previous: 142,
      change: 9.9,
      trend: "up",
      format: "number"
    },
    {
      metric: "Patient Satisfaction",
      current: 4.8,
      previous: 4.6,
      change: 4.3,
      trend: "up",
      format: "number"
    },
    {
      metric: "Care Team Utilization",
      current: 87,
      previous: 91,
      change: -4.4,
      trend: "down",
      format: "percentage"
    },
    {
      metric: "Average Response Time",
      current: 2.3,
      previous: 2.8,
      change: -17.9,
      trend: "up",
      format: "number"
    },
    {
      metric: "Treatment Success Rate",
      current: 94.2,
      previous: 92.1,
      change: 2.3,
      trend: "up",
      format: "percentage"
    }
  ]

  // Revenue trend data
  const revenueData: ChartData[] = [
    { period: "Jan", value: 85000, label: "January 2025" },
    { period: "Feb", value: 92000, label: "February 2025" },
    { period: "Mar", value: 78000, label: "March 2025" },
    { period: "Apr", value: 105000, label: "April 2025" },
    { period: "May", value: 98000, label: "May 2025" },
    { period: "Jun", value: 112000, label: "June 2025" }
  ]

  // Patient demographics
  const demographicsData = [
    { category: "0-18 years", value: 25, count: 125, color: "bg-blue-500" },
    { category: "19-35 years", value: 30, count: 150, color: "bg-green-500" },
    { category: "36-55 years", value: 28, count: 140, color: "bg-yellow-500" },
    { category: "56+ years", value: 17, count: 85, color: "bg-purple-500" }
  ]

  // Service utilization data
  const servicesData = [
    { service: "Home Care", visits: 342, revenue: 89500, satisfaction: 4.9 },
    { service: "Medical Equipment", orders: 156, revenue: 67200, satisfaction: 4.7 },
    { service: "Therapy Services", sessions: 289, revenue: 98500, satisfaction: 4.8 },
    { service: "Nutrition Counseling", consultations: 98, revenue: 26800, satisfaction: 4.6 },
    { service: "Care Coordination", calls: 567, revenue: 42500, satisfaction: 4.5 }
  ]

  // Staff performance data
  const staffMetrics = [
    { 
      name: "Sarah Johnson", 
      role: "Care Manager", 
      patients: 45, 
      satisfaction: 4.9, 
      utilization: 92,
      revenue: 78500
    },
    { 
      name: "Mike Chen", 
      role: "Registered Nurse", 
      patients: 38, 
      satisfaction: 4.8, 
      utilization: 88,
      revenue: 65200
    },
    { 
      name: "Emily Davis", 
      role: "Physical Therapist", 
      patients: 32, 
      satisfaction: 4.7, 
      utilization: 85,
      revenue: 58900
    },
    { 
      name: "David Wilson", 
      role: "Social Worker", 
      patients: 28, 
      satisfaction: 4.6, 
      utilization: 78,
      revenue: 42300
    }
  ]

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return `$${value.toLocaleString()}`
      case 'percentage':
        return `${value}%`
      default:
        return value.toLocaleString()
    }
  }

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : ''
    return `${sign}${change.toFixed(1)}%`
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
            Analytics & Reporting
          </h1>
          <p className="text-gray-600 mt-1">Comprehensive business intelligence and performance insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiData.map((kpi, index) => (
          <Card key={index} className="border-[#D7C7ED]/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">{kpi.metric}</span>
                <div className={`p-1 rounded-full ${
                  kpi.trend === 'up' ? 'bg-green-100' : 
                  kpi.trend === 'down' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {kpi.trend === 'up' ? (
                    <ArrowUp className="h-3 w-3 text-green-600" />
                  ) : kpi.trend === 'down' ? (
                    <ArrowDown className="h-3 w-3 text-red-600" />
                  ) : (
                    <Activity className="h-3 w-3 text-gray-600" />
                  )}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-[#3B2352]">
                  {formatValue(kpi.current, kpi.format)}
                </p>
                <p className={`text-xs ${
                  kpi.change > 0 ? 'text-green-600' : 
                  kpi.change < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {formatChange(kpi.change)} vs last period
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-2/3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Chart */}
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Revenue Trend
                </CardTitle>
                <CardDescription>Monthly revenue performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueData.map((data, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-[#3B2352] rounded-full"></div>
                        <span className="text-sm font-medium">{data.period}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${data.value.toLocaleString()}</p>
                        {index > 0 && (
                          <p className={`text-xs ${
                            data.value > revenueData[index - 1].value 
                              ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {data.value > revenueData[index - 1].value ? '+' : ''}
                            {(((data.value - revenueData[index - 1].value) / revenueData[index - 1].value) * 100).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Patient Demographics */}
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="h-5 w-5 mr-2" />
                  Patient Demographics
                </CardTitle>
                <CardDescription>Age distribution of active patients</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {demographicsData.map((demo, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-3 h-3 ${demo.color} rounded-full`}></div>
                          <span className="text-sm font-medium">{demo.category}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{demo.count} patients</span>
                          <p className="text-xs text-gray-500">{demo.value}%</p>
                        </div>
                      </div>
                      <Progress value={demo.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Insights */}
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle>Key Insights & Recommendations</CardTitle>
              <CardDescription>AI-powered business insights based on your data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-green-800">Revenue Growth</h4>
                        <p className="text-sm text-green-700">
                          Revenue increased 12% this quarter, driven by new patient acquisitions and service expansion.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-blue-800">Patient Retention</h4>
                        <p className="text-sm text-blue-700">
                          Patient retention rate of 94% indicates high satisfaction with care quality.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-yellow-800">Response Time Improvement</h4>
                        <p className="text-sm text-yellow-700">
                          Average response time improved 18% - consider expanding support hours.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <Target className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-purple-800">Service Optimization</h4>
                        <p className="text-sm text-purple-700">
                          Home care services show highest satisfaction - consider marketing expansion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Service Revenue</span>
                  <span className="font-bold text-green-600">$280,500</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Equipment Revenue</span>
                  <span className="font-bold text-blue-600">$67,200</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Insurance Reimbursements</span>
                  <span className="font-bold text-purple-600">$156,300</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Insurance</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                      </div>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Private Pay</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                      </div>
                      <span className="text-sm font-medium">25%</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Medicare/Medicaid</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                      </div>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle>Financial Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#3B2352]">94.2%</p>
                  <p className="text-sm text-gray-600">Collection Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">32 days</p>
                  <p className="text-sm text-gray-600">Avg. Days to Payment</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">$15,420</p>
                  <p className="text-sm text-gray-600">Outstanding A/R</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle>Patient Acquisition</CardTitle>
                <CardDescription>New patient trends and sources</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-[#3B2352]">42</p>
                      <p className="text-sm text-gray-600">This Month</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">156</p>
                      <p className="text-sm text-gray-600">This Quarter</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-blue-600">498</p>
                      <p className="text-sm text-gray-600">This Year</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Referral Sources</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Physician Referrals</span>
                        <span className="font-medium">45%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Online Search</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Word of Mouth</span>
                        <span className="font-medium">18%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Social Media</span>
                        <span className="font-medium">9%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#3B2352]/20">
              <CardHeader>
                <CardTitle>Patient Outcomes</CardTitle>
                <CardDescription>Treatment effectiveness and satisfaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-3">
                      <span className="text-2xl font-bold text-green-600">4.8</span>
                    </div>
                    <p className="font-semibold">Average Satisfaction Score</p>
                    <p className="text-sm text-gray-600">Based on 1,247 patient surveys</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">94.2%</p>
                      <p className="text-sm text-blue-800">Treatment Success</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">96.8%</p>
                      <p className="text-sm text-green-800">Retention Rate</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle>Service Performance Analysis</CardTitle>
              <CardDescription>Detailed breakdown of service utilization and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-3 font-semibold">Service</th>
                      <th className="text-left p-3 font-semibold">Utilization</th>
                      <th className="text-left p-3 font-semibold">Revenue</th>
                      <th className="text-left p-3 font-semibold">Satisfaction</th>
                      <th className="text-left p-3 font-semibold">Growth</th>
                    </tr>
                  </thead>
                  <tbody>
                    {servicesData.map((service, index) => (
                      <tr key={index} className="border-b border-gray-100">
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{service.service}</p>
                            <p className="text-sm text-gray-600">
                              {service.visits && `${service.visits} visits`}
                              {service.orders && `${service.orders} orders`}
                              {service.sessions && `${service.sessions} sessions`}
                              {service.consultations && `${service.consultations} consultations`}
                              {service.calls && `${service.calls} calls`}
                            </p>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full" 
                                style={{ width: `${Math.min((service.visits || service.orders || service.sessions || service.consultations || service.calls || 0) / 600 * 100, 100)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium">
                              {Math.round((service.visits || service.orders || service.sessions || service.consultations || service.calls || 0) / 600 * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="p-3">
                          <p className="font-semibold">${service.revenue.toLocaleString()}</p>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            <span className="font-medium">{service.satisfaction}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(service.satisfaction) ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">+{(Math.random() * 15 + 5).toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staff Tab */}
        <TabsContent value="staff" className="space-y-6">
          <Card className="border-[#3B2352]/20">
            <CardHeader>
              <CardTitle>Staff Performance Dashboard</CardTitle>
              <CardDescription>Individual and team performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {staffMetrics.map((staff, index) => (
                  <Card key={index} className="border-[#D7C7ED]/50">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-[#3B2352]">{staff.name}</h3>
                          <p className="text-sm text-gray-600">{staff.role}</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Active Patients</span>
                          <span className="font-medium">{staff.patients}</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Satisfaction Score</span>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{staff.satisfaction}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < Math.floor(staff.satisfaction) ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm text-gray-600">Utilization Rate</span>
                            <span className="text-sm font-medium">{staff.utilization}%</span>
                          </div>
                          <Progress value={staff.utilization} className="h-2" />
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Revenue Generated</span>
                          <span className="font-medium">${staff.revenue.toLocaleString()}</span>
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full mt-4" size="sm">
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}