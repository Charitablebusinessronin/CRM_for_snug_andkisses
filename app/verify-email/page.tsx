"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Loader2, Heart } from "lucide-react"

function VerifyEmailContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading')
  const [message, setMessage] = useState('')
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided.')
      return
    }

    verifyEmail(token)
  }, [token])

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/v1/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message || 'Your email has been verified successfully!')
      } else {
        if (data.error?.includes('expired')) {
          setStatus('expired')
        } else {
          setStatus('error')
        }
        setMessage(data.error || 'Verification failed.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('An unexpected error occurred. Please try again.')
    }
  }

  const resendVerification = async () => {
    // This would need the user's email - in a real app, you might store this or ask for it
    try {
      const response = await fetch('/api/v1/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ /* email would go here */ })
      })

      if (response.ok) {
        setMessage('Verification email sent! Please check your inbox.')
      } else {
        setMessage('Failed to resend verification email.')
      }
    } catch (error) {
      setMessage('Failed to resend verification email.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6FF] to-[#E8E3FF] flex items-center justify-center p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-[#3B2352]" />
            <h1 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
              Snug & Kisses
            </h1>
          </div>
        </div>

        <Card className="border-[#3B2352]/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-[#3B2352]">
              Email Verification
            </CardTitle>
            <CardDescription>
              Confirming your account registration
            </CardDescription>
          </CardHeader>

          <CardContent className="text-center space-y-6">
            {status === 'loading' && (
              <div className="space-y-4">
                <Loader2 className="h-16 w-16 animate-spin text-[#3B2352] mx-auto" />
                <p className="text-gray-600">Verifying your email address...</p>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-4">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Email Verified Successfully!
                  </h3>
                  <p className="text-green-700 mb-4">{message}</p>
                </div>
                
                <Alert className="border-green-200 bg-green-50 text-left">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Account Activated!</strong> Your Snug & Kisses account is now active. 
                    You can log in and access all features of your personalized care portal.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.href = '/auth/signin'} 
                    className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90"
                  >
                    Sign In to Your Account
                  </Button>
                  
                  <div className="text-sm text-gray-600">
                    <p><strong>Next Steps:</strong></p>
                    <ul className="text-left mt-2 space-y-1">
                      <li>• Complete your profile setup</li>
                      <li>• Schedule your initial consultation</li>
                      <li>• Explore our care services</li>
                      <li>• Connect with your care team</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-4">
                <AlertTriangle className="h-16 w-16 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-red-800 mb-2">
                    Verification Failed
                  </h3>
                  <p className="text-red-700 mb-4">{message}</p>
                </div>
                
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    The verification link may be invalid or corrupted. Please try registering again 
                    or contact our support team for assistance.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button 
                    onClick={() => window.location.href = '/register'} 
                    className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90"
                  >
                    Register New Account
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/contact'} 
                    className="w-full"
                  >
                    Contact Support
                  </Button>
                </div>
              </div>
            )}

            {status === 'expired' && (
              <div className="space-y-4">
                <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto" />
                <div>
                  <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                    Verification Link Expired
                  </h3>
                  <p className="text-yellow-700 mb-4">{message}</p>
                </div>
                
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    Your verification link has expired for security reasons. 
                    Verification links are valid for 24 hours after registration.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <Button 
                    onClick={resendVerification}
                    className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90"
                  >
                    Resend Verification Email
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/register'} 
                    className="w-full"
                  >
                    Register Again
                  </Button>
                </div>
              </div>
            )}

            {/* Support Information */}
            <div className="border-t pt-6 text-sm text-gray-600">
              <p className="mb-2"><strong>Need Help?</strong></p>
              <div className="space-y-1">
                <p>📞 Phone: <a href="tel:+15551234567" className="text-[#3B2352]">(555) 123-4567</a></p>
                <p>📧 Email: <a href="mailto:support@snugandkisses.com" className="text-[#3B2352]">support@snugandkisses.com</a></p>
                <p className="text-xs text-gray-500 mt-3">
                  Available 24/7 for urgent support needs
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-[#F8F6FF] to-[#E8E3FF] flex items-center justify-center p-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Heart className="h-8 w-8 text-[#3B2352]" />
              <h1 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                Snug & Kisses
              </h1>
            </div>
          </div>
          <Card className="border-[#3B2352]/20 shadow-lg">
            <CardContent className="text-center space-y-6 p-8">
              <Loader2 className="h-16 w-16 animate-spin text-[#3B2352] mx-auto" />
              <p className="text-gray-600">Loading verification page...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  )
}