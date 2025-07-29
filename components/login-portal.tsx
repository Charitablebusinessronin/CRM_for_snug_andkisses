"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, User, Briefcase, Home, Baby } from "lucide-react"

interface LoginPortalProps {
  onLogin: (userType: string) => void
}

export function LoginPortal({ onLogin }: LoginPortalProps) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("admin") // Default to admin
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const validCredentials: { [key: string]: { username: string; password: string } } = {
      admin: { username: "admin", password: "admin" },
      contractor: { username: "contractor", password: "contractor" },
      client: { username: "client", password: "client" },
      employee: { username: "employee", password: "employee" },
    }

    if (
      validCredentials[role] &&
      username === validCredentials[role].username &&
      password === validCredentials[role].password
    ) {
      onLogin(role)
    } else {
      setError("Invalid username or password for the selected role.")
    }
    setLoading(false)
  }

  const quickLogin = (userType: string) => {
    const credentials = {
      admin: { username: "admin", password: "admin" },
      contractor: { username: "contractor", password: "contractor" },
      client: { username: "client", password: "client" },
      employee: { username: "employee", password: "employee" },
    }
    setUsername(credentials[userType].username)
    setPassword(credentials[userType].password)
    setRole(userType)
    // Automatically attempt login after setting credentials
    setTimeout(() => onLogin(userType), 100) // Small delay to allow state update
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#D7C7ED]/10 p-4">
      <Card className="w-full max-w-md border-[#3B2352]/20 bg-white shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
            Snugs and Kisses CRM
          </CardTitle>
          <CardDescription className="text-gray-600" style={{ fontFamily: "Lato, sans-serif" }}>
            Professional doula and childcare services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="role" className="text-[#3B2352]">
                Login As
              </Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger id="role" className="border-[#D7C7ED] text-[#3B2352]">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[#3B2352]" /> Admin (Owner)
                    </div>
                  </SelectItem>
                  <SelectItem value="contractor">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-[#3B2352]" /> Contractor (Sitter/Doula)
                    </div>
                  </SelectItem>
                  <SelectItem value="client">
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-[#3B2352]" /> Client
                    </div>
                  </SelectItem>
                  <SelectItem value="employee">
                    <div className="flex items-center gap-2">
                      <Baby className="h-4 w-4 text-[#3B2352]" /> Employee (Internal Staff)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="username" className="text-[#3B2352]">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-[#D7C7ED] focus:border-[#3B2352]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password" className="text-[#3B2352]">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-[#D7C7ED] focus:border-[#3B2352]"
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full bg-[#3B2352] hover:bg-[#3B2352]/90 text-white" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Login
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-gray-600">
            <p className="mb-2">Quick Login (for demo):</p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={() => quickLogin("admin")} className="border-[#D7C7ED] text-[#3B2352]">
                Admin
              </Button>
              <Button
                variant="outline"
                onClick={() => quickLogin("contractor")}
                className="border-[#D7C7ED] text-[#3B2352]"
              >
                Contractor
              </Button>
              <Button
                variant="outline"
                onClick={() => quickLogin("client")}
                className="border-[#D7C7ED] text-[#3B2352]"
              >
                Client
              </Button>
              <Button
                variant="outline"
                onClick={() => quickLogin("employee")}
                className="border-[#D7C7ED] text-[#3B2352]"
              >
                Employee
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
