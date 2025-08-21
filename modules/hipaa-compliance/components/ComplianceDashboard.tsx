"use client"

import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Shield, AlertTriangle, CheckCircle, Clock, Users, 
  FileText, TrendingUp, Download, Eye, Search, Activity
} from "lucide-react"
import { HIPAAAuditService } from "../services/HIPAAAuditService"
import type { ComplianceReport, ComplianceViolation } from "../services/HIPAAAuditService"

interface ComplianceDashboardProps {
  onReportGenerated?: (report: ComplianceReport) => void
}

/**
 * HIPAA Compliance Dashboard Component
 * Comprehensive HIPAA compliance monitoring and reporting interface
 */
export function ComplianceDashboard({ onReportGenerated }: ComplianceDashboardProps) {
  const [complianceData, setComplianceData] = useState<{
    overallScore: number
    recentViolations: ComplianceViolation[]
    auditEvents: number
    activeIncidents: number
    lastAssessment: string
  }>({
    overallScore: 96,
    recentViolations: [],
    auditEvents: 1247,
    activeIncidents: 2,
    lastAssessment: '2025-08-15'
  })

  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(null)
  const [reportPeriod, setReportPeriod] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [recentReports, setRecentReports] = useState<ComplianceReport[]>([])
  const [loading, setLoading] = useState(true)

  const auditService = new HIPAAAuditService()

  useEffect(() => {
    loadComplianceData()
  }, [])

  const loadComplianceData = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API calls
      
      // Mock recent violations
      const mockViolations: ComplianceViolation[] = [
        {
          id: 'violation_001',
          type: 'excessive-access',
          severity: 'MEDIUM',
          description: 'User accessed 15+ patient records in 1 hour',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          userId: 'user_123',
          resolved: false
        },
        {
          id: 'violation_002',
          type: 'after-hours-access',
          severity: 'LOW',
          description: 'PHI access outside business hours',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          userId: 'user_456',
          resolved: true
        }
      ]

      setComplianceData(prev => ({
        ...prev,
        recentViolations: mockViolations
      }))

    } catch (error) {
      console.error('Failed to load compliance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true)
      
      const report = await auditService.generateComplianceReport(
        reportPeriod.startDate,
        reportPeriod.endDate
      )
      
      setRecentReports(prev => [report, ...prev.slice(0, 9)])
      setSelectedReport(report)
      
      if (onReportGenerated) {
        onReportGenerated(report)
      }

    } catch (error) {
      console.error('Failed to generate report:', error)
    } finally {
      setIsGeneratingReport(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600'
    if (score >= 85) return 'text-yellow-600'
    if (score >= 70) return 'text-orange-600'
    return 'text-red-600'
  }

  const getScoreBackground = (score: number) => {
    if (score >= 95) return 'bg-green-50 border-green-200'
    if (score >= 85) return 'bg-yellow-50 border-yellow-200'
    if (score >= 70) return 'bg-orange-50 border-orange-200'
    return 'bg-red-50 border-red-200'
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200'
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTimeAgo = (timestamp: string) => {
    const elapsed = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(elapsed / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    return `${minutes}m ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-pulse text-[#3B2352] mx-auto mb-4" />
          <p className="text-[#3B2352] font-medium">Loading compliance dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-[#3B2352]" />
              <span>HIPAA Compliance Dashboard</span>
            </div>
          </CardTitle>
          <CardDescription>
            Monitor compliance status, audit trails, and generate regulatory reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-4">
                Comprehensive HIPAA compliance monitoring with real-time audit logging, 
                violation detection, and automated reporting for regulatory requirements.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline" onClick={loadComplianceData}>
                <Activity className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isGeneratingReport ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Overall Score */}
        <Card className={`border-2 ${getScoreBackground(complianceData.overallScore)}`}>
          <CardContent className="p-6 text-center">
            <Shield className="h-10 w-10 mx-auto mb-3 text-[#3B2352]" />
            <div className={`text-3xl font-bold mb-2 ${getScoreColor(complianceData.overallScore)}`}>
              {complianceData.overallScore}%
            </div>
            <p className="text-sm font-medium text-gray-700">Overall Compliance Score</p>
            <p className="text-xs text-gray-500 mt-1">
              {complianceData.overallScore >= 95 ? 'Excellent' :
               complianceData.overallScore >= 85 ? 'Good' :
               complianceData.overallScore >= 70 ? 'Needs Attention' : 'Critical'}
            </p>
          </CardContent>
        </Card>

        {/* Active Violations */}
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-10 w-10 mx-auto mb-3 text-orange-600" />
            <div className="text-3xl font-bold text-orange-600 mb-2">
              {complianceData.recentViolations.filter(v => !v.resolved).length}
            </div>
            <p className="text-sm font-medium text-gray-700">Active Violations</p>
            <p className="text-xs text-gray-500 mt-1">
              {complianceData.recentViolations.filter(v => v.severity === 'CRITICAL').length} critical
            </p>
          </CardContent>
        </Card>

        {/* Audit Events */}
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-6 text-center">
            <Activity className="h-10 w-10 mx-auto mb-3 text-[#3B2352]" />
            <div className="text-3xl font-bold text-[#3B2352] mb-2">
              {complianceData.auditEvents.toLocaleString()}
            </div>
            <p className="text-sm font-medium text-gray-700">Audit Events (30d)</p>
            <p className="text-xs text-gray-500 mt-1">All access logged</p>
          </CardContent>
        </Card>

        {/* Last Assessment */}
        <Card className="border-[#D7C7ED]/50">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-10 w-10 mx-auto mb-3 text-green-600" />
            <div className="text-lg font-bold text-[#3B2352] mb-2">
              {formatDate(complianceData.lastAssessment)}
            </div>
            <p className="text-sm font-medium text-gray-700">Last Risk Assessment</p>
            <p className="text-xs text-gray-500 mt-1">Next due: {formatDate('2026-08-15')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Violations */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle>Recent Violations</CardTitle>
          <CardDescription>
            Policy violations requiring attention and remediation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {complianceData.recentViolations.length > 0 ? (
            <div className="space-y-4">
              {complianceData.recentViolations.map((violation) => (
                <div key={violation.id} className="p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <AlertTriangle className="h-5 w-5 text-orange-600" />
                        <h4 className="font-semibold text-[#3B2352]">
                          {violation.type.replace('-', ' ').toUpperCase()}
                        </h4>
                        <Badge 
                          variant="secondary" 
                          className={getSeverityColor(violation.severity)}
                        >
                          {violation.severity}
                        </Badge>
                        <Badge 
                          variant={violation.resolved ? "default" : "destructive"}
                          className={violation.resolved ? "bg-green-100 text-green-800" : ""}
                        >
                          {violation.resolved ? "Resolved" : "Active"}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2">
                        {violation.description}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>User: {violation.userId}</span>
                        <span>Time: {getTimeAgo(violation.timestamp)}</span>
                        <span>ID: {violation.id}</span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {!violation.resolved && (
                        <Button size="sm" className="bg-[#3B2352] text-white hover:bg-[#2A1A3E]">
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#3B2352] mb-2">
                No Recent Violations
              </h3>
              <p className="text-gray-600">
                Excellent! No policy violations detected in the last 30 days.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Compliance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audit Activity */}
        <Card className="border-[#3B2352]/20">
          <CardHeader>
            <CardTitle>Audit Activity</CardTitle>
            <CardDescription>
              Recent audit events and access patterns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">PHI Access Events</span>
                <div className="text-right">
                  <span className="font-semibold">847</span>
                  <p className="text-xs text-green-600">+12% from last month</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">User Login Events</span>
                <div className="text-right">
                  <span className="font-semibold">234</span>
                  <p className="text-xs text-blue-600">Normal activity</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">System Modifications</span>
                <div className="text-right">
                  <span className="font-semibold">23</span>
                  <p className="text-xs text-gray-500">Maintenance window</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Failed Access Attempts</span>
                <div className="text-right">
                  <span className="font-semibold text-orange-600">7</span>
                  <p className="text-xs text-orange-600">Under threshold</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment Status */}
        <Card className="border-[#3B2352]/20">
          <CardHeader>
            <CardTitle>Risk Assessment Status</CardTitle>
            <CardDescription>
              Current risk posture and mitigation progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Technical Safeguards</span>
                <div className="text-right">
                  <span className="font-semibold text-green-600">98%</span>
                  <p className="text-xs text-green-600">Compliant</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Administrative Safeguards</span>
                <div className="text-right">
                  <span className="font-semibold text-green-600">95%</span>
                  <p className="text-xs text-green-600">Compliant</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Physical Safeguards</span>
                <div className="text-right">
                  <span className="font-semibold text-yellow-600">87%</span>
                  <p className="text-xs text-yellow-600">Needs attention</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm">Business Associate Agreements</span>
                <div className="text-right">
                  <span className="font-semibold text-green-600">100%</span>
                  <p className="text-xs text-green-600">Up to date</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle>Compliance Reports</CardTitle>
          <CardDescription>
            Generate and download compliance reports for regulatory purposes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <Input
                type="date"
                value={reportPeriod.startDate}
                onChange={(e) => setReportPeriod(prev => ({
                  ...prev,
                  startDate: e.target.value
                }))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <Input
                type="date"
                value={reportPeriod.endDate}
                onChange={(e) => setReportPeriod(prev => ({
                  ...prev,
                  endDate: e.target.value
                }))}
              />
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="w-full bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
              >
                {isGeneratingReport ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>

          {/* Recent Reports */}
          {recentReports.length > 0 && (
            <div>
              <h4 className="font-semibold mb-3">Recent Reports</h4>
              <div className="space-y-2">
                {recentReports.slice(0, 5).map((report) => (
                  <div key={report.reportId} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                    <div>
                      <p className="font-medium text-sm">
                        Compliance Report - {formatDate(report.periodStart)} to {formatDate(report.periodEnd)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Generated: {formatDate(report.generatedAt)} • Score: {report.complianceScore}% • Events: {report.totalEvents}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedReport(report)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Compliance Report Details</DialogTitle>
                          </DialogHeader>
                          
                          {selectedReport && (
                            <div className="space-y-6">
                              {/* Report Summary */}
                              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <strong>Report ID:</strong> {selectedReport.reportId}
                                </div>
                                <div>
                                  <strong>Generated:</strong> {formatDate(selectedReport.generatedAt)}
                                </div>
                                <div>
                                  <strong>Period:</strong> {formatDate(selectedReport.periodStart)} - {formatDate(selectedReport.periodEnd)}
                                </div>
                                <div>
                                  <strong>Compliance Score:</strong> 
                                  <span className={`ml-2 font-bold ${getScoreColor(selectedReport.complianceScore)}`}>
                                    {selectedReport.complianceScore}%
                                  </span>
                                </div>
                              </div>

                              {/* Event Breakdown */}
                              <div>
                                <h4 className="font-semibold mb-3">Event Breakdown</h4>
                                <div className="space-y-2">
                                  {Object.entries(selectedReport.eventsByType).map(([type, count]) => (
                                    <div key={type} className="flex justify-between text-sm">
                                      <span className="capitalize">{type.replace('_', ' ')}</span>
                                      <span className="font-medium">{count}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Violations Summary */}
                              {selectedReport.violations.length > 0 && (
                                <div>
                                  <h4 className="font-semibold mb-3">Violations Summary</h4>
                                  <div className="space-y-2">
                                    {selectedReport.violations.map((violation, index) => (
                                      <div key={index} className="p-3 border rounded bg-red-50">
                                        <div className="flex justify-between items-start">
                                          <div>
                                            <p className="font-medium text-sm">{violation.type}</p>
                                            <p className="text-xs text-gray-600">{violation.description}</p>
                                          </div>
                                          <Badge className={getSeverityColor(violation.severity)}>
                                            {violation.severity}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}