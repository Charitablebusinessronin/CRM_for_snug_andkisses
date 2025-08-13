
"use client"

import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

declare global {
  interface Window {
    catalyst: {
      auth: {
        signIn: (elementId: string, config: any) => void
        signOut: () => void
        isUserSignedIn: () => Promise<boolean>
        getCurrentUser: () => Promise<any>
      }
    }
  }
}

export default function CatalystAuthLogin() {
  const loginDivRef = useRef<HTMLDivElement>(null)
  const forgotPasswordDivRef = useRef<HTMLDivElement>(null)
  const [catalystLoaded, setCatalystLoaded] = useState(false)
  const [showFallback, setShowFallback] = useState(false)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('CLIENT')

  useEffect(() => {
    // Set timeout to show fallback if Catalyst doesn't load
    const fallbackTimer = setTimeout(() => {
      if (!catalystLoaded) {
        setShowFallback(true)
      }
    }, 3000)

    // Load Catalyst SDK
    const loadCatalystSDK = () => {
      if (typeof window !== 'undefined' && !window.catalyst) {
        const script1 = document.createElement('script')
        script1.src = 'https://static.zohocdn.com/catalyst/sdk/js/1.0/catalyst-sdk.js'
        script1.async = true
        
        const script2 = document.createElement('script')
        script2.src = '/__catalyst/sdk/init.js'
        script2.async = true

        script1.onload = () => {
          script2.onload = () => {
            initializeCatalystAuth()
            clearTimeout(fallbackTimer)
          }
          script2.onerror = () => {
            console.warn('Catalyst init script failed to load, showing fallback')
            setShowFallback(true)
            clearTimeout(fallbackTimer)
          }
          document.head.appendChild(script2)
        }
        
        script1.onerror = () => {
          console.warn('Catalyst SDK failed to load, showing fallback')
          setShowFallback(true)
          clearTimeout(fallbackTimer)
        }
        
        document.head.appendChild(script1)
      } else if (window.catalyst) {
        initializeCatalystAuth()
        clearTimeout(fallbackTimer)
      }
    }

    const initializeCatalystAuth = () => {
      if (window.catalyst && loginDivRef.current) {
        const config = {
          css_url: "/css/embeddediframe.css",
          service_url: "/client/dashboard",
          is_customize_forgot_password: true,
          forgot_password_id: "forgotPasswordDiv",
          forgot_password_css_url: "/css/forgotPwd.css"
        }
        
        try {
          window.catalyst.auth.signIn("loginDiv", config)
          setCatalystLoaded(true)
        } catch (error) {
          console.error('Catalyst authentication initialization error:', error)
          setShowFallback(true)
        }
      }
    }

    loadCatalystSDK()
    
    return () => clearTimeout(fallbackTimer)
  }, [catalystLoaded])

  const handleFallbackLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role }),
      })
      
      if (response.ok) {
        window.location.href = '/client/dashboard'
      } else {
        console.error('Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3B2352] to-[#D7C7ED] p-4">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-8">
          <div className="mx-auto w-16 h-16 bg-[#3B2352] rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-[#D7C7ED]" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-[#3B2352]" style={{ fontFamily: 'Merriweather' }}>
            Snug & Kisses
          </CardTitle>
          <CardDescription className="text-[#3B2352]/70" style={{ fontFamily: 'Lato' }}>
            Guarding your rest. Cherishing your family.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Catalyst Login Container */}
          <div id="loginDiv" ref={loginDivRef} className="w-full"></div>
          
          {/* Catalyst Forgot Password Container */}
          <div id="forgotPasswordDiv" ref={forgotPasswordDivRef} className="w-full"></div>
          
          {/* Fallback Login Form */}
          {showFallback && (
            <div className="space-y-6">
              <form onSubmit={handleFallbackLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-[#3B2352] font-medium">Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 border border-[#D7C7ED] rounded-md focus:border-[#3B2352] focus:ring-1 focus:ring-[#3B2352] focus:outline-none"
                    required
                  >
                    <option value="CLIENT">Client</option>
                    <option value="EMPLOYEE">Employee</option>
                    <option value="CONTRACTOR">Contractor</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#3B2352] font-medium">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-[#D7C7ED] focus:border-[#3B2352] focus:ring-[#3B2352]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#3B2352] font-medium">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-[#D7C7ED] focus:border-[#3B2352] focus:ring-[#3B2352]"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-[#3B2352] hover:bg-[#2a1a3d] text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </Button>
                <div className="text-center">
                  <a href="/auth/forgot-password" className="text-[#3B2352] hover:text-[#D4AF37] text-sm underline">
                    Forgot your password?
                  </a>
                </div>
              </form>

              {/* New Client Registration Section */}
              <div className="text-center mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-xl font-semibold text-[#3B2352] mb-3" style={{ fontFamily: "Merriweather, serif" }}>
                  New to Snug & Kisses?
                </h3>
                <p className="text-gray-600 mb-5">
                  Join our family of expectant and new parents. Get access to professional doula services,
                  postpartum care, lactation support, and personalized care coordination.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                  <a href="/register">
                    <Button size="lg" className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#3B2352] font-semibold px-6 py-2.5 w-full sm:w-auto">
                      Register as New Client
                    </Button>
                  </a>
                  <a href="/auth/signin">
                    <Button variant="outline" size="lg" className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white px-6 py-2.5 w-full sm:w-auto">
                      Existing User Sign In
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          )}
          
          <div className="text-center text-sm text-[#3B2352]/60" style={{ fontFamily: 'Lato' }}>
            Protected by enterprise-grade security
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
