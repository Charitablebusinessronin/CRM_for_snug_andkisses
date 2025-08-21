"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExternalLink, CheckCircle, AlertCircle } from "lucide-react"

export function ZohoSetupGuide() {
  const [currentStep, setCurrentStep] = useState(1)
  const [authUrl, setAuthUrl] = useState<string>("")
  const [refreshToken, setRefreshToken] = useState<string>("")

  const getAuthUrl = async () => {
    try {
      const response = await fetch("/api/v1/zoho/auth")
      const data = await response.json()
      if (data.authUrl) {
        setAuthUrl(data.authUrl)
        setCurrentStep(2)
      }
    } catch (error) {
      console.error("Failed to get auth URL:", error)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const steps = [
    {
      title: "Get Authorization URL",
      description: "Generate the Zoho authorization URL",
      action: "Get Auth URL",
      completed: authUrl !== "",
    },
    {
      title: "Authorize Application",
      description: "Sign in to Zoho and authorize the application",
      action: "Open Zoho Auth",
      completed: false,
    },
    {
      title: "Get Refresh Token",
      description: "Exchange authorization code for refresh token",
      action: "Get Token",
      completed: refreshToken !== "",
    },
    {
      title: "Update Environment",
      description: "Add refresh token to your .env file",
      action: "Copy Token",
      completed: false,
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Zoho Integration Setup</CardTitle>
          <CardDescription>Complete these steps to activate your Zoho CRM integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Progress Steps */}
            <div className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        step.completed
                          ? "bg-green-100 text-green-600"
                          : currentStep === index + 1
                            ? "bg-[#3B2352] text-white"
                            : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {step.completed ? <CheckCircle className="h-4 w-4" /> : index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{step.title}</div>
                      <div className="text-sm text-gray-600">{step.description}</div>
                    </div>
                  </div>
                  <div className="ml-auto">
                    {index === 0 && !authUrl && (
                      <Button onClick={getAuthUrl} className="bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">
                        {step.action}
                      </Button>
                    )}
                    {index === 1 && authUrl && (
                      <Button
                        onClick={() => window.open(authUrl, "_blank")}
                        className="bg-[#3B2352] hover:bg-[#3B2352]/90 text-white"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {step.action}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Current Instructions */}
            {currentStep === 1 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Step 1:</strong> Click "Get Auth URL" to generate your Zoho authorization link.
                </AlertDescription>
              </Alert>
            )}

            {currentStep === 2 && authUrl && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Step 2:</strong> Click "Open Zoho Auth" to sign in to Zoho and authorize the application.
                  After authorization, you'll be redirected back with a code.
                </AlertDescription>
              </Alert>
            )}

            {/* Environment Variables */}
            <Card className="bg-gray-50">
              <CardHeader>
                <CardTitle className="text-lg">Environment Variables Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>ZOHO_ONE_CLIENT_ID</span>
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Set
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ZOHO_ONE_CLIENT_SECRET</span>
                    <Badge variant="outline" className="border-green-500 text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Set
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>ZOHO_REFRESH_TOKEN</span>
                    <Badge variant="outline" className="border-red-500 text-red-600">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Missing
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white bg-transparent"
                onClick={() => window.open("/api/v1/test/integration", "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Test Integration
              </Button>
              <Button
                variant="outline"
                className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white bg-transparent"
                onClick={() => window.open("https://api-console.zoho.com/", "_blank")}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Zoho API Console
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-[#3B2352]/20">
        <CardHeader>
          <CardTitle style={{ fontFamily: "Merriweather, serif" }}>Troubleshooting</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <strong>If authorization fails:</strong>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                <li>Verify your Client ID and Secret are correct</li>
                <li>Check that the redirect URI matches exactly in Zoho Console</li>
                <li>Ensure your Zoho account has CRM access permissions</li>
              </ul>
            </div>
            <div>
              <strong>If token exchange fails:</strong>
              <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                <li>Make sure the authorization code hasn't expired (10 minutes)</li>
                <li>Verify all environment variables are set correctly</li>
                <li>Check the server logs for detailed error messages</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
