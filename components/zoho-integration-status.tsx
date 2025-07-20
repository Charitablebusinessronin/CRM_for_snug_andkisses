"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, RefreshCw, ExternalLink } from "lucide-react"
import { zohoClient } from "@/lib/zoho-client"

export function ZohoIntegrationStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    checkConnectionStatus()

    // Check for URL parameters (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search)
    const errorParam = urlParams.get("error")
    const successParam = urlParams.get("success")

    if (errorParam) {
      setError(getErrorMessage(errorParam))
    }

    if (successParam === "zoho_connected") {
      setSuccess("Successfully connected to Zoho One!")
      checkConnectionStatus()
    }
  }, [])

  const checkConnectionStatus = () => {
    setIsConnected(zohoClient.isAuthenticated())
  }

  const handleConnect = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Redirect to OAuth authorization
      window.location.href = "/api/auth/zoho/authorize"
    } catch (err) {
      setError("Failed to initiate Zoho connection")
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    zohoClient.clearTokens()
    setIsConnected(false)
    setSuccess("Disconnected from Zoho One")
  }

  const handleRefresh = async () => {
    setIsLoading(true)
    setError(null)

    try {
      await zohoClient.refreshAccessToken()
      setIsConnected(true)
      setSuccess("Zoho connection refreshed successfully")
    } catch (err) {
      setError("Failed to refresh Zoho connection")
      setIsConnected(false)
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (errorCode: string): string => {
    const errorMessages: Record<string, string> = {
      access_denied: "Access was denied. Please try connecting again.",
      missing_code: "Authorization code was missing. Please try again.",
      token_exchange_failed: "Failed to exchange authorization code for tokens.",
      invalid_request: "Invalid request. Please check your configuration.",
    }

    return errorMessages[errorCode] || `Unknown error: ${errorCode}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Zoho One Integration
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </CardTitle>
        <CardDescription>Connect your CRM to Zoho One for seamless data synchronization</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Connection Status</p>
            <Badge variant={isConnected ? "default" : "secondary"}>{isConnected ? "Connected" : "Not Connected"}</Badge>
          </div>

          <div className="flex gap-2">
            {isConnected ? (
              <>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" onClick={handleDisconnect}>
                  Disconnect
                </Button>
              </>
            ) : (
              <Button onClick={handleConnect} disabled={isLoading}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect to Zoho One
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {isConnected && (
          <div className="space-y-2">
            <p className="text-sm font-medium">Connected Services:</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Zoho CRM</Badge>
              <Badge variant="outline">Zoho Books</Badge>
              <Badge variant="outline">Zoho Campaigns</Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
