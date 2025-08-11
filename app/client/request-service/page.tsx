import { ServiceRequestWizard } from "@/components/client/service-request-wizard"
import { Heart } from "lucide-react"

export default function RequestServicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8F6FF] to-[#E8E3FF] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-[#3B2352]" />
            <h1 className="text-4xl font-bold text-[#3B2352]" style={{ fontFamily: "Merriweather, serif" }}>
              Request Care Services
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-2">
            Let us help you find the perfect care solution for your family
          </p>
        </div>

        <ServiceRequestWizard />
      </div>
    </div>
  )
}