"use client"

/**
 * Forgot Password Form Component
 * HIPAA-compliant password reset for Snugs & Kisses CRM
 */
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Mail, Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Form validation schema
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email address is required')
    .email('Please enter a valid email address')
    .toLowerCase()
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

interface ForgotPasswordFormProps {
  onBackToLogin?: () => void
}

export function ForgotPasswordForm({ onBackToLogin }: ForgotPasswordFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true)
    setErrorMessage('')

    try {
      // In a real implementation, this would call the password reset API
      // For demo purposes, we'll simulate the API call
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      })

      if (response.ok) {
        setIsSubmitted(true)
      } else {
        const errorData = await response.json()
        setErrorMessage(errorData.message || 'Failed to send password reset email')
      }
    } catch (error) {
      console.error('Password reset error:', error)
      setErrorMessage('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToLogin = () => {
    if (onBackToLogin) {
      onBackToLogin()
    } else {
      router.push('/auth/signin')
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D7C7ED]/10 to-white p-4">
        <Card className="w-full max-w-md border-[#3B2352]/20 shadow-lg">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-[#3B2352]" />
              <span className="text-2xl font-bold text-[#3B2352]" style={{fontFamily: 'Merriweather, serif'}}>
                Snugs & Kisses
              </span>
            </div>
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-semibold" style={{fontFamily: 'Merriweather, serif'}}>
              Check Your Email
            </CardTitle>
            <CardDescription style={{fontFamily: 'Lato, sans-serif'}}>
              Password reset instructions have been sent
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <Mail className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                We've sent password reset instructions to <strong>{getValues('email')}</strong>
              </AlertDescription>
            </Alert>

            <div className="text-sm text-gray-600 space-y-2">
              <p>Please check your email and follow the instructions to reset your password.</p>
              <p>If you don't see the email in your inbox, please check your spam folder.</p>
            </div>

            <div className="space-y-3 pt-4">
              <Button
                onClick={handleBackToLogin}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
              
              <Button
                onClick={() => setIsSubmitted(false)}
                variant="ghost"
                className="w-full text-[#3B2352]"
              >
                Send Another Email
              </Button>
            </div>

            <div className="text-center text-xs text-gray-500 pt-4 border-t">
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-3 w-3" />
                <span>HIPAA Compliant • Secure Password Reset</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#D7C7ED]/10 to-white p-4">
      <Card className="w-full max-w-md border-[#3B2352]/20 shadow-lg">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-8 w-8 text-[#3B2352]" />
            <span className="text-2xl font-bold text-[#3B2352]" style={{fontFamily: 'Merriweather, serif'}}>
              Snugs & Kisses
            </span>
          </div>
          <CardTitle className="text-2xl font-semibold" style={{fontFamily: 'Merriweather, serif'}}>
            Reset Password
          </CardTitle>
          <CardDescription style={{fontFamily: 'Lato, sans-serif'}}>
            Enter your email address and we'll send you a secure reset link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {errorMessage && (
              <Alert className="border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email Address
              </Label>
              <Input
                {...register('email')}
                id="email"
                type="email"
                placeholder="you@example.com"
                className="border-[#D7C7ED]/50 focus:border-[#3B2352]"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <Shield className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                For your security, the reset link will expire in 1 hour and can only be used once.
              </AlertDescription>
            </Alert>

            <Button
              type="submit"
              className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Reset Link
                </>
              )}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBackToLogin}
                className="text-[#3B2352] hover:bg-[#D7C7ED]/20"
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Button>
            </div>
          </form>

          <div className="text-center text-xs text-gray-500 pt-6 border-t mt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Shield className="h-3 w-3" />
                <span>HIPAA Compliant • 256-bit Encryption</span>
              </div>
              <p>
                Password reset requests are logged for security and audit purposes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}