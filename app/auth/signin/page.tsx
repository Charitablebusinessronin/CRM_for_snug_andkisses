"use client"

import { Suspense } from "react"
import { EnhancedLoginForm } from "@/components/auth/enhanced-login-form"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function SignInPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3B2352] to-[#D7C7ED]" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Snug & Kisses CRM
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              "This healthcare CRM has revolutionized how we manage our client relationships 
              while maintaining the highest standards of HIPAA compliance."
            </p>
            <footer className="text-sm">Healthcare Administrator</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <Suspense fallback={
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          }>
            <EnhancedLoginForm />
          </Suspense>

          {/* New Client Registration Section (CTA) */}
          <div className="text-center mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-[#3B2352] mb-3" style={{ fontFamily: "Merriweather, serif" }}>
              New to Snug & Kisses?
            </h3>
            <p className="text-gray-600 mb-5">
              Join our family of expectant and new parents. Get access to professional doula services,
              postpartum care, lactation support, and personalized care coordination.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/register">
                <Button size="lg" className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-[#3B2352] font-semibold px-6 py-2.5 w-full sm:w-auto">
                  Register as New Client
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button variant="outline" size="lg" className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white px-6 py-2.5 w-full sm:w-auto">
                  Existing User Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
