
"use client"

import { useEffect, useState } from 'react'
import { CatalystAuth, CatalystUser } from '@/lib/catalyst-auth'
import UnifiedDashboard from '@/components/unified-dashboard'
import CatalystAuthLogin from '@/components/auth/catalyst-auth-login'

export default function HomePage() {
  const [user, setUser] = useState<CatalystUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const currentUser = await CatalystAuth.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Auth check error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#3B2352] to-[#D7C7ED]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white" style={{ fontFamily: 'Lato' }}>Loading...</p>
        </div>
      </div>
    )
  }

  // Show login if not authenticated
  if (!user) {
    return <CatalystAuthLogin />
  }

  // Show dashboard if authenticated
  return <UnifiedDashboard />
}
