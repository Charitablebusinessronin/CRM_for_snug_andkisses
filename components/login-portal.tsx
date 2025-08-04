"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Lock, User, Shield, Baby, Users } from "lucide-react"

interface LoginPortalProps {
  onLogin: (username: string, role: "admin" | "contractor" | "client" | "employee", name: string) => void
}

export function LoginPortal({ onLogin }: LoginPortalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [selectedRole, setSelectedRole] = useState<"admin" | "contractor" | "client" | "employee">("admin")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Dummy credentials
  const credentials = {
    admin: { username: "admin", password: "admin", name: "Sabir (Owner)" },
    contractor: { username: "contractor", password: "contractor", name: "Jessica Davis" },
    client: { username: "client", password: "client", name: "Sarah Mitchell" },
    employee: { username: "employee", password: "employee", name: "Maria Rodriguez" },
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const cred = credentials[selectedRole]
    if (username === cred.username && password === cred.password) {
      onLogin(username, selectedRole, cred.name)
    } else {
      setError("Invalid credentials. Please check your username and password.")
    }

    setIsLoading(false)
  }

  const quickLogin = (role: "admin" | "contractor" | "client" | "employee") => {
    const cred = credentials[role]
    setUsername(cred.username)
    setPassword(cred.password)
    setSelectedRole(role)
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="h-5 w-5" />
      case "contractor":
        return <Heart className="h-5 w-5" />
      case "client":
        return <Baby className="h-5 w-5" />
      case "employee":
        return <Users className="h-5 w-5" />
      default:
        return <User className="h-5 w-5" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white"
      case "contractor":
        return "border-[#3B2352] text-[#3B2352] hover:bg-[#3B2352] hover:text-white"
      case "client":
        return "border-[#D7C7ED] text-[#3B2352] hover:bg-[#D7C7ED] hover:text-[#3B2352]"
      case "employee":
        return "border-[#3B2352]/70 text-[#3B2352] hover:bg-[#3B2352]/70 hover:text-white"
      default:
        return "border-gray-300 text-gray-600"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D7C7ED]/10 to-white flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-[#3B2352]" />
            <h1 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
              Snugs & Kisses
            </h1>
          </div>
          <p className="text-lg text-[#3B2352]/70" style={{ fontFamily: "Dancing Script, cursive" }}>
            Guarding your rest, cherishing your family
          </p>
        </div>

        {/* Login Form */}
        <Card className="border-[#3B2352]/20 shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2" style={{ fontFamily: "Merriweather, serif" }}>
              <Lock className="h-5 w-5 text-[#3B2352]" />
              Sign In
            </CardTitle>
            <CardDescription style={{ fontFamily: "Lato, sans-serif" }}>
              Access your personalized portal
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="role" style={{ fontFamily: "Lato, sans-serif" }}>
                  Role
                </Label>
                <Select
                  value={selectedRole}
                  onValueChange={(value: "admin" | "contractor" | "client" | "employee") => setSelectedRole(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Admin/Owner
                      </div>
                    </SelectItem>
                    <SelectItem value="contractor">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Contractor (Doula/Sitter)
                      </div>
                    </SelectItem>
                    <SelectItem value="client">
                      <div className="flex items-center gap-2">
                        <Baby className="h-4 w-4" />
                        Client
                      </div>
                    </SelectItem>
                    <SelectItem value="employee">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Employee
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="username" style={{ fontFamily: "Lato, sans-serif" }}>
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>

              <div>
                <Label htmlFor="password" style={{ fontFamily: "Lato, sans-serif" }}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>

              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="border-[#D7C7ED]/50">
          <CardHeader>
            <CardTitle className="text-sm" style={{ fontFamily: "Merriweather, serif" }}>
              Demo Credentials
            </CardTitle>
            <CardDescription className="text-xs">Click any button below to auto-fill credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(credentials).map(([role, cred]) => (
                <Button
                  key={role}
                  variant="outline"
                  size="sm"
                  onClick={() => quickLogin(role as "admin" | "contractor" | "client" | "employee")}
                  className={`flex items-center gap-2 text-xs ${getRoleColor(role)}`}
                >
                  {getRoleIcon(role)}
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Button>
              ))}
            </div>
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <div>
                <strong>Admin:</strong> admin / admin
              </div>
              <div>
                <strong>Contractor:</strong> contractor / contractor
              </div>
              <div>
                <strong>Client:</strong> client / client
              </div>
              <div>
                <strong>Employee:</strong> employee / employee
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500">
          <p>© 2024 Snugs and Kisses CRM. All rights reserved.</p>
          <p className="mt-1">Built with care for families and caregivers</p>
        </div>
      </div>
    </div>
  )
}
