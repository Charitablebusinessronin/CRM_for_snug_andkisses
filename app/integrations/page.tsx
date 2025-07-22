import { ZohoSync } from "@/components/integrations/zoho-sync"

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D7C7ED]/10 to-white">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#3B2352] mb-2" style={{ fontFamily: "Merriweather, serif" }}>
            Integrations
          </h1>
          <p className="text-lg text-[#3B2352]/70" style={{ fontFamily: "Lato, sans-serif" }}>
            Manage your Zoho and third-party integrations
          </p>
        </div>
        <ZohoSync />
      </div>
    </div>
  )
}
