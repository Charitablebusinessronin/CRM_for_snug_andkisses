
"use client"

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

  useEffect(() => {
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
          }
          document.head.appendChild(script2)
        }
        
        document.head.appendChild(script1)
      } else if (window.catalyst) {
        initializeCatalystAuth()
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
        } catch (error) {
          console.error('Catalyst authentication initialization error:', error)
        }
      }
    }

    loadCatalystSDK()
  }, [])

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
          
          <div className="text-center text-sm text-[#3B2352]/60" style={{ fontFamily: 'Lato' }}>
            Protected by enterprise-grade security
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
