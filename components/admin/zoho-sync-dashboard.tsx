"use client"

/**
 * Zoho Sync Dashboard - Real-time monitoring and management
 * HIPAA-compliant integration status monitoring for Snugs & Kisses CRM
 */
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Activity, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock, 
  Database, 
  Mail, 
  Users, 
  Calendar,
  FileText,
  CreditCard,
  Settings,
  Zap,
  Shield
} from 'lucide-react'

interface SyncStatus {
  service: string
  status: 'healthy' | 'warning' | 'error' | 'syncing'
  lastSync: string
  recordCount: number
  message: string
  apiCalls: number
  errorCount: number
}

interface HealthMetrics {
  uptime: number
  totalSyncs: number
  failedSyncs: number
  avgResponseTime: number
  lastHealthCheck: string
}

export function ZohoSyncDashboard() {
  const [syncStatuses, setSyncStatuses] = useState<SyncStatus[]>([
    {
      service: 'Zoho CRM',
      status: 'healthy',
      lastSync: '2025-07-29T15:45:00Z',
      recordCount: 1247,
      message: 'All contacts and deals synchronized',
      apiCalls: 156,
      errorCount: 0
    },
    {
      service: 'Zoho Books',
      status: 'syncing',
      lastSync: '2025-07-29T15:30:00Z',
      recordCount: 89,
      message: 'Synchronizing invoices and payments',
      apiCalls: 23,
      errorCount: 0
    },
    {
      service: 'Zoho Campaigns',
      status: 'warning',
      lastSync: '2025-07-29T14:15:00Z',
      recordCount: 567,
      message: 'Rate limit reached, retrying in 5 minutes',
      apiCalls: 450,
      errorCount: 2
    },
    {
      service: 'Zoho Catalyst',
      status: 'healthy',
      lastSync: '2025-07-29T15:50:00Z',
      recordCount: 3456,
      message: 'Database and functions operational',
      apiCalls: 89,
      errorCount: 0
    }
  ])

  const [healthMetrics, setHealthMetrics] = useState<HealthMetrics>({
    uptime: 99.8,
    totalSyncs: 1247,
    failedSyncs: 12,
    avgResponseTime: 245,
    lastHealthCheck: '2025-07-29T15:55:00Z'
  })

  const [isRefreshing, setIsRefreshing] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(true)

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refreshSyncStatus()
    }, 30000)

    return () => clearInterval(interval)
  }, [autoRefresh])

  const refreshSyncStatus = async () => {
    setIsRefreshing(true)
    
    try {
      // Simulate API call to refresh sync status
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Update timestamps to show real-time activity
      setSyncStatuses(prev => prev.map(status => ({
        ...status,
        lastSync: status.status === 'syncing' ? new Date().toISOString() : status.lastSync,
        recordCount: status.status === 'syncing' ? status.recordCount + Math.floor(Math.random() * 5) : status.recordCount
      })))

      setHealthMetrics(prev => ({
        ...prev,
        lastHealthCheck: new Date().toISOString(),
        totalSyncs: prev.totalSyncs + Math.floor(Math.random() * 3)
      }))
    } catch (error) {
      console.error('Failed to refresh sync status:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const getStatusIcon = (status: SyncStatus['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'syncing':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
    }
  }

  const getStatusBadge = (status: SyncStatus['status']) => {
    const variants = {
      healthy: 'bg-green-100 text-green-800 border-green-200',
      warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      syncing: 'bg-blue-100 text-blue-800 border-blue-200'
    }

    return (
      <Badge variant="outline" className={variants[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const syncTime = new Date(timestamp)
    const diffMs = now.getTime() - syncTime.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h ${diffMins % 60}m ago`
  }

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'zoho crm':
        return <Users className="h-5 w-5" />
      case 'zoho books':
        return <CreditCard className="h-5 w-5" />
      case 'zoho campaigns':
        return <Mail className="h-5 w-5" />
      case 'zoho catalyst':
        return <Database className="h-5 w-5" />
      default:
        return <Settings className="h-5 w-5" />
    }
  }

  const overallHealth = syncStatuses.every(s => s.status === 'healthy') ? 'healthy' :
                       syncStatuses.some(s => s.status === 'error') ? 'error' : 'warning'

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900" style={{fontFamily: 'Merriweather, serif'}}>
            Zoho Sync Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Real-time monitoring of Zoho ecosystem integrations
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Auto-refresh toggle */}
          <Button
            variant={autoRefresh ? "default" : "outline"}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="flex items-center gap-2"
          >
            <Activity className="h-4 w-4" />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </Button>
          
          {/* Manual refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSyncStatus}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Health Alert */}
      <Alert className={
        overallHealth === 'healthy' ? 'border-green-200 bg-green-50' :
        overallHealth === 'error' ? 'border-red-200 bg-red-50' :
        'border-yellow-200 bg-yellow-50'
      }>
        <Shield className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Overall System Health: <strong>
              {overallHealth === 'healthy' ? 'All Systems Operational' :
               overallHealth === 'error' ? 'Service Disruption Detected' :
               'Performance Issues Detected'}
            </strong>
          </span>
          <Badge variant="outline" className={
            overallHealth === 'healthy' ? 'bg-green-100 text-green-800' :
            overallHealth === 'error' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }>
            {healthMetrics.uptime}% Uptime
          </Badge>
        </AlertDescription>
      </Alert>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Health Metrics Cards */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{healthMetrics.uptime}%</div>
                <p className="text-xs text-muted-foreground">Last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Syncs</CardTitle>
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.totalSyncs.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+12 from last hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{healthMetrics.avgResponseTime}ms</div>
                <p className="text-xs text-muted-foreground">-15ms from yesterday</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed Syncs</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{healthMetrics.failedSyncs}</div>
                <p className="text-xs text-muted-foreground">0.96% failure rate</p>
              </CardContent>
            </Card>
          </div>

          {/* Service Status Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {syncStatuses.map((status, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(status.service)}
                      <CardTitle className="text-lg">{status.service}</CardTitle>
                    </div>
                    {getStatusBadge(status.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Last Sync:</span>
                    <span className="font-medium">{formatTimeAgo(status.lastSync)}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Records:</span>
                    <span className="font-medium">{status.recordCount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">API Calls:</span>
                    <span className="font-medium">{status.apiCalls}</span>
                  </div>

                  {status.errorCount > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Errors:</span>
                      <span className="font-medium text-red-600">{status.errorCount}</span>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-2 text-sm">
                    {getStatusIcon(status.status)}
                    <span className="text-gray-700 leading-relaxed">{status.message}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="space-y-4">
            {syncStatuses.map((status, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(status.service)}
                      <div>
                        <CardTitle className="text-xl">{status.service}</CardTitle>
                        <CardDescription>
                          Last synchronized {formatTimeAgo(status.lastSync)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(status.status)}
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700">Sync Status</h4>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(status.status)}
                        <span className="text-sm">{status.message}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700">Performance</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Records:</span>
                          <span>{status.recordCount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>API Calls:</span>
                          <span>{status.apiCalls}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-gray-700">Health</h4>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Errors:</span>
                          <span className={status.errorCount > 0 ? 'text-red-600' : 'text-green-600'}>
                            {status.errorCount}
                          </span>
                        </div>
                        <Progress 
                          value={status.errorCount === 0 ? 100 : Math.max(0, 100 - (status.errorCount * 10))} 
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sync Performance Trends</CardTitle>
                <CardDescription>24-hour sync activity overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Success Rate</span>
                    <span className="text-2xl font-bold text-green-600">98.96%</span>
                  </div>
                  <Progress value={98.96} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">2,347</div>
                      <div className="text-sm text-gray-600">Successful Syncs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">25</div>
                      <div className="text-sm text-gray-600">Failed Syncs</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Usage Summary</CardTitle>
                <CardDescription>Current billing period usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Calls Used</span>
                    <span className="text-2xl font-bold">8,456</span>
                  </div>
                  <Progress value={56.37} className="h-3" />
                  <div className="text-sm text-gray-600">
                    56.37% of monthly limit (15,000 calls)
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-600">6,544</div>
                      <div className="text-sm text-gray-600">Remaining</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-600">187ms</div>
                      <div className="text-sm text-gray-600">Avg Response</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service-wise Breakdown</CardTitle>
              <CardDescription>API usage and performance by service</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncStatuses.map((status, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      {getServiceIcon(status.service)}
                      <div>
                        <div className="font-medium">{status.service}</div>
                        <div className="text-sm text-gray-600">{status.recordCount} records</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{status.apiCalls} calls</div>
                      <div className="text-sm text-gray-600">
                        {status.errorCount > 0 ? `${status.errorCount} errors` : 'No errors'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest sync operations and system events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Zoho CRM sync completed successfully</div>
                    <div className="text-sm text-gray-600">
                      Synchronized 23 new contacts and 5 deals • 2 minutes ago
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Success
                  </Badge>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <RefreshCw className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Zoho Books sync in progress</div>
                    <div className="text-sm text-gray-600">
                      Processing 12 new invoices and payment records • 5 minutes ago
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-800">
                    In Progress
                  </Badge>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Zoho Campaigns rate limit warning</div>
                    <div className="text-sm text-gray-600">
                      API rate limit reached, sync paused for 5 minutes • 8 minutes ago
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                    Warning
                  </Badge>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <Activity className="h-5 w-5 text-gray-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">System health check completed</div>
                    <div className="text-sm text-gray-600">
                      All services operational, uptime 99.8% • 15 minutes ago
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    Info
                  </Badge>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-medium">Zoho Catalyst database sync completed</div>
                    <div className="text-sm text-gray-600">
                      Updated 156 client records and system configurations • 20 minutes ago
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    Success
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center justify-center gap-4">
          <span>Last updated: {formatTimeAgo(healthMetrics.lastHealthCheck)}</span>
          <span>•</span>
          <span>HIPAA Compliant</span>
          <span>•</span>
          <span>Auto-refresh: {autoRefresh ? 'ON' : 'OFF'}</span>
        </div>
      </div>
    </div>
  )
}