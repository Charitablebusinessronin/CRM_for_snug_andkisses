"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ContractorPortal } from "./contractor-portal"
import { ClientPortal } from "./client-portal"
import { AdminDashboard } from "./admin-dashboard"
import { EmployeePortal } from "./employee-portal"

/**
 * A component that demonstrates the different dashboard views available in the CRM.
 * It uses tabs to switch between the contractor, client, admin, and employee portals.
 * @returns {JSX.Element} The dashboard demo component.
 */
export function DashboardDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D7C7ED]/10 to-white">
      <div className="container mx-auto p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-[#3B2352] mb-2" style={{ fontFamily: "Merriweather, serif" }}>
            Snugs and Kisses CRM
          </h1>
          <p className="text-lg text-[#3B2352]/70" style={{ fontFamily: "Lato, sans-serif" }}>
            Guarding your rest, cherishing your family
          </p>
        </div>

        <Tabs defaultValue="contractor" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8 bg-[#D7C7ED]/20">
            <TabsTrigger
              value="contractor"
              className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white"
              style={{ fontFamily: "Nunito Sans, sans-serif" }}
            >
              Contractor Portal
            </TabsTrigger>
            <TabsTrigger
              value="client"
              className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white"
              style={{ fontFamily: "Nunito Sans, sans-serif" }}
            >
              Client Portal
            </TabsTrigger>
            <TabsTrigger
              value="admin"
              className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white"
              style={{ fontFamily: "Nunito Sans, sans-serif" }}
            >
              Admin Dashboard
            </TabsTrigger>
            <TabsTrigger
              value="employee"
              className="data-[state=active]:bg-[#3B2352] data-[state=active]:text-white"
              style={{ fontFamily: "Nunito Sans, sans-serif" }}
            >
              Employee Portal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contractor">
            <ContractorPortal />
          </TabsContent>

          <TabsContent value="client">
            <ClientPortal />
          </TabsContent>

          <TabsContent value="admin">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="employee">
            <EmployeePortal />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
