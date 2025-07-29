import { EmployeePortal } from "@/components/employee-portal"

/**
 * Employee Dashboard Page
 * Dedicated dashboard view for employee portal functionality
 * @returns {JSX.Element} The employee dashboard
 */
export default function EmployeeDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
          Employee Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your clients, schedule, and shift documentation
        </p>
      </div>
      <EmployeePortal />
    </div>
  )
}