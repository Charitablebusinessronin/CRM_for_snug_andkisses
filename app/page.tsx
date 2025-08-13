
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Users, Calendar, FileText, BarChart, Heart } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <Heart className="h-12 w-12 text-pink-600 mr-4" />
            <h1 className="text-4xl font-bold text-gray-800">Snugs & Kisses CRM</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            HIPAA-compliant healthcare services management system for postpartum care, 
            birth doula services, and childcare coordination.
          </p>
        </header>

        {/* Quick Access Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-6 w-6 mr-2 text-blue-600" />
                Admin Dashboard
              </CardTitle>
              <CardDescription>
                System management and oversight
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/dashboard">
                <Button className="w-full">Access Admin</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2 text-green-600" />
                Employee Portal
              </CardTitle>
              <CardDescription>
                Client management and scheduling
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/employee/dashboard">
                <Button className="w-full">Employee Access</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-purple-600" />
                Contractor Portal
              </CardTitle>
              <CardDescription>
                Job board and shift management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/contractor/dashboard">
                <Button className="w-full">Contractor Access</Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart className="h-6 w-6 mr-2 text-orange-600" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-gray-600">Authentication</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-gray-600">HIPAA Compliance</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">◯</div>
                <div className="text-sm text-gray-600">Zoho Integration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">✓</div>
                <div className="text-sm text-gray-600">Docker Ready</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Overview */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>🔐 Security Features</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Multi-role authentication (Admin, Employee, Contractor, Client)</li>
                <li>• HIPAA-compliant audit logging</li>
                <li>• JWT token management with rotation</li>
                <li>• Role-based access control</li>
                <li>• Session timeout for compliance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>🚀 Technical Stack</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• Next.js 15.2.4 with App Router</li>
                <li>• React 19 with TypeScript</li>
                <li>• Tailwind CSS + shadcn/ui</li>
                <li>• Zoho CRM Integration Ready</li>
                <li>• Docker containerization</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Login Section */}
        <div className="text-center mt-12">
          <Link href="/auth/signin">
            <Button size="lg" className="px-8 py-4 text-lg">
              Sign In to System
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500 text-sm">
          <p>Snugs & Kisses CRM v1.0.0 MVP - HIPAA Compliant Healthcare Services Management</p>
          <p className="mt-2">Running on Replit - Port 5000</p>
        </footer>
      </div>
    </div>
  )
}
