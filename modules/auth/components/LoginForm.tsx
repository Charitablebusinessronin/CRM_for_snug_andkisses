"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Eye, EyeOff, Lock, Mail, Heart, Shield, 
  AlertCircle, CheckCircle, Loader2
} from "lucide-react"
import { AuthService } from "../services/AuthService"
import { ValidationUtils } from "../../shared/utils/validation"
import type { LoginCredentials, AuthResponse } from "../types/AuthTypes"

/**
 * Login Form Component - HIPAA Compliant Healthcare Authentication
 * Provides secure login with audit logging and MFA support
 */
export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")
  const [emailErrors, setEmailErrors] = useState<string[]>([])
  const [passwordErrors, setPasswordErrors] = useState<string[]>([])

  const authService = new AuthService()

  const validateEmail = (email: string) => {
    const errors = []
    if (!email.trim()) {
      errors.push("Email is required")
    } else if (!ValidationUtils.isValidEmail(email)) {
      errors.push("Please enter a valid email address")
    }
    setEmailErrors(errors)
    return errors.length === 0
  }

  const validatePassword = (password: string) => {
    const errors = ValidationUtils.validatePassword(password)
    setPasswordErrors(errors)
    return errors.length === 0
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value
    setEmail(newEmail)
    
    // Clear previous errors
    if (emailErrors.length > 0) {
      validateEmail(newEmail)
    }
    
    // Clear global error state
    if (error) {
      setError("")
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value
    setPassword(newPassword)
    
    // Clear previous errors
    if (passwordErrors.length > 0) {
      validatePassword(newPassword)
    }
    
    // Clear global error state
    if (error) {
      setError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous states
    setError("")
    setSuccess("")
    
    // Validate form
    const isEmailValid = validateEmail(email)
    const isPasswordValid = validatePassword(password)
    
    if (!isEmailValid || !isPasswordValid) {
      setError("Please correct the errors above")
      return
    }

    try {
      setLoading(true)
      
      const credentials: LoginCredentials = {
        email: email.trim().toLowerCase(),
        password,
        rememberMe
      }

      const clientInfo = {
        ipAddress: '192.168.1.1', // TODO: Get actual IP
        userAgent: navigator.userAgent
      }

      const response: AuthResponse = await authService.authenticateUser(credentials, clientInfo)
      
      if (response.success && response.user) {
        setSuccess("Login successful! Redirecting...")
        
        // Store auth token securely
        if (rememberMe) {
          localStorage.setItem('snug_auth_token', response.token!)
        } else {
          sessionStorage.setItem('snug_auth_token', response.token!)
        }

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
        
      } else if (response.requiresMFA) {
        // Redirect to MFA verification
        sessionStorage.setItem('mfa_token', response.mfaToken!)
        window.location.href = '/auth/mfa'
        
      } else {
        setError(response.error || "Login failed. Please check your credentials.")
      }
      
    } catch (error) {
      console.error('Login error:', error)
      setError("An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = () => {
    // TODO: Implement forgot password flow
    window.location.href = '/auth/forgot-password'
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="h-12 w-12 text-[#3B2352]" />
          </div>
          <h1 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
            Snug & Kisses
          </h1>
          <p className="text-gray-600 mt-2">Healthcare Portal Login</p>
        </div>

        {/* HIPAA Compliance Notice */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-blue-600 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 text-sm">HIPAA Secure Portal</h4>
                <p className="text-blue-800 text-xs">
                  This is a secure healthcare portal. All access is logged and monitored for compliance.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Login Form */}
        <Card className="border-[#3B2352]/20">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center" style={{ fontFamily: "Merriweather, serif" }}>
              Sign In
            </CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your healthcare portal
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Global Success Message */}
              {success && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              {/* Global Error Message */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={handleEmailChange}
                    className={`pl-10 ${emailErrors.length > 0 ? 'border-red-300 focus:border-red-500' : ''}`}
                    disabled={loading}
                    autoComplete="email"
                    required
                  />
                </div>
                {emailErrors.length > 0 && (
                  <div className="space-y-1">
                    {emailErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={handlePasswordChange}
                    className={`pl-10 pr-10 ${passwordErrors.length > 0 ? 'border-red-300 focus:border-red-500' : ''}`}
                    disabled={loading}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {passwordErrors.length > 0 && (
                  <div className="space-y-1">
                    {passwordErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-600">{error}</p>
                    ))}
                  </div>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    disabled={loading}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-[#3B2352] hover:underline"
                  disabled={loading}
                >
                  Forgot password?
                </button>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-[#3B2352] text-white hover:bg-[#2A1A3E]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                New patient?{" "}
                <a href="/auth/register" className="text-[#3B2352] hover:underline font-medium">
                  Create an account
                </a>
              </p>
              <p className="text-xs text-gray-500">
                Having trouble signing in?{" "}
                <a href="/support" className="text-[#3B2352] hover:underline">
                  Contact support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>© 2025 Snug & Kisses Healthcare. All rights reserved.</p>
          <p>
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            {" • "}
            <a href="/terms" className="hover:underline">Terms of Service</a>
            {" • "}
            <a href="/hipaa" className="hover:underline">HIPAA Notice</a>
          </p>
        </div>
      </div>
    </div>
  )
}