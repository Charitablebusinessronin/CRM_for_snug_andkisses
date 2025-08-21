import { EmployeePortal } from "@/components/employee-portal"

/**
 * Employee Dashboard Page
 * Main entry point for employee portal with client management, scheduling, and notes
 * @returns {JSX.Element} The employee dashboard page
 */
export default function EmployeePage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <EmployeePortal />
    </div>
  )
}