"use client"

import React, { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Shield, Smartphone, Mail, Clock, ArrowLeft, 
  CheckCircle, AlertCircle, Loader2, RefreshCw
} from "lucide-react"
import { AuthService } from "../services/AuthService"
import type { MFAVerificationRequest, AuthResponse } from "../types/AuthTypes"

/**
 * MFA Verification Component - HIPAA Compliant Two-Factor Authentication
 * Provides secure MFA verification with multiple delivery methods
 */
export function MFAVerification() {
  const [verificationCode, setVerificationCode] = useState<string[]>(new Array(6).fill(""))
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [timeRemaining, setTimeRemaining] = useState(300) // 5 minutes
  const [mfaMethod, setMfaMethod] = useState<'sms' | 'email'>('sms')
  const [attemptsRemaining, setAttemptsRemaining] = useState(3)

  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const authService = new AuthService()

  useEffect(() => {
    // Start countdown timer
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Focus first input
    inputRefs.current[0]?.focus()

    return () => clearInterval(timer)
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleInputChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return

    const newCode = [...verificationCode]
    newCode[index] = value

    setVerificationCode(newCode)

    // Clear errors when user types
    if (error) {
      setError("")
    }

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all fields are filled
    if (index === 5 && value !== "" && newCode.every(digit => digit !== "")) {
      handleVerifyCode(newCode.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Handle backspace
    if (e.key === 'Backspace' && verificationCode[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    
    // Handle paste
    if (e.key === 'v' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      navigator.clipboard.readText().then(text => {
        const pastedCode = text.replace(/\D/g, '').slice(0, 6)
        if (pastedCode.length === 6) {
          const newCode = pastedCode.split('')
          setVerificationCode(newCode)
          handleVerifyCode(pastedCode)
        }
      })
    }
  }

  const handleVerifyCode = async (code?: string) => {
    const codeToVerify = code || verificationCode.join("")
    
    if (codeToVerify.length !== 6) {
      setError("Please enter the complete 6-digit code")
      return
    }

    if (timeRemaining <= 0) {
      setError("Verification code has expired. Please request a new one.")
      return
    }

    try {
      setLoading(true)
      setError("")

      const mfaToken = sessionStorage.getItem('mfa_token')
      if (!mfaToken) {
        setError("Session expired. Please sign in again.")
        setTimeout(() => {
          window.location.href = '/auth/signin'
        }, 2000)
        return
      }

      const verificationRequest: MFAVerificationRequest = {
        mfaToken,
        verificationCode: codeToVerify,
        method: mfaMethod
      }

      const response: AuthResponse = await authService.verifyMFA(verificationRequest)

      if (response.success && response.user) {
        setSuccess("Verification successful! Redirecting...")
        
        // Store auth token
        sessionStorage.setItem('snug_auth_token', response.token!)
        sessionStorage.removeItem('mfa_token')

        // Redirect based on user role
        setTimeout(() => {
          switch (response.user!.role) {
            case 'admin':
              window.location.href = '/admin/dashboard'
              break
            case 'employee':
              window.location.href = '/employee/dashboard'
              break
            case 'client':
              window.location.href = '/client/dashboard'
              break
            case 'contractor':
              window.location.href = '/contractor/dashboard'
              break
            default:
              window.location.href = '/dashboard'
          }
        }, 1500)

      } else {
        setAttemptsRemaining(prev => prev - 1)
        
        if (attemptsRemaining <= 1) {
          setError("Too many failed attempts. Please sign in again.")
          setTimeout(() => {
            window.location.href = '/auth/signin'
          }, 3000)
        } else {
          setError(`Invalid verification code. ${attemptsRemaining - 1} attempts remaining.`)
        }
        
        // Clear the code inputs
        setVerificationCode(new Array(6).fill(""))
        inputRefs.current[0]?.focus()
      }

    } catch (error) {
      console.error('MFA verification error:', error)
      setError("Verification failed. Please try again.")
      
      // Clear the code inputs
      setVerificationCode(new Array(6).fill(""))
      inputRefs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    try {
      setResending(true)
      setError("")
      
      const mfaToken = sessionStorage.getItem('mfa_token')
      if (!mfaToken) {
        setError("Session expired. Please sign in again.")
        return
      }

      await authService.resendMFACode(mfaToken, mfaMethod)
      
      setSuccess(`New verification code sent via ${mfaMethod === 'sms' ? 'SMS' : 'email'}`)
      setTimeRemaining(300) // Reset timer
      setAttemptsRemaining(3) // Reset attempts
      
      setTimeout(() => setSuccess(""), 3000)
      
    } catch (error) {
      console.error('Resend MFA code error:', error)
      setError("Failed to resend code. Please try again.")
    } finally {
      setResending(false)
    }
  }

  const handleSwitchMethod = () => {
    setMfaMethod(prev => prev === 'sms' ? 'email' : 'sms')
    setError("")
    setSuccess("")
  }

  const handleGoBack = () => {
    sessionStorage.removeItem('mfa_token')
    window.location.href = '/auth/signin'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-[#3B2352]" />
          </div>
          <h1 className="text-2xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
            Two-Factor Authentication
          </h1>
          <p className="text-gray-600 mt-2">Additional security verification required</p>
        </div>

        {/* MFA Form */}
        <Card className="border-[#3B2352]/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-center">
              Enter Verification Code
            </CardTitle>
            <CardDescription className="text-center">
              We've sent a 6-digit code to your {mfaMethod === 'sms' ? 'phone' : 'email'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Success Message */}
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            {/* Code Input */}
            <div className="space-y-4">
              <Label className="text-center block">6-Digit Verification Code</Label>
              <div className="flex justify-center space-x-2">
                {verificationCode.map((digit, index) => (
                  <Input
                    key={index}
                    ref={el => inputRefs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleInputChange(index, e.target.value)}
                    onKeyDown={e => handleKeyDown(index, e)}
                    className="w-12 h-12 text-center text-lg font-bold"
                    disabled={loading || timeRemaining <= 0}
                  />
                ))}
              </div>
            </div>

            {/* Timer and Attempts */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>Code expires in {formatTime(timeRemaining)}</span>
              </div>
              
              {attemptsRemaining < 3 && (
                <p className="text-sm text-orange-600">
                  {attemptsRemaining} attempts remaining
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={() => handleVerifyCode()}
                disabled={loading || verificationCode.some(digit => digit === "") || timeRemaining <= 0}
                className="w-full bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleResendCode}
                  disabled={resending || timeRemaining > 240}
                  className="text-[#3B2352] border-[#3B2352]"
                >
                  {resending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Resending...
                    </>
                  ) : (
                    <>
                      {mfaMethod === 'sms' ? <Smartphone className="mr-2 h-4 w-4" /> : <Mail className="mr-2 h-4 w-4" />}
                      Resend
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleSwitchMethod}
                  disabled={loading || resending}
                  className="text-[#3B2352] border-[#3B2352]"
                >
                  {mfaMethod === 'sms' ? (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Use Email
                    </>
                  ) : (
                    <>
                      <Smartphone className="mr-2 h-4 w-4" />
                      Use SMS
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Back Link */}
            <div className="text-center">
              <button
                onClick={handleGoBack}
                className="inline-flex items-center text-sm text-[#3B2352] hover:underline"
                disabled={loading}
              >
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Sign In
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">Security Notice</h4>
                <p className="text-blue-800 text-xs">
                  This additional verification step helps protect your healthcare information. 
                  Never share your verification code with anyone.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>
            Having trouble? 
            <a href="/support" className="text-[#3B2352] hover:underline ml-1">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}