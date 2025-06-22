"use client"
import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContractorPortal } from "./contractor-portal"
import { ClientPortal } from "./client-portal"
import { AdminDashboard } from "./admin-dashboard"
import { EmployeePortal } from "./employee-portal"
import { LoginPortal } from "./login-portal"

export function DashboardDemo() {
  const [user, setUser] = useState<{
    username: string
    role: "admin" | "contractor" | "client" | "employee"
    name: string
  } | null>(null)

  const handleLogin = (username: string, role: "admin" | "contractor" | "client" | "employee", name: string) => {
    setUser({ username, role, name })
  }

  const handleLogout = () => {
    setUser(null)
  }

  if (!user) {
    return <LoginPortal onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D7C7ED]/10 to-white">
      <div className="container mx-auto p-6">
        <div className="mb-8 flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-4xl font-bold text-[#3B2352] mb-2" style={{ fontFamily: "Merriweather, serif" }}>
              Snugs and Kisses CRM
            </h1>
            <p className="text-lg text-[#3B2352]/70" style={{ fontFamily: "Lato, sans-serif" }}>
              Guarding your rest, cherishing your family
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Welcome, {user.name}</p>
            <button onClick={handleLogout} className="text-sm text-[#3B2352] hover:underline">
              Logout
            </button>
          </div>
        </div>

        {user.role === "admin" && (
          <Tabs defaultValue="admin" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-8 bg-[#D7C7ED]/20">
              <TabsTrigger
                value="admin"
                className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
              >
                Admin Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="contractor"
                className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
              >
                Contractor View
              </TabsTrigger>
              <TabsTrigger
                value="client"
                className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
              >
                Client View
              </TabsTrigger>
              <TabsTrigger
                value="employee"
                className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white"
                style={{ fontFamily: "Nunito Sans, sans-serif" }}
              >
                Employee View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="admin">
              <AdminDashboard />
            </TabsContent>
            <TabsContent value="contractor">
              <ContractorPortal />
            </TabsContent>
            <TabsContent value="client">
              <ClientPortal />
            </TabsContent>
            <TabsContent value="employee">
              <EmployeePortal />
            </TabsContent>
          </Tabs>
        )}

        {user.role === "contractor" && <ContractorPortal />}
        {user.role === "client" && <ClientPortal />}
        {user.role === "employee" && <EmployeePortal />}
      </div>
    </div>
  )
}
