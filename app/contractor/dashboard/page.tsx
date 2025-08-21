import { ContractorPortal } from "@/components/contractor-portal"

/**
 * Contractor Dashboard Page
 * Dedicated dashboard view for contractor portal functionality
 * @returns {JSX.Element} The contractor dashboard
 */
export default function ContractorDashboardPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
          Contractor Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Manage your jobs, shifts, and professional profile
        </p>
      </div>
      <ContractorPortal />
    </div>
  )
}