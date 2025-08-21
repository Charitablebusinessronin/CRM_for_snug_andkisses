"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, CheckCircle, AlertCircle, XCircle, ExternalLink } from "lucide-react"

interface TestResult {
  name: string
  status: "PASS" | "FAIL" | "WARN" | "ERROR"
  details: string
  critical: boolean
}

interface IntegrationStatus {
  success: boolean
  status: "HEALTHY" | "DEGRADED" | "CRITICAL"
  message: string
  results: {
    timestamp: string
    tests: TestResult[]
    summary: {
      total: number
      passed: number
      failed: number
      warnings: number
    }
  }
  nextSteps: string[]
}

export function ZohoIntegrationStatus() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [lastChecked, setLastChecked] = useState<string | null>(null)

  const runIntegrationTest = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/v1/test/integration")
      const data = await response.json()
      setStatus(data)
      setLastChecked(new Date().toLocaleString())
    } catch (error) {
      console.error("Integration test failed:", error)
      setStatus({
        success: false,
        status: "CRITICAL",
        message: "Failed to run integration test",
        results: {
          timestamp: new Date().toISOString(),
          tests: [],
          summary: { total: 0, passed: 0, failed: 1, warnings: 0 },
        },
        nextSteps: ["Check network connection", "Verify API endpoints"],
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runIntegrationTest()
  }, [])

  const getStatusColor = (testStatus: string) => {
    switch (testStatus) {
      case "PASS":
        return "text-green-600 bg-green-50 border-green-200"
      case "WARN":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "FAIL":
      case "ERROR":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusIcon = (testStatus: string) => {
    switch (testStatus) {
      case "PASS":
        return <CheckCircle className="h-4 w-4" />
      case "WARN":
        return <AlertCircle className="h-4 w-4" />
      case "FAIL":
      case "ERROR":
        return <XCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Zoho Integration Status</CardTitle>
              <CardDescription>System health and integration test results</CardDescription>
            </div>
            <Button
              onClick={runIntegrationTest}
              disabled={isLoading}
              className="bg-[#3B2352] hover:bg-[#3B2352]/90 text-white"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Run Test
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {status && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Badge
                  variant="outline"
                  className={
                    status.status === "HEALTHY"
                      ? "border-green-500 text-green-600"
                      : status.status === "DEGRADED"
                        ? "border-yellow-500 text-yellow-600"
                        : "border-red-500 text-red-600"
                  }
                >
                  {status.status}
                </Badge>
                <span className="text-sm text-gray-600">Last checked: {lastChecked}</span>
              </div>

              <p className="text-gray-700">{status.message}</p>

              {status.results && (
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#3B2352]">{status.results.summary.total}</div>
                    <div className="text-sm text-gray-600">Total Tests</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{status.results.summary.passed}</div>
                    <div className="text-sm text-gray-600">Passed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{status.results.summary.failed}</div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-600">{status.results.summary.warnings}</div>
                    <div className="text-sm text-gray-600">Warnings</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Test Results */}
      {status?.results && (
        <Card className="border-[#3B2352]/20">
          <CardHeader>
            <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Test Results</CardTitle>
            <CardDescription>Detailed results from integration testing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {status.results.tests.map((test, index) => (
                <div key={index} className={`p-3 border rounded-lg ${getStatusColor(test.status)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(test.status)}
                      <span className="font-medium">{test.name}</span>
                      {test.critical && (
                        <Badge variant="outline" className="text-xs">
                          Critical
                        </Badge>
                      )}
                    </div>
                    <Badge variant="outline" className={getStatusColor(test.status)}>
                      {test.status}
                    </Badge>
                  </div>
                  <p className="text-sm mt-2 ml-6">{test.details}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {status?.nextSteps && status.nextSteps.length > 0 && (
        <Card className="border-[#3B2352]/20">
          <CardHeader>
            <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Recommended Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {status.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-[#3B2352] rounded-full mt-2" />
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white bg-transparent"
              onClick={() => window.open("/api/v1/zoho/auth", "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Get Refresh Token
            </Button>
            <Button
              variant="outline"
              className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white bg-transparent"
              onClick={() => window.open("/api/v1/contact", "_blank")}
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Test Contact API
            </Button>
            <Button
              variant="outline"
              className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white bg-transparent"
              onClick={runIntegrationTest}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Status
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Missing Refresh Token Alert */}
      {!process.env.ZOHO_REFRESH_TOKEN && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Action Required:</strong> Zoho refresh token is missing. Click "Get Refresh Token" above to obtain
            it, then add it to your environment variables.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
