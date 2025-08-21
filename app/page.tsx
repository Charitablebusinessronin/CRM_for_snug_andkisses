import { UnifiedDashboard } from "@/components/unified-dashboard"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, Users, Briefcase, Shield } from "lucide-react"
import Link from "next/link"

/**
 * The main entry point of the application - Zoho One-like Business Suite
 * @returns {JSX.Element} The unified business dashboard.
 */
export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D7C7ED]/20 to-[#3B2352]/10">
      {/* Navigation Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Heart className="h-8 w-8 text-[#3B2352]" />
            <h1 className="text-2xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
              Snug & Kisses CRM
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/login">
              <Button variant="outline" className="border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[#3B2352] mb-4" style={{ fontFamily: "Merriweather, serif" }}>
            Welcome to Your CRM Portal
          </h2>
          <p className="text-xl text-gray-600">
            Choose your role to access your personalized dashboard
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Admin Portal */}
          <Card className="border-[#3B2352]/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Shield className="h-16 w-16 text-[#3B2352] mx-auto mb-4" />
              <CardTitle className="text-2xl text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                Administrator
              </CardTitle>
              <CardDescription>
                Complete business management and oversight
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/admin/dashboard">
                <Button className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">
                  Access Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Employee Portal */}
          <Card className="border-[#3B2352]/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Users className="h-16 w-16 text-[#3B2352] mx-auto mb-4" />
              <CardTitle className="text-2xl text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                Employee
              </CardTitle>
              <CardDescription>
                Client management, scheduling, and documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/employee/dashboard">
                <Button className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">
                  Access Employee Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Contractor Portal */}
          <Card className="border-[#3B2352]/20 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Briefcase className="h-16 w-16 text-[#3B2352] mx-auto mb-4" />
              <CardTitle className="text-2xl text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
                Contractor
              </CardTitle>
              <CardDescription>
                Job opportunities, shifts, and profile management
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/contractor/dashboard">
                <Button className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white">
                  Access Contractor Portal
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
