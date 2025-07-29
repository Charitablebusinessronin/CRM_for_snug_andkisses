import { ContractorPortal } from "@/components/contractor-portal"

/**
 * Contractor Dashboard Page
 * Main entry point for contractor portal with job board, shifts, and profile
 * @returns {JSX.Element} The contractor dashboard page
 */
export default function ContractorPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <ContractorPortal />
    </div>
  )
}