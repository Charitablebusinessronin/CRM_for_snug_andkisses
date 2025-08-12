"use client"

import { useRouter } from "next/navigation"

export default function PreferencesPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push("/client/dashboard")}
          className="mb-6 text-blue-600 hover:text-blue-800"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <h1 className="text-2xl font-semibold mb-4">Preferences</h1>
          <div className="bg-blue-50 p-6 rounded-lg">
            <p className="text-gray-600 mb-4">
              Manage your notification and communication preferences here soon.
            </p>
            <p className="text-sm text-gray-500">
              This feature will be available shortly.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


