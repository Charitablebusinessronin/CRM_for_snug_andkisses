"use client"

import { useState } from "react"
import { LoginPortal } from "./login-portal"
import AdminDashboard from "./admin-dashboard"
import ContractorPortal from "./contractor-portal"
import { ClientPortal } from "./client-portal" // Corrected import
import EmployeePortal from "./employee-portal"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function DashboardDemo() {
  const [loggedInUser, setLoggedInUser] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("admin") // Default tab for admin view

  const handleLogin = (userType: string) => {
    setLoggedInUser(userType)
    // Set initial tab based on user type
    if (userType === "admin") {
      setActiveTab("admin")
    } else if (userType === "contractor") {
      setActiveTab("contractor")
    } else if (userType === "client") {
      setActiveTab("client")
    } else if (userType === "employee") {
      setActiveTab("employee")
    }
  }

  const handleLogout = () => {
    setLoggedInUser(null)
    setActiveTab("admin") // Reset to default or login view
  }

  if (!loggedInUser) {
    return <LoginPortal onLogin={handleLogin} />
  }

  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-primary px-4 md:px-6 justify-between">
        <h1 className="text-xl font-semibold text-primary-foreground">Snugs and Kisses CRM</h1>
        <div className="flex items-center gap-4">
          <span className="text-primary-foreground text-sm">Logged in as: {loggedInUser}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-primary-foreground">
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
        {loggedInUser === "admin" ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-[#D7C7ED]/20">
              <TabsTrigger value="admin" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
                Admin Dashboard
              </TabsTrigger>
              <TabsTrigger
                value="contractor"
                className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white"
              >
                Contractor Portal
              </TabsTrigger>
              <TabsTrigger value="client" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
                Client Portal
              </TabsTrigger>
              <TabsTrigger value="employee" className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white">
                Employee Portal
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
        ) : loggedInUser === "contractor" ? (
          <ContractorPortal />
        ) : loggedInUser === "client" ? (
          <ClientPortal />
        ) : loggedInUser === "employee" ? (
          <EmployeePortal />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Welcome</CardTitle>
            </CardHeader>
            <CardContent>Please select a role to view the dashboard.</CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
